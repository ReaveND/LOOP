import { NextResponse, NextRequest } from "next/server";
import { UserRole } from "@/lib/generated/prisma/client";
import { requireRole } from "@/lib/permissions";
import { FeedbackService } from "@/lib/services/feedback.service";
import { createFeedbackSchema } from "@/lib/validations/feedback";
import { feedbackQuerySchema } from "@/lib/validations/feedback-query";
import { withErrorHandler } from "@/lib/utils/with-error-handler";

export const POST = withErrorHandler(async (req: Request) => {
  const session = await requireRole([UserRole.ADMIN, UserRole.ANALYST]);
  const workspaceId = session.user.workspaceId;

  const body = await req.json();
  const result = createFeedbackSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        message: "Invalid input",
        errors: result.error.flatten(),
      },
      {
        status: 400,
      }
    );
  }

  const feedback = await FeedbackService.create(
    workspaceId,
    result.data
  );

  return NextResponse.json(feedback, {
    status: 201,
  });
});

export const GET = withErrorHandler(
  async (request: NextRequest) => {
    const session = await requireRole([
      UserRole.ADMIN,
      UserRole.ANALYST,
      UserRole.VIEWER,
    ]);

    const query = Object.fromEntries(
      request.nextUrl.searchParams.entries()
    );

    const validated =
      feedbackQuerySchema.safeParse(query);

    if (!validated.success) {
      return NextResponse.json(
        {
          message: "Invalid query parameters",
          errors: validated.error.flatten(),
        },
        {
          status: 400,
        }
      );
    }

    const result = await FeedbackService.list(
      session.user.workspaceId,
      validated.data
    );

    return NextResponse.json(result);
  }
);