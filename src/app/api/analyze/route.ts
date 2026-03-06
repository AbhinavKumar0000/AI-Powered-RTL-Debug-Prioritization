import { NextRequest, NextResponse } from "next/server";
import { LogParser } from "@/lib/logParser";
import { runAnalysisPipeline } from "@/lib/analysisOrchestrator";
import { synthesizeWithGemini } from "@/lib/geminiClient";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to ArrayBuffer then Blob for microservice compatibility
    const arrayBuffer = await file.arrayBuffer();
    const rawContent = new TextDecoder("utf-8").decode(arrayBuffer);

    // Create a Blob from the arrayBuffer with the correct name "file" expected by the backend
    const fileBlob = new Blob([arrayBuffer], { type: "text/plain" });

    // Step 1 — Parse (This is the only blocking/throwable part)
    const parser = new LogParser();
    const parsedEntries = parser.parseFile(rawContent);

    if (parsedEntries.length === 0) {
      return NextResponse.json(
        { error: "No valid log entries found. Check the file format." },
        { status: 422 }
      );
    }

    // Steps 2–4 — Severity, Clustering, Reliability (Resilient)
    const progressLog: { step: string; progress: number }[] = [];
    const partialResult = await runAnalysisPipeline(
      fileBlob,
      parsedEntries,
      (step, progress) => progressLog.push({ step, progress })
    );

    // Step 5 — LLM Synthesis (Resilient)
    const summary = await synthesizeWithGemini(partialResult);

    const result = {
      ...partialResult,
      summary,
      reliabilityUnavailable: partialResult.reliabilityUnavailable
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("Pipeline error:", err);
    return NextResponse.json(
      {
        error: "Analysis pipeline failed during parsing",
        detail: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
