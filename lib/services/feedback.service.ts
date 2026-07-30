import { prisma } from "@/lib/db";
import {
  FeedbackStatus,
  Prisma,
} from "@/lib/generated/prisma/client";

import {
  CreateFeedbackInput,
} from "@/lib/validations/feedback";

import {
  FeedbackQuery,
} from "@/lib/validations/feedback-query";

import {
  FeedbackResponse,
  FeedbackListResponse
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

  static async list(
    workspaceId: string,
    query: FeedbackQuery
  ): Promise<FeedbackListResponse> {
    const {
      page,
      limit,
      search,
      status,
      sentiment,
      channel,
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.FeedbackWhereInput = {
      workspaceId,

      ...(status && { status }),

      ...(sentiment && { sentiment }),

      ...(channel && { channel }),

      ...(search && {
        content: {
          contains: search,
          mode: "insensitive",
        },
      }),
    };

    const feedback = await prisma.feedback.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    const total = await prisma.feedback.count({
      where,
    });

    return {
      data: feedback.map((item) => ({
        id: item.id,
        content: item.content,
        channel: item.channel,
        customerLabel: item.customerLabel,
        sourceRef: item.externalReference,
        status: item.status,
        createdAt: item.createdAt,
      })),

      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}