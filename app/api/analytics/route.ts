import { NextResponse } from "next/server";
import { UserRole, Sentiment } from "@/lib/generated/prisma/client";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { withErrorHandler } from "@/lib/utils/with-error-handler";

// GET /api/analytics — real-time dashboard metrics scoped to workspace
export const GET = withErrorHandler(async () => {
  const session = await requireRole([
    UserRole.ADMIN,
    UserRole.ANALYST,
    UserRole.VIEWER,
  ]);
  const workspaceId = session.user.workspaceId;

  // --- Date helpers ---
  const now = new Date();
  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(now.getDate() - now.getDay());
  startOfThisWeek.setHours(0, 0, 0, 0);

  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  // Run all queries in parallel
  const [
    totalCount,
    sentimentCounts,
    channelCounts,
    newThisWeek,
    volumeRaw,
    topThemes,
  ] = await Promise.all([
    // Total feedback
    prisma.feedback.count({ where: { workspaceId } }),

    // Sentiment breakdown
    prisma.feedback.groupBy({
      by: ["sentiment"],
      where: { workspaceId },
      _count: { sentiment: true },
    }),

    // Channel breakdown
    prisma.feedback.groupBy({
      by: ["channel"],
      where: { workspaceId },
      _count: { channel: true },
    }),

    // New this week
    prisma.feedback.count({
      where: { workspaceId, createdAt: { gte: startOfThisWeek } },
    }),

    // Volume per day — last 30 days
    prisma.feedback.findMany({
      where: { workspaceId, createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),

    // Top themes by feedback count
    prisma.theme.findMany({
      where: { workspaceId },
      select: {
        id: true,
        name: true,
        color: true,
        feedbacks: { select: { feedbackId: true } },
      },
      orderBy: { feedbacks: { _count: "desc" } },
      take: 5,
    }),
  ]);

  // --- Process sentiment ---
  const sentimentMap: Record<string, number> = {
    POSITIVE: 0,
    NEUTRAL: 0,
    NEGATIVE: 0,
  };
  for (const row of sentimentCounts) {
    if (row.sentiment) sentimentMap[row.sentiment] = row._count.sentiment;
  }
  const negativeCount = sentimentMap["NEGATIVE"] ?? 0;
  const percentNegative =
    totalCount > 0 ? Math.round((negativeCount / totalCount) * 100) : 0;

  // --- Process channel ---
  const channelData = channelCounts.map((row) => ({
    name: row.channel,
    value: row._count.channel,
  }));

  // --- Build daily volume buckets ---
  const buckets: Record<string, number> = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo);
    d.setDate(thirtyDaysAgo.getDate() + i);
    const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
    buckets[key] = 0;
  }
  for (const row of volumeRaw) {
    const key = row.createdAt.toISOString().slice(0, 10);
    if (key in buckets) buckets[key]++;
  }
  const volumeData = Object.entries(buckets).map(([date, count]) => ({
    date,
    // Short label: "Jul 31"
    label: new Date(date + "T00:00:00Z").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }),
    count,
  }));

  // --- Top themes ---
  const themesData = topThemes.map((t) => ({
    id: t.id,
    name: t.name,
    color: t.color,
    count: t.feedbacks.length,
  }));

  return NextResponse.json({
    totalCount,
    sentimentCounts: {
      POSITIVE: sentimentMap["POSITIVE"],
      NEUTRAL: sentimentMap["NEUTRAL"],
      NEGATIVE: sentimentMap["NEGATIVE"],
    },
    percentNegative,
    newThisWeek,
    channelData,
    volumeData,
    topThemes: themesData,
  });
});
