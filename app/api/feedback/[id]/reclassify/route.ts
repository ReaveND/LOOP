import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { processAutoClassification } from "@/lib/services/classify.service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const workspaceId = session.user.workspaceId;

  const feedback = await prisma.feedback.findFirst({
    where: { id, workspaceId },
  });

  if (!feedback) {
    return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
  }

  try {
    const updated = await processAutoClassification(id, workspaceId);
    return NextResponse.json({ success: true, feedback: updated });
  } catch (error) {
    console.error("Failed to re-classify feedback:", error);
    return NextResponse.json({ error: "Re-classification failed" }, { status: 500 });
  }
}
