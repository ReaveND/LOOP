import Groq from "groq-sdk";
import { z } from "zod";


export function getGroqClient() {
  const key = process.env.GROQ_API_KEY;
  return key ? new Groq({ apiKey: key }) : null;
}

export const MODEL_NAME = process.env.GROQ_MODEL_NAME || "openai/gpt-oss-120b";

export const classificationSchema = z.object({
  sentiment: z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE"]),
  sentimentScore: z.number().min(-1.0).max(1.0),
  primaryTheme: z.string().min(1),
  secondaryThemes: z.array(z.string()).default([]),
  featureArea: z.string().min(1),
  rationale: z.string().min(1),
});

export type ClassificationResult = z.infer<typeof classificationSchema>;

export async function classifyFeedbackWithGroq(
  content: string,
  existingThemes: string[] = []
): Promise<ClassificationResult> {
  const client = getGroqClient();
  if (!client) {
    console.warn("GROQ_API_KEY not set. Using rule-based fallback classifier.");
    return fallbackClassify(content);
  }

  const systemPrompt = `You are an AI customer feedback intelligence classifier.
Analyze the customer feedback text and output ONLY valid JSON matching this schema:
{
  "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
  "sentimentScore": float between -1.0 and 1.0,
  "primaryTheme": "short theme name (use existing themes if applicable)",
  "secondaryThemes": ["array of related tags"],
  "featureArea": "e.g. Onboarding, Billing, Performance, UI/UX, Support, Features",
  "rationale": "one short sentence explaining classification"
}

Existing workspace themes to consider reusing if relevant: ${JSON.stringify(existingThemes)}
Output pure JSON with no extra commentary or markdown syntax wrappers.`;

  try {
    const response = await client.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Customer feedback: "${content}"` },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const responseText = response.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(responseText);
    const result = classificationSchema.safeParse(parsed);
    
    if (!result.success) {
      console.warn("AI generated invalid JSON structure, falling back", result.error);
      return fallbackClassify(content);
    }
    
    return result.data;
  } catch (err) {
    console.error("Error in Groq classification call:", err);
    return fallbackClassify(content);
  }
}

export async function answerAskLoopWithGroq(
  question: string,
  contextItems: Array<{ id: string; content: string; channel: string; createdAt: Date | string }>
): Promise<{ answer: string; citedIds: string[] }> {
  const client = getGroqClient();
  if (!client) {
    return {
      answer: "GROQ_API_KEY is not configured. Here are matching feedback items from your search context.",
      citedIds: contextItems.slice(0, 3).map((item) => item.id),
    };
  }

  const contextText = contextItems
    .map((item, index) => `[Item ${index + 1} | ID: ${item.id} | Channel: ${item.channel}]: "${item.content}"`)
    .join("\n\n");

  const systemPrompt = `You are Ask LOOP, an AI assistant for customer feedback intelligence.
Your task is to answer user questions about customer feedback strictly using the provided customer feedback items below.

Rules:
1. Ground every analytical statement directly in the provided feedback items. Do NOT invent customer quotes or feedback metrics.
2. If the user sends a greeting or general intro (e.g. "hello", "hi", "who are you"), reply warmly and offer to answer questions about customer feedback, themes, or sentiment.
3. If the user asks a question about customer feedback but the provided context does not contain enough information to answer, state: "Based on the feedback in your workspace, there is not enough information to answer this question."
4. Include explicit references to the Item IDs used in your response in format [ID: <item_id>] when citing data.
5. Output valid JSON in this exact structure:
{
  "answer": "your response here",
  "citedIds": ["item_id_1"]
}`;

  try {
    const response = await client.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `CONTEXT FEEDBACK ITEMS:\n${contextText}\n\nUSER QUESTION: "${question}"`,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(response.choices[0]?.message?.content || "{}");
    return {
      answer: parsed.answer || "No response generated.",
      citedIds: Array.isArray(parsed.citedIds) ? parsed.citedIds : contextItems.slice(0, 3).map((i) => i.id),
    };
  } catch (err) {
    console.error("Error in Ask LOOP Groq call:", err);
    return {
      answer: "An error occurred while generating the answer with Groq. Please check your system logs.",
      citedIds: contextItems.slice(0, 3).map((i) => i.id),
    };
  }
}

// -------------------------------------------------------------------
// VoC Report Generation
// -------------------------------------------------------------------

export interface VoCReportStats {
  periodStart: string;
  periodEnd: string;
  totalFeedback: number;
  sentimentBreakdown: { positive: number; neutral: number; negative: number };
  sentimentDelta: { positiveChange: number; negativeChange: number } | null;
  topThemes: Array<{ name: string; count: number; growthRate: number }>;
  verbatimQuotes: Array<{ content: string; channel: string; sentiment: string }>;
}

export async function generateVoCReportWithGroq(
  stats: VoCReportStats
): Promise<{
  executiveSummary: string;
  keyFindings: string[];
  sentimentAnalysis: string;
  topIssues: string[];
  recommendedActions: string[];
  conclusion: string;
}> {
  const client = getGroqClient();

  const fallbackReport = {
    executiveSummary: `This period (${stats.periodStart} to ${stats.periodEnd}) saw ${stats.totalFeedback} feedback items across your workspace. Sentiment breakdown: ${stats.sentimentBreakdown.positive} positive, ${stats.sentimentBreakdown.neutral} neutral, ${stats.sentimentBreakdown.negative} negative.`,
    keyFindings: [
      `${stats.totalFeedback} total feedback items analyzed for this period.`,
      stats.topThemes[0] ? `Top theme: "${stats.topThemes[0].name}" with ${stats.topThemes[0].count} items.` : "No themes detected yet.",
      `Negative feedback accounts for ${stats.totalFeedback > 0 ? Math.round((stats.sentimentBreakdown.negative / stats.totalFeedback) * 100) : 0}% of responses.`,
    ],
    sentimentAnalysis: `Customer sentiment is ${stats.sentimentBreakdown.positive >= stats.sentimentBreakdown.negative ? "predominantly positive" : "trending negative"} this period.`,
    topIssues: stats.topThemes.slice(0, 3).map((t) => `${t.name}: ${t.count} feedback items`),
    recommendedActions: [
      `Investigate the top theme "${stats.topThemes[0]?.name ?? "feedback"}" to identify root causes.`,
      "Schedule a team review of negative feedback items.",
      "Follow up with customers who provided actionable suggestions.",
    ],
    conclusion: "Review the feedback details in the inbox for full context on each item.",
  };

  if (!client) {
    return fallbackReport;
  }

  const statsText = `
Period: ${stats.periodStart} to ${stats.periodEnd}
Total feedback items: ${stats.totalFeedback}
Sentiment breakdown:
  - Positive: ${stats.sentimentBreakdown.positive} items
  - Neutral: ${stats.sentimentBreakdown.neutral} items
  - Negative: ${stats.sentimentBreakdown.negative} items
${stats.sentimentDelta ? `Sentiment change vs prior period:\n  - Positive change: ${stats.sentimentDelta.positiveChange > 0 ? "+" : ""}${stats.sentimentDelta.positiveChange}%\n  - Negative change: ${stats.sentimentDelta.negativeChange > 0 ? "+" : ""}${stats.sentimentDelta.negativeChange}%` : ""}
Top themes by volume:
${stats.topThemes.map((t, i) => `  ${i + 1}. "${t.name}" — ${t.count} items (${t.growthRate > 0 ? "+" : ""}${t.growthRate}% vs prior period)`).join("\n")}
Verbatim customer quotes:
${stats.verbatimQuotes.map((q, i) => `  [${i + 1}] (${q.channel}, ${q.sentiment}): "${q.content}"`).join("\n")}`;

  const systemPrompt = `You are a senior product analyst writing a professional Voice-of-Customer (VoC) report.
You will be given pre-computed customer feedback statistics. Write a clear, evidence-backed report narrative around these exact numbers.
Do NOT invent any figures or statistics — use only what is provided.
Return ONLY valid JSON with this exact structure:
{
  "executiveSummary": "2-3 sentence summary of the period",
  "keyFindings": ["finding 1", "finding 2", "finding 3", "finding 4"],
  "sentimentAnalysis": "2-3 sentences analyzing the sentiment data provided",
  "topIssues": ["issue 1", "issue 2", "issue 3"],
  "recommendedActions": ["action 1", "action 2", "action 3"],
  "conclusion": "1-2 sentence closing statement"
}`;

  try {
    const response = await client.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Here are the pre-computed statistics for this period:\n${statsText}\n\nWrite the VoC report narrative based strictly on these numbers.` },
      ],
      temperature: 0.4,
      response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(response.choices[0]?.message?.content || "{}");
    return {
      executiveSummary: parsed.executiveSummary || fallbackReport.executiveSummary,
      keyFindings: Array.isArray(parsed.keyFindings) ? parsed.keyFindings : fallbackReport.keyFindings,
      sentimentAnalysis: parsed.sentimentAnalysis || fallbackReport.sentimentAnalysis,
      topIssues: Array.isArray(parsed.topIssues) ? parsed.topIssues : fallbackReport.topIssues,
      recommendedActions: Array.isArray(parsed.recommendedActions) ? parsed.recommendedActions : fallbackReport.recommendedActions,
      conclusion: parsed.conclusion || fallbackReport.conclusion,
    };
  } catch (err) {
    console.error("Error generating VoC report with Groq:", err);
    return fallbackReport;
  }
}

function fallbackClassify(content: string): ClassificationResult {
  const lower = content.toLowerCase();
  let sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE" = "NEUTRAL";
  let sentimentScore = 0.0;

  const posWords = ["love", "great", "awesome", "excellent", "fast", "helpful", "good", "amazing", "easy"];
  const negWords = ["slow", "bug", "crash", "error", "broken", "hate", "frustrat", "terrible", "bad", "issue", "fail"];

  const posCount = posWords.filter((w) => lower.includes(w)).length;
  const negCount = negWords.filter((w) => lower.includes(w)).length;

  if (posCount > negCount) {
    sentiment = "POSITIVE";
    sentimentScore = Math.min(0.9, 0.4 + posCount * 0.2);
  } else if (negCount > posCount) {
    sentiment = "NEGATIVE";
    sentimentScore = Math.max(-0.9, -0.4 - negCount * 0.2);
  }

  let primaryTheme = "General Feedback";
  if (lower.includes("price") || lower.includes("billing") || lower.includes("cost") || lower.includes("plan")) {
    primaryTheme = "Pricing & Billing";
  } else if (lower.includes("slow") || lower.includes("speed") || lower.includes("latency") || lower.includes("lag")) {
    primaryTheme = "Performance & Speed";
  } else if (lower.includes("ui") || lower.includes("design") || lower.includes("dark mode") || lower.includes("button")) {
    primaryTheme = "UI & Experience";
  } else if (lower.includes("bug") || lower.includes("crash") || lower.includes("error")) {
    primaryTheme = "Bugs & Stability";
  } else if (lower.includes("support") || lower.includes("agent") || lower.includes("help")) {
    primaryTheme = "Customer Support";
  }

  return {
    sentiment,
    sentimentScore,
    primaryTheme,
    secondaryThemes: [primaryTheme, "User Feedback"],
    featureArea: primaryTheme,
    rationale: "Rule-based heuristic fallback classification.",
  };
}
