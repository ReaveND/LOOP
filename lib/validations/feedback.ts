import { z } from "zod";
import { FeedbackChannel } from "@/lib/generated/prisma/client";

export const createFeedbackSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Feedback content is required.")
    .max(5000, "Feedback is too long."),

  channel: z.nativeEnum(FeedbackChannel),

  customerLabel: z
    .string()
    .trim()
    .max(100)
    .optional(),

  sourceRef: z
    .string()
    .trim()
    .max(255)
    .optional(),
});

export type CreateFeedbackInput =
  z.infer<typeof createFeedbackSchema>;