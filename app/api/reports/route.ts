import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/permissions";
import { UserRole, Prisma } from "@/lib/generated/prisma/client";
import { generateVoCReportWithGroq, VoCReportStats } from "@/lib/services/ai";

// ─── GET /api/reports ─────────────────────────────────────────────────────────
export async function GET() {
  try {
    const session = await requireRole([
      UserRole.ADMIN,
      UserRole.ANALYST,
      UserRole.VIEWER,
    ]);
    const workspaceId = session.user.workspaceId;

    const reports = await prisma.report.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      include: {
        generatedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ data: reports });
  } catch (err: any) {
    const status = err?.statusCode ?? 500;
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status }
    );
  }
}

// ─── POST /api/reports ────────────────────────────────────────────────────────
const createReportSchema = z.object({
  title: z.string().min(1).max(200),
  periodStart: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  periodEnd: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole([UserRole.ADMIN, UserRole.ANALYST]);
    const workspaceId = session.user.workspaceId;
    const userId = session.user.id;

    const body = await req.json();
    const parsed = createReportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { title, periodStart: periodStartStr, periodEnd: periodEndStr } = parsed.data;

    // Normalize to Date objects — handle both ISO and YYYY-MM-DD
    const periodStart = new Date(periodStartStr.includes("T") ? periodStartStr : `${periodStartStr}T00:00:00.000Z`);
    const periodEnd = new Date(periodEndStr.includes("T") ? periodEndStr : `${periodEndStr}T23:59:59.999Z`);

    if (periodStart >= periodEnd) {
      return NextResponse.json(
        { error: "periodEnd must be after periodStart" },
        { status: 400 }
      );
    }

    // ── Pre-compute statistics from real data ──────────────────────────────
    // Current period feedback
    const currentFeedback = await prisma.feedback.findMany({
      where: {
        workspaceId,
        createdAt: { gte: periodStart, lte: periodEnd },
      },
      select: {
        id: true,
        content: true,
        channel: true,
        sentiment: true,
        sentimentScore: true,
        createdAt: true,
        themes: {
          include: { theme: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalFeedback = currentFeedback.length;

    // Sentiment breakdown
    const sentimentBreakdown = {
      positive: currentFeedback.filter((f) => f.sentiment === "POSITIVE").length,
      neutral: currentFeedback.filter((f) => f.sentiment === "NEUTRAL").length,
      negative: currentFeedback.filter((f) => f.sentiment === "NEGATIVE").length,
    };

    // Prior period (same duration, immediately before)
    const durationMs = periodEnd.getTime() - periodStart.getTime();
    const priorStart = new Date(periodStart.getTime() - durationMs);
    const priorEnd = new Date(periodStart.getTime() - 1);

    const priorFeedback = await prisma.feedback.findMany({
      where: {
        workspaceId,
        createdAt: { gte: priorStart, lte: priorEnd },
      },
      select: { sentiment: true },
    });

    let sentimentDelta: VoCReportStats["sentimentDelta"] = null;
    if (priorFeedback.length > 0) {
      const priorPos = priorFeedback.filter((f) => f.sentiment === "POSITIVE").length;
      const priorNeg = priorFeedback.filter((f) => f.sentiment === "NEGATIVE").length;
      const priorTotal = priorFeedback.length;
      const curPos = totalFeedback > 0 ? Math.round((sentimentBreakdown.positive / totalFeedback) * 100) : 0;
      const curNeg = totalFeedback > 0 ? Math.round((sentimentBreakdown.negative / totalFeedback) * 100) : 0;
      const prevPos = priorTotal > 0 ? Math.round((priorPos / priorTotal) * 100) : 0;
      const prevNeg = priorTotal > 0 ? Math.round((priorNeg / priorTotal) * 100) : 0;
      sentimentDelta = {
        positiveChange: curPos - prevPos,
        negativeChange: curNeg - prevNeg,
      };
    }

    // Top themes by count in period
    const themeCountMap: Record<string, { name: string; currentCount: number }> = {};
    for (const f of currentFeedback) {
      for (const ft of f.themes) {
        const name = ft.theme.name;
        if (!themeCountMap[name]) themeCountMap[name] = { name, currentCount: 0 };
        themeCountMap[name].currentCount++;
      }
    }

    // Prior period theme counts for growth rate
    const priorFeedbackWithThemes = await prisma.feedback.findMany({
      where: {
        workspaceId,
        createdAt: { gte: priorStart, lte: priorEnd },
      },
      select: {
        themes: { include: { theme: { select: { name: true } } } },
      },
    });
    const priorThemeCountMap: Record<string, number> = {};
    for (const f of priorFeedbackWithThemes) {
      for (const ft of f.themes) {
        const name = ft.theme.name;
        priorThemeCountMap[name] = (priorThemeCountMap[name] ?? 0) + 1;
      }
    }

    const topThemes = Object.values(themeCountMap)
      .map((t) => {
        const prev = priorThemeCountMap[t.name] ?? 0;
        const growthRate = prev > 0
          ? Math.round(((t.currentCount - prev) / prev) * 100)
          : t.currentCount > 0 ? 100 : 0;
        return { name: t.name, count: t.currentCount, growthRate };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Verbatim quotes — mix of sentiments, prefer negative for actionability
    const negQuotes = currentFeedback
      .filter((f) => f.sentiment === "NEGATIVE")
      .slice(0, 2)
      .map((f) => ({ content: f.content.slice(0, 200), channel: f.channel, sentiment: "NEGATIVE" }));
    const posQuotes = currentFeedback
      .filter((f) => f.sentiment === "POSITIVE")
      .slice(0, 2)
      .map((f) => ({ content: f.content.slice(0, 200), channel: f.channel, sentiment: "POSITIVE" }));
    const neuQuotes = currentFeedback
      .filter((f) => f.sentiment === "NEUTRAL")
      .slice(0, 1)
      .map((f) => ({ content: f.content.slice(0, 200), channel: f.channel, sentiment: "NEUTRAL" }));
    const verbatimQuotes = [...negQuotes, ...posQuotes, ...neuQuotes].slice(0, 5);

    const stats: VoCReportStats = {
      periodStart: periodStart.toISOString().slice(0, 10),
      periodEnd: periodEnd.toISOString().slice(0, 10),
      totalFeedback,
      sentimentBreakdown,
      sentimentDelta,
      topThemes,
      verbatimQuotes,
    };

    // ── Call AI to generate narrative ─────────────────────────────────────
    const aiNarrative = await generateVoCReportWithGroq(stats);

    // ── Save report to DB ─────────────────────────────────────────────────
    const contentJson = {
      stats,
      narrative: aiNarrative,
      generatedAt: new Date().toISOString(),
    };

    const report = await prisma.report.create({
      data: {
        title,
        periodStart,
        periodEnd,
        contentJson: contentJson as unknown as Prisma.InputJsonValue,
        workspaceId,
        generatedById: userId,
      },
      include: {
        generatedBy: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ data: report }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/reports error:", err);
    const status = err?.statusCode ?? 500;
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status }
    );
  }
}
