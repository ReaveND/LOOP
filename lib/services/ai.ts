import Groq from "groq-sdk";

export function getGroqClient() {
  const key = process.env.GROQ_API_KEY;
  return key ? new Groq({ apiKey: key }) : null;
}

export const MODEL_NAME = process.env.GROQ_MODEL_NAME || "llama-3.3-70b-versatile";

export interface ClassificationResult {
  sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  sentimentScore: number; // -1.0 to 1.0
  primaryTheme: string;
  secondaryThemes: string[];
  featureArea: string;
  rationale: string;
}

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

    const sentiment = ["POSITIVE", "NEUTRAL", "NEGATIVE"].includes(parsed.sentiment?.toUpperCase())
      ? (parsed.sentiment.toUpperCase() as "POSITIVE" | "NEUTRAL" | "NEGATIVE")
      : "NEUTRAL";

    const sentimentScore = typeof parsed.sentimentScore === "number"
      ? Math.max(-1, Math.min(1, parsed.sentimentScore))
      : sentiment === "POSITIVE" ? 0.7 : sentiment === "NEGATIVE" ? -0.7 : 0.0;

    return {
      sentiment,
      sentimentScore,
      primaryTheme: parsed.primaryTheme?.trim() || "General Feedback",
      secondaryThemes: Array.isArray(parsed.secondaryThemes) ? parsed.secondaryThemes : [],
      featureArea: parsed.featureArea?.trim() || "General",
      rationale: parsed.rationale || "Auto-classified by Groq GPT OSS 120B",
    };
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
