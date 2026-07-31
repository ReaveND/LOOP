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
    .filter((w) => w.length > 2 && !["what", "how", "why", "when", "where", "about", "that", "this", "users", "saying", "most", "are", "is", "the"].includes(w));

  let relevantItems: Array<{
    id: string;
    content: string;
    channel: string;
    createdAt: Date;
    sentiment: any;
  }> = [];

  let keywordItems: any[] = [];

  if (queryTerms.length > 0) {
    keywordItems = await prisma.feedback.findMany({
      where: {
        workspaceId,
        OR: queryTerms.map((term) => ({
          content: { contains: term, mode: "insensitive" as const },
        })),
      },
      take: 15,
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

  // Always fetch a baseline of the 20 most recent items to guarantee rich context
  const recentItems = await prisma.feedback.findMany({
    where: { workspaceId },
    take: 20,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      content: true,
      channel: true,
      createdAt: true,
      sentiment: true,
    },
  });

  // Merge and deduplicate items by ID
  const mergedMap = new Map();
  keywordItems.forEach(item => mergedMap.set(item.id, item));
  recentItems.forEach(item => mergedMap.set(item.id, item));
  
  relevantItems = Array.from(mergedMap.values()).slice(0, 30) as any[];

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
