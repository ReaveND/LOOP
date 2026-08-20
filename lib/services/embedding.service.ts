import { prisma } from "@/lib/db";

class EmbeddingPipeline {
  static task = "feature-extraction" as any;
  static model = "Xenova/all-MiniLM-L6-v2";
  static instance: any = null;

  static async getInstance() {
    if (this.instance === null) {
      // Dynamic import so Vercel doesn't try to load this 100MB+ WASM library
      // at module-init time (which crashes the serverless function)
      const { pipeline, env } = await import("@xenova/transformers");
      env.allowLocalModels = false;
      this.instance = await pipeline(this.task, this.model);
    }
    return this.instance;
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const extractor = await EmbeddingPipeline.getInstance();
    const output = await extractor(text, { pooling: "mean", normalize: true });
    return Array.from(output.data);
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}

export async function processEmbedding(feedbackId: string, workspaceId: string) {
  try {
    const feedback = await prisma.feedback.findUnique({
      where: { id: feedbackId },
    });

    if (!feedback) return;

    // We embed the content
    const vector = await generateEmbedding(feedback.content);
    const vectorString = `[${vector.join(",")}]`;

    // Because prisma has 'Unsupported("vector")', we must use raw SQL to insert
    // Need to use the correct schema name or generic insert
    await prisma.$executeRawUnsafe(
      `INSERT INTO embeddings (id, "feedbackId", vector, "createdAt") 
       VALUES (gen_random_uuid()::text, $1, $2::vector, NOW())
       ON CONFLICT ("feedbackId") DO UPDATE SET vector = $2::vector`,
      feedbackId,
      vectorString
    );

    console.log(`Successfully generated and saved embedding for feedback ${feedbackId}`);
  } catch (error) {
    console.error(`Failed to process embedding for feedback ${feedbackId}`, error);
  }
}
