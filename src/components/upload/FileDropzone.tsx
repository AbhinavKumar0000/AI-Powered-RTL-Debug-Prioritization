"use client";
import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAnalysisStore } from "@/store/analysisStore";
import { LogParser } from "@/lib/logParser";
import type { AnalysisResult } from "@/types";
import { clsx } from "clsx";

export function FileDropzone() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { setFile, setPipelineStep, setPipelineError, setResult, reset } = useAnalysisStore();

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.match(/\.(log|txt|sim|out)$/i) && !file.type.startsWith("text/")) {
      setPipelineError("Unsupported file type. Please upload a .log, .txt, or .sim file.");
      return;
    }
    reset();
    setFile(file.name, file.size);

    // Step 1 — Local parse preview
    setPipelineStep("parsing", 5, "Parsing log file...");
    const text = await file.text();
    const parser = new LogParser();
    const parsed = parser.parseFile(text);
    if (parsed.length === 0) {
      setPipelineError("No valid log entries found. Verify the file format.");
      return;
    }
    setPipelineStep("inferring", 15, "Sending to analysis pipeline...");

    // Steps 2–5 — Server-side pipeline
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      if (!res.ok) {
        let message = "Analysis pipeline failed.";
        try {
          const err = await res.json();
          if (err?.error) message = err.error;
          if (err?.detail) message = `${message} (${err.detail})`;
        } catch {
          // ignore parse errors, use default message
        }
        setPipelineError(message);
        return;
      }
      const result: AnalysisResult = await res.json();
      setResult(result);
      router.push("/dashboard");
    } catch (err) {
      setPipelineError(err instanceof Error ? err.message : "Network error");
    }
  }, [reset, setFile, setPipelineStep, setPipelineError, setResult, router]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      className={clsx(
        "w-full h-[300px] border-2 border-dashed rounded-[18px] flex flex-col items-center justify-center transition-all duration-300 relative group cursor-pointer overflow-hidden z-20",
        isDragging
          ? "border-[#4F8CFF] bg-[#4F8CFF]/5 shadow-[0_8px_30px_rgba(79,140,255,0.15)] scale-[1.02]"
          : "border-[#2A3442] bg-[#131922] hover:border-[#4F8CFF]/50 hover:shadow-[0_8px_30px_rgba(79,140,255,0.08)]"
      )}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#4F8CFF]/0 to-[#4F8CFF]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <input
        ref={fileInputRef}
        type="file"
        accept=".log,.txt,.sim,.out,text/*"
        className="hidden"
        onChange={onInputChange}
      />

      <div className="relative z-10 flex flex-col items-center text-center pointer-events-none">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4F8CFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={clsx("mb-5 transition-all duration-300", isDragging ? "scale-125 -translate-y-2 opacity-100" : "opacity-90 group-hover:scale-110 group-hover:-translate-y-1")}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
        <span className="text-[20px] font-bold tracking-tight transition-colors text-[#E6EDF3] group-hover:text-white">
          {isDragging ? "Drop to begin analysis" : "Drop RTL Log File or click to upload"}
        </span>
        <span className="text-[13px] text-[#6B7280] font-mono mt-2 transition-colors group-hover:text-[#9DA7B3]">Supports .log .txt .sim .out</span>
      </div>
    </div>
  );
}
