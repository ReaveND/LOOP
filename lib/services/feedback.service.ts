import { prisma } from "@/lib/db";
import { FeedbackStatus } from "@/lib/generated/prisma/client";

import {
  CreateFeedbackInput,
} from "@/lib/validations/feedback";

import {
  FeedbackResponse,
} from "@/lib/types/feedback";

export class FeedbackService {
  static async create(
    workspaceId: string,
    data: CreateFeedbackInput
  ): Promise<FeedbackResponse> {
    const { sourceRef, ...rest } = data;
    const feedback = await prisma.feedback.create({
      data: {
        ...rest,
        externalReference: sourceRef,
        workspaceId,
        status: FeedbackStatus.NEW,
      },
    });

    return {
      id: feedback.id,
      content: feedback.content,
      channel: feedback.channel,
      customerLabel: feedback.customerLabel,
      sourceRef: feedback.externalReference,
      status: feedback.status,
      createdAt: feedback.createdAt,
    };
  }
}