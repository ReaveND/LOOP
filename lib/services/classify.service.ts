import { prisma } from "@/lib/db";
import { classifyFeedbackWithGroq } from "./ai";
import { Sentiment } from "@/lib/generated/prisma/client";

export async function processAutoClassification(feedbackId: string, workspaceId: string) {
  const feedback = await prisma.feedback.findUnique({
    where: { id: feedbackId },
  });

  if (!feedback) return null;

  // Retrieve existing workspace theme names
  const existingThemes = await prisma.theme.findMany({
    where: { workspaceId },
    select: { name: true },
  });

  const themeNames = existingThemes.map((t) => t.name);

  // Call Groq classification service
  const result = await classifyFeedbackWithGroq(feedback.content, themeNames);

  // Find or create primary theme
  let themeRecord = await prisma.theme.findFirst({
    where: {
      workspaceId,
      name: {
        equals: result.primaryTheme,
        mode: "insensitive",
      },
    },
  });

  if (!themeRecord) {
    themeRecord = await prisma.theme.create({
      data: {
        name: result.primaryTheme,
        description: `Theme auto-generated during classification`,
        workspaceId,
        color: getRandomThemeColor(),
      },
    });
  }

  // Update feedback record with classification output
  const updatedFeedback = await prisma.feedback.update({
    where: { id: feedbackId },
    data: {
      sentiment: result.sentiment as Sentiment,
      sentimentScore: result.sentimentScore,
    },
  });

  // Connect feedback to theme in FeedbackTheme join table
  await prisma.feedbackTheme.upsert({
    where: {
      feedbackId_themeId: {
        feedbackId: feedback.id,
        themeId: themeRecord.id,
      },
    },
    create: {
      feedbackId: feedback.id,
      themeId: themeRecord.id,
      confidence: Math.abs(result.sentimentScore),
    },
    update: {
      confidence: Math.abs(result.sentimentScore),
    },
  });

  return updatedFeedback;
}

function getRandomThemeColor(): string {
  const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#6366F1"];
  return colors[Math.floor(Math.random() * colors.length)];
}
