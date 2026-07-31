import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { answerAskLoopWithGroq } from "@/lib/services/ai";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { question } = await req.json();

  if (!question || typeof question !== "string") {
    return NextResponse.json({ error: "Valid question string is required" }, { status: 400 });
  }

  const workspaceId = session.user.workspaceId;

  // Extract key search terms for text filtering
  const queryTerms = question
    .toLowerCase()
    .replace(/[^\w\s]/gi, "")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !["what", "how", "why", "when", "where", "about", "that", "this", "users", "saying"].includes(w));

  // Retrieve relevant workspace feedback items using keyword match or recent sample
  const whereClause = queryTerms.length > 0
    ? {
        workspaceId,
        OR: queryTerms.map((term) => ({
          content: { contains: term, mode: "insensitive" as const },
        })),
      }
    : { workspaceId };

  let relevantItems = await prisma.feedback.findMany({
    where: whereClause,
    take: 10,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      content: true,
      channel: true,
      createdAt: true,
      sentiment: true,
    },
  });

  // Fallback to top 10 items if keyword search returned zero
  if (relevantItems.length === 0) {
    relevantItems = await prisma.feedback.findMany({
      where: { workspaceId },
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        content: true,
        channel: true,
        createdAt: true,
        sentiment: true,
      },
    });
  }

  // Generate grounded answer using Groq
  const result = await answerAskLoopWithGroq(question, relevantItems);

  // Map cited IDs to detailed feedback item records
  const citedItems = relevantItems.filter((item) => result.citedIds.includes(item.id));

  return NextResponse.json({
    question,
    answer: result.answer,
    citedItems: citedItems.length > 0 ? citedItems : relevantItems.slice(0, 3),
  });
}
