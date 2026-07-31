import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaceId = session.user.workspaceId;

  // Calculate current period and previous period (7-day window)
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const themes = await prisma.theme.findMany({
    where: { workspaceId },
    include: {
      feedbacks: {
        include: {
          feedback: {
            select: {
              id: true,
              content: true,
              sentiment: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });

  const formattedThemes = themes.map((theme) => {
    const allItems = theme.feedbacks.map((f) => f.feedback);
    const totalCount = allItems.length;

    const currentPeriodCount = allItems.filter(
      (item) => new Date(item.createdAt) >= sevenDaysAgo
    ).length;

    const previousPeriodCount = allItems.filter(
      (item) =>
        new Date(item.createdAt) >= fourteenDaysAgo &&
        new Date(item.createdAt) < sevenDaysAgo
    ).length;

    // Detect volume spike (+50% vs previous period with min count >= 2)
    let isSpiking = false;
    let growthRate = 0;
    if (previousPeriodCount > 0) {
      growthRate = ((currentPeriodCount - previousPeriodCount) / previousPeriodCount) * 100;
      if (growthRate >= 50 && currentPeriodCount >= 2) {
        isSpiking = true;
      }
    } else if (currentPeriodCount >= 3) {
      isSpiking = true;
      growthRate = 100;
    }

    const posCount = allItems.filter((i) => i.sentiment === "POSITIVE").length;
    const negCount = allItems.filter((i) => i.sentiment === "NEGATIVE").length;
    const neuCount = allItems.filter((i) => i.sentiment === "NEUTRAL").length;

    return {
      id: theme.id,
      name: theme.name,
      description: theme.description,
      color: theme.color || "#3B82F6",
      totalCount,
      currentPeriodCount,
      previousPeriodCount,
      growthRate: Math.round(growthRate),
      isSpiking,
      sentiments: {
        positive: posCount,
        negative: negCount,
        neutral: neuCount,
      },
      recentFeedback: allItems.slice(0, 5),
    };
  });

  // Sort spiking themes first, then by total count
  formattedThemes.sort((a, b) => {
    if (a.isSpiking && !b.isSpiking) return -1;
    if (!a.isSpiking && b.isSpiking) return 1;
    return b.totalCount - a.totalCount;
  });

  return NextResponse.json({ data: formattedThemes });
}
