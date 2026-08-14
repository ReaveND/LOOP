import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { FeedbackStatus } from "@/lib/generated/prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaceId = session.user.workspaceId;
  const { id: themeId } = await params;

  // Verify theme belongs to workspace
  const theme = await prisma.theme.findFirst({
    where: { id: themeId, workspaceId },
  });

  if (!theme) {
    return NextResponse.json({ error: "Theme not found" }, { status: 404 });
  }

  // Find all feedback IDs associated with this theme in the workspace
  const feedbackThemes = await prisma.feedbackTheme.findMany({
    where: { themeId },
    select: { feedbackId: true },
  });

  const feedbackIds = feedbackThemes.map((ft) => ft.feedbackId);

  if (feedbackIds.length === 0) {
    return NextResponse.json({ updatedCount: 0, message: "No feedback items found for this theme." });
  }

  // Batch update all related feedback items to ACTIONED
  const updateResult = await prisma.feedback.updateMany({
    where: {
      id: { in: feedbackIds },
      workspaceId,
    },
    data: {
      status: FeedbackStatus.ACTIONED,
    },
  });

  return NextResponse.json({
    updatedCount: updateResult.count,
    message: `Batch-updated ${updateResult.count} feedback items to ACTIONED.`,
  });
}
