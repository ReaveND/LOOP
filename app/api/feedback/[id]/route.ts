import { NextResponse } from "next/server";
import { UserRole, FeedbackStatus } from "@/lib/generated/prisma/client";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { withErrorHandler } from "@/lib/utils/with-error-handler";
import { z } from "zod";

const patchSchema = z.object({
  status: z.nativeEnum(FeedbackStatus),
});

// PATCH /api/feedback/:id — update status inline
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

    // Verify the feedback belongs to this workspace (tenant isolation)
    const existing = await prisma.feedback.findFirst({
      where: { id, workspaceId },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Feedback not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.feedback.update({
      where: { id },
      data: { status: parsed.data.status },
    });

    return NextResponse.json({
      id: updated.id,
      status: updated.status,
    });
  }
);
