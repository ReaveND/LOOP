import { NextResponse } from "next/server";
import { UserRole, FeedbackChannel, FeedbackStatus } from "@/lib/generated/prisma/client";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { withErrorHandler } from "@/lib/utils/with-error-handler";
import { z } from "zod";

const bulkFeedbackSchema = z.array(
  z.object({
    content: z.string().trim().min(1, "Feedback content is required."),
    channel: z.nativeEnum(FeedbackChannel).optional().default(FeedbackChannel.CSV),
    customerLabel: z.string().trim().max(100).optional(),
    sourceRef: z.string().trim().max(255).optional(),
  })
);

// POST /api/feedback/bulk - Ingest CSV / Bulk feedback array
export const POST = withErrorHandler(async (req: Request) => {
  const session = await requireRole([UserRole.ADMIN, UserRole.ANALYST]);
  const workspaceId = session.user.workspaceId;

  const body = await req.json();
  const result = bulkFeedbackSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        message: "Invalid bulk feedback input format",
        errors: result.error.flatten(),
      },
      { status: 400 }
    );
  }

  const items = result.data;
  let importedCount = 0;
  let failedCount = 0;

  const recordsToCreate = items.map((item) => ({
    content: item.content,
    channel: item.channel,
    customerLabel: item.customerLabel || null,
    externalReference: item.sourceRef || null,
    workspaceId,
    status: FeedbackStatus.NEW,
  }));

  try {
    const created = await prisma.feedback.createMany({
      data: recordsToCreate,
    });
    importedCount = created.count;
  } catch (error) {
    console.error("Bulk import error:", error);
    failedCount = items.length;
  }

  return NextResponse.json(
    {
      message: `Bulk import completed`,
      importedCount,
      failedCount,
      total: items.length,
    },
    { status: 201 }
  );
});
