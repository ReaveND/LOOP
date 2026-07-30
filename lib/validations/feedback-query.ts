import { z } from "zod";

import {
    FeedbackChannel,
    FeedbackStatus,
    Sentiment,
} from "@/lib/generated/prisma/client";

export const feedbackQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),

    limit: z.coerce.number().min(1).max(100).default(10),

    search: z.string().optional(),

    status: z.nativeEnum(FeedbackStatus).optional(),

    sentiment: z.nativeEnum(Sentiment).optional(),

    channel: z.nativeEnum(FeedbackChannel).optional(),
});

export type FeedbackQuery =
    z.infer<typeof feedbackQuerySchema>;