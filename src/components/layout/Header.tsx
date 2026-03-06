"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { useAnalysisStore } from "@/store/analysisStore";
import { clsx } from "clsx";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const STEP_LABELS: Record<string, string> = {
  idle: "Ready to Analyze",
  parsing: "Parsing logs...",
  inferring: "Inferring severities...",
  clustering: "Clustering messages...",
  scoring: "Scoring reliability...",
  synthesizing: "AI synthesis via Gemini...",
  complete: "Analysis Complete",
  error: "Analysis Failed",
};

export function Header() {
  const pathname = usePathname();
  const { pipelineStep, fileName, result } = useAnalysisStore();
  const isRunning = !["idle", "complete", "error"].includes(pipelineStep);

  // Derive title from pathname
  const getPageTitle = () => {
    if (pathname === "/") return "Dashboard Overview";
    if (pathname.includes("log-explorer")) return "Log Explorer";
    if (pathname.includes("playground")) return "Model Playground";
    return "Dashboard";
  };

  return (
    <header className="h-16 flex items-center justify-between px-8 bg-[#0F1115] border-b border-[#272B36] shrink-0 z-20">

      {/* Page Title */}
      <div className="flex items-center gap-4">
        <h1 className="text-[15px] font-semibold text-[#E6E8EF]">
          {getPageTitle()}
        </h1>

        {/* Separator */}
        <div className="w-px h-4 bg-[#272B36]" />

        {/* Pipeline / File Status */}
        <div className="flex items-center gap-2">
          {isRunning && <Loader2 size={14} className="text-[#4F8CFF] animate-spin" />}
          {pipelineStep === "complete" && <CheckCircle2 size={14} className="text-[#22C55E]" />}
          {pipelineStep === "error" && <AlertCircle size={14} className="text-[#EF4444]" />}
          {pipelineStep === "idle" && <div className="w-2 h-2 rounded-full bg-[#3F4554]" />}

          <span className={clsx(
            "text-[12px]",
            pipelineStep === "error" ? "text-[#EF4444]" :
              pipelineStep === "complete" ? "text-[#22C55E]" : "text-[#9BA3AF]"
          )}>
            {STEP_LABELS[pipelineStep]}
          </span>

          {fileName && pipelineStep === "complete" && (
            <>
              <span className="text-[#3F4554] px-1">/</span>
              <span className="text-[12px] font-mono text-[#E6E8EF]">{fileName}</span>
              {result && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#1C1F2A] border border-[#272B36] text-[#9BA3AF] ml-2 flex items-center gap-1.5">
                  {result.stats.total.toLocaleString()} logs
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Actions removed as requested */}
      </div>

    </header>
  );
}
