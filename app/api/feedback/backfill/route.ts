import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { processAutoClassification } from "@/lib/services/classify.service";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaceId = session.user.workspaceId;

  // Find all feedback in workspace without sentiment
  const unclassifiedItems = await prisma.feedback.findMany({
    where: {
      workspaceId,
      sentiment: null,
    },
    select: { id: true },
  });

  let processedCount = 0;
  for (const item of unclassifiedItems) {
    try {
      await processAutoClassification(item.id, workspaceId);
      processedCount++;
    } catch (err) {
      console.error(`Failed backfill for feedback ${item.id}:`, err);
    }
  }

  return NextResponse.json({
    success: true,
    totalFound: unclassifiedItems.length,
    processedCount,
  });
}
