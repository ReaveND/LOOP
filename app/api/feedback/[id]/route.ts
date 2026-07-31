import { NextResponse } from "next/server";
import { UserRole, FeedbackStatus, FeedbackChannel } from "@/lib/generated/prisma/client";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { withErrorHandler } from "@/lib/utils/with-error-handler";
import { z } from "zod";

// ─── PATCH: status-only update (ADMIN | ANALYST) ─────────────────────────────

const patchSchema = z.object({
  status: z.nativeEnum(FeedbackStatus),
});

export const PATCH = withErrorHandler(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const session = await requireRole([UserRole.ADMIN, UserRole.ANALYST]);
    const workspaceId = session.user.workspaceId;
    const { id } = await params;

    const body = await req.json();
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.feedback.findFirst({
      where: { id, workspaceId },
    });

    if (!existing) {
      return NextResponse.json({ message: "Feedback not found" }, { status: 404 });
    }

    const updated = await prisma.feedback.update({
      where: { id },
      data: { status: parsed.data.status },
    });

    return NextResponse.json({ id: updated.id, status: updated.status });
  }
);

// ─── PUT: full edit (content, channel, customerLabel) — ADMIN | ANALYST ───────

const putSchema = z.object({
  content: z.string().trim().min(1, "Content is required."),
  channel: z.nativeEnum(FeedbackChannel),
  customerLabel: z.string().trim().max(200).optional(),
});

export const PUT = withErrorHandler(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const session = await requireRole([UserRole.ADMIN, UserRole.ANALYST]);
    const workspaceId = session.user.workspaceId;
    const { id } = await params;

    const body = await req.json();
    const parsed = putSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.feedback.findFirst({
      where: { id, workspaceId },
    });

    if (!existing) {
      return NextResponse.json({ message: "Feedback not found" }, { status: 404 });
    }

    const updated = await prisma.feedback.update({
      where: { id },
      data: {
        content: parsed.data.content,
        channel: parsed.data.channel,
        customerLabel: parsed.data.customerLabel ?? null,
      },
      include: {
        themes: { include: { theme: true } },
      },
    });

    return NextResponse.json({
      id: updated.id,
      content: updated.content,
      channel: updated.channel,
      customerLabel: updated.customerLabel,
      status: updated.status,
      sentiment: updated.sentiment,
      sentimentScore: updated.sentimentScore,
      themes: updated.themes.map((ft) => ft.theme.name),
      createdAt: updated.createdAt,
    });
  }
);

// ─── DELETE: remove feedback — ADMIN only ─────────────────────────────────────

export const DELETE = withErrorHandler(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const session = await requireRole([UserRole.ADMIN]);
    const workspaceId = session.user.workspaceId;
    const { id } = await params;

    const existing = await prisma.feedback.findFirst({
      where: { id, workspaceId },
    });

    if (!existing) {
      return NextResponse.json({ message: "Feedback not found" }, { status: 404 });
    }

    // Remove related embeddings and theme links first (cascade-safe)
    await prisma.$transaction([
      prisma.feedbackTheme.deleteMany({ where: { feedbackId: id } }),
      prisma.embedding.deleteMany({ where: { feedbackId: id } }),
      prisma.feedback.delete({ where: { id } }),
    ]);

    return NextResponse.json({ message: "Feedback deleted" }, { status: 200 });
  }
);

