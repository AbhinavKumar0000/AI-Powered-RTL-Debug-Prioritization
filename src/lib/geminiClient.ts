import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import type { AnalysisResult } from "@/types";

// Update to gemini-1.5-flash for reliability
const MODEL = "gemini-2.5-flash";

export async function synthesizeWithGemini(
  analysis: Omit<AnalysisResult, "summary">
): Promise<string> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return "LLM synthesis unavailable: GOOGLE_API_KEY not configured.";
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  // Apply safety overrides to prevent false positives on hardware failure logs
  const model = genAI.getGenerativeModel({
    model: MODEL,
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ]
  });

  const { stats, moduleRisks, clusters, logs } = analysis;

  // Build a structured context prompt
  const topClusters = clusters
    .slice(0, 10)
    .map(
      (c) =>
        `- Cluster "${c.cluster_name}" (ID ${c.cluster_id}): ${c.description}`
    )
    .join("\n");

  const highRiskModules = moduleRisks
    .filter((m) => m.risk_level === "high")
    .map((m) => `- ${m.module}: ${(m.failure_probability * 100).toFixed(1)}% failure probability`)
    .join("\n");

  const criticalLogs = logs
    .filter((l) => l.severity === "CRITICAL" || l.severity === "ERROR")
    .slice(0, 10)
    .map((l) => `[${l.time}ns] ${l.module}: ${l.message}`)
    .join("\n");

  const prompt = `You are an expert RTL (Register Transfer Level) verification engineer. Analyze the following simulation run results and produce a concise executive summary for the engineering team.

## Simulation Statistics
- Total log entries: ${stats.total}
- Error density: ${stats.errorDensity.toFixed(2)}%
- Critical failures: ${stats.criticalCount}
- High-risk modules: ${stats.highRiskModules}
- Severity breakdown: INFO=${stats.severityBreakdown.INFO}, WARNING=${stats.severityBreakdown.WARNING}, ERROR=${stats.severityBreakdown.ERROR}, CRITICAL=${stats.severityBreakdown.CRITICAL}

## High-Risk Modules (Reliability Engine)
${highRiskModules || "None identified"}

## Bug Clusters Identified (Semantic Intelligence)
${topClusters || "No clusters identified"}

## Critical/Error Log Samples
${criticalLogs || "None"}

---
Provide a structured root cause analysis with:
1. **Executive Summary** — One paragraph describing the overall health of this RTL verification run.
2. **Root Causes** — Top 3-5 most likely root causes based on the cluster names, error patterns, and high-risk modules.
3. **Affected Modules** — Which modules need immediate attention and why.
4. **Recommended Actions** — Specific, actionable debugging steps the verification team should take.
5. **Risk Assessment** — Overall risk level (Low/Medium/High/Critical) and justification.

Be precise, technical, and avoid generic advice. Reference specific module names, cluster names, and error counts from the data.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error("Gemini synthesis error:", err);
    return `LLM synthesis failed but data is available: ${err instanceof Error ? err.message : "Unknown error"}`;
  }
}
