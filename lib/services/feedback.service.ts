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

import { processAutoClassification } from "./classify.service";
import { processEmbedding } from "./embedding.service";

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

    // Trigger AI classification and embeddings asynchronously
    processAutoClassification(feedback.id, workspaceId).catch(console.error);
    processEmbedding(feedback.id, workspaceId).catch(console.error);

    return {
      id: feedback.id,
      content: feedback.content,
      channel: feedback.channel,
      customerLabel: feedback.customerLabel,
      sourceRef: feedback.externalReference,
      status: feedback.status,
      sentiment: feedback.sentiment,
      sentimentScore: feedback.sentimentScore,
      themes: [],
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
      dateFrom,
      dateTo,
      themeId,
    } = query;

    const skip = (page - 1) * limit;

    // Build date range filter
    const createdAtFilter: { gte?: Date; lte?: Date } = {};
    if (dateFrom) {
      createdAtFilter.gte = new Date(dateFrom + "T00:00:00.000Z");
    }
    if (dateTo) {
      createdAtFilter.lte = new Date(dateTo + "T23:59:59.999Z");
    }

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

      ...((dateFrom || dateTo) && {
        createdAt: createdAtFilter,
      }),

      // Filter by theme via join table (by ID or by theme name)
      ...((themeId || (query as any).theme) && {
        themes: {
          some: {
            OR: [
              { themeId: themeId || (query as any).theme },
              {
                theme: {
                  name: {
                    equals: themeId || (query as any).theme,
                    mode: "insensitive",
                  },
                },
              },
            ],
          },
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
      include: {
        themes: {
          include: {
            theme: true,
          },
        },
      },
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
        sentiment: item.sentiment,
        sentimentScore: item.sentimentScore,
        themes: item.themes.map((ft) => ft.theme.name),
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