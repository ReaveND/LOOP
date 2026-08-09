import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { answerAskLoopWithGroq } from "@/lib/services/ai";
import { generateEmbedding } from "@/lib/services/embedding.service";

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
  let relevantItems: any[] = [];

  try {
    // 1. Generate an embedding for the question
    const questionVector = await generateEmbedding(question);
    const vectorString = `[${questionVector.join(",")}]`;

    // 2. Perform semantic search using pgvector
    // Find the closest embeddings in the database using cosine distance (<=>)
    const vectorResults = await prisma.$queryRawUnsafe<any[]>(
      `SELECT e."feedbackId", 1 - (e.vector <=> $1::vector) as similarity
       FROM embeddings e
       JOIN feedbacks f ON e."feedbackId" = f.id
       WHERE f."workspaceId" = $2
       ORDER BY e.vector <=> $1::vector
       LIMIT 15`,
      vectorString,
      workspaceId
    );

    const feedbackIds = vectorResults.map((r) => r.feedbackId);

    // 3. Fetch full feedback records for the matching IDs
    if (feedbackIds.length > 0) {
      const dbItems = await prisma.feedback.findMany({
        where: {
          id: { in: feedbackIds },
          workspaceId,
        },
        select: {
          id: true,
          content: true,
          channel: true,
          createdAt: true,
          sentiment: true,
        },
      });

      // Preserve order based on semantic similarity
      relevantItems = feedbackIds
        .map((id) => dbItems.find((item) => item.id === id))
        .filter(Boolean);
    }
  } catch (error) {
    console.warn("Vector search failed, falling back to text search.", error);
  }

  // Fallback / Baseline: If no vector results, use the original keyword search & recent items
  if (relevantItems.length === 0) {
    const queryTerms = question
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !["what", "how", "why", "when", "where", "about", "that", "this", "users", "saying", "most", "are", "is", "the"].includes(w));

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

    const mergedMap = new Map();
    keywordItems.forEach(item => mergedMap.set(item.id, item));
    recentItems.forEach(item => mergedMap.set(item.id, item));
    
    relevantItems = Array.from(mergedMap.values()).slice(0, 30);
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
