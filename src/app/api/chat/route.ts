import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Updated to gemini-2.5-flash as per latest requirement
const MODEL = "gemini-2.5-flash";

export async function POST(req: NextRequest) {
  try {
    const { question, analysis } = await req.json();

    if (!question || !analysis) {
      return NextResponse.json(
        { error: "Question and analysis data are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GOOGLE_API_KEY not configured" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Configure safety filters to BLOCK_NONE for all categories
    // Ensuring technical RTL terms aren't blocked
    const model = genAI.getGenerativeModel({
      model: MODEL,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ]
    });

    const { stats, moduleRisks, clusters, logs, summary } = analysis;

    const topClusters = clusters
      .slice(0, 10)
      .map(
        (c: any) =>
          `- Cluster "${c.cluster_name}" (ID ${c.cluster_id}): ${c.description}`
      )
      .join("\n");

    const highRiskModules = moduleRisks
      .filter((m: any) => m.risk_level === "high")
      .map(
        (m: any) =>
          `- ${m.module}: ${(m.failure_probability * 100).toFixed(
            1
          )}% failure probability`
      )
      .join("\n");

    const criticalLogs = logs
      .filter((l: any) => l.severity === "CRITICAL" || l.severity === "ERROR")
      .slice(0, 20)
      .map((l: any) => `[${l.time}ns] ${l.module}: ${l.message}`)
      .join("\n");

    const systemPrompt = `You are a rigid, technical data extraction tool.
You are strictly FORBIDDEN from using conversational filler, greetings, pleasantries, or phrases like "I understand", "Based on the logs", or "Here is the answer".
Directly state the exact technical facts instantly. KEEP IT UNDER 50 WORDS ALWAYS. NO EXCEPTIONS.`;

    const context = `
=== SUMMARY ===
${summary}

=== STATS ===
Total: ${stats.total}
Error density: ${stats.errorDensity.toFixed(2)}%
Critical: ${stats.criticalCount}
High-risk modules: ${stats.highRiskModules}

=== HIGH-RISK MODULES ===
${highRiskModules || "None"}

=== CLUSTERS ===
${topClusters || "None"}

=== SAMPLE CRITICAL/ERROR LOGS ===
${criticalLogs || "None"}
`;

    const prompt = `${systemPrompt}

Goal: Answer this exact question instantly: "${question}"

Context:
${context}`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    return NextResponse.json({ answer });
  } catch (err) {
    console.error("Chat pipeline error:", err);
    return NextResponse.json(
      {
        error: "Chat pipeline failed",
        detail: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
