"use client";
import { useRouter } from "next/navigation";
import { FileDropzone } from "@/components/upload/FileDropzone";
import { useAnalysisStore } from "@/store/analysisStore";
import { LogParser } from "@/lib/logParser";
import { clsx } from "clsx";
import { Play } from "lucide-react";

const PIPELINE_STEPS = [
  { key: "parsing", label: "Parse & Sanitize", api: "Local Engine" },
  { key: "inferring", label: "Severity Inference", api: "Classifier API" },
  { key: "clustering", label: "Semantic Clustering", api: "Intelligence API" },
  { key: "scoring", label: "Reliability Scoring", api: "Reliability Engine" },
  { key: "synthesizing", label: "LLM Synthesis", api: "Gemini 2.5 Flash" },
];

export default function HomePage() {
  const { pipelineStep, pipelineError, pipelineProgress, pipelineMessage } = useAnalysisStore();
  const router = useRouter();

  const isRunning = !["idle", "error"].includes(pipelineStep);

  const loadSampleFile = async () => {
    try {
      const res = await fetch("/rtl.txt");
      if (!res.ok) throw new Error("Failed to load sample log");
      const text = await res.text();
      const file = new File([text], "rtl.txt", { type: "text/plain" });

      const store = useAnalysisStore.getState();
      store.reset();
      store.setFile(file.name, file.size);
      store.setPipelineStep("parsing", 5, "Parsing log file...");

      const parser = new LogParser();
      const parsed = parser.parseFile(text);
      if (parsed.length === 0) {
        store.setPipelineError("No valid log entries found.");
        return;
      }

      store.setPipelineStep("inferring", 15, "Sending to analysis pipeline...");

      const formData = new FormData();
      formData.append("file", file);

      const apiRes = await fetch("/api/analyze", { method: "POST", body: formData });
      if (!apiRes.ok) {
        let message = "Analysis pipeline failed.";
        try {
          const err = await apiRes.json();
          if (err?.error) message = err.error;
          if (err?.detail) message = `${message} (${err.detail})`;
        } catch { }
        store.setPipelineError(message);
        return;
      }
      const result = await apiRes.json();
      store.setResult(result);
      router.push("/dashboard");
    } catch (err: any) {
      useAnalysisStore.getState().setPipelineError(err.message || "Failed to process sample");
    }
  };

  if (pipelineStep === "complete") {
    // Navigate with a small delay so they see the final loading transition
    setTimeout(() => {
      router.replace("/dashboard");
    }, 1500);

    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full animate-fade-in bg-[#0B0F14] min-h-screen">
        <div className="w-16 h-16 rounded-full bg-[#22C55E]/10 border-2 border-[#22C55E]/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.15)]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <h2 className="text-[22px] font-semibold text-[#E6EDF3] tracking-tight">Analysis Complete</h2>
        <p className="text-[14px] text-[#9DA7B3] mt-2 font-mono">Finalizing workspace mapping...</p>
        <div className="w-[300px] h-1.5 bg-[#161C24] border border-[#1E2632] rounded-full overflow-hidden mt-8 shadow-inner">
          <div className="h-full bg-[#22C55E] rounded-full animate-pulse w-full origin-left shadow-[0_0_15px_rgba(34,197,94,0.4)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-center items-center p-8 overflow-y-auto relative bg-[#0B0F14] text-[#E6EDF3] min-h-screen">

      {/* Background Deep Space pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMikiLz48L3N2Zz4=')] pointer-events-none opacity-50" />

      <div className="w-full max-w-[800px] z-10 flex flex-col items-center">

        {/* Sleek Hero header */}
        <div className="text-center space-y-6 animate-fade-in mb-14">
          <h1 className="text-[48px] font-bold text-[#E6EDF3] tracking-tighter leading-[1.1] bg-clip-text">
            AI Bug Prioritizer
          </h1>
          <p className="text-[17px] text-[#9DA7B3] font-medium max-w-[650px] mx-auto leading-relaxed">
            Already contains logs and technical traces to test this project. Upload custom verification logs to automatically detect, cluster, and prioritize critical RTL bugs.
          </p>
        </div>

        {/* Global Upload State Frame */}
        <div className="w-full relative">
          {!isRunning && !pipelineError ? (
            <div className="animate-slide-up flex flex-col items-center w-full" style={{ animationDelay: "0.1s" }}>

              {/* Primary sample trigger relocated to upper position */}
              <button
                onClick={loadSampleFile}
                className="mb-8 flex items-center justify-center gap-2.5 h-[56px] px-10 bg-[#4F8CFF] hover:bg-[#3A73E4] text-white text-[15px] font-bold rounded-2xl transition-all shadow-[0_8px_30px_rgba(79,140,255,0.25)] hover:scale-[1.02] active:scale-[0.98] w-full max-w-[320px] group"
              >
                <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center">
                  <Play size={10} className="fill-white" />
                </div>
                Use Simulation Log (rtl.txt)
              </button>

              {/* Massive Primary Drop Area */}
              <div className="w-full max-w-[720px] z-20">
                <FileDropzone />
              </div>
            </div>
          ) : (
            <div className="animate-fade-in w-full max-w-[720px] mx-auto">
              {/* Pipeline Active view */}
              {!pipelineError && (
                <div className="card p-10 bg-[#161C24] border-[#1E2632]">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-[16px] font-semibold text-[#E6EDF3]">Analysis Pipeline Running</h3>
                      <p className="text-[12px] text-[#9DA7B3] mt-1 font-mono">
                        {pipelineMessage || "Initializing secure environment..."}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[24px] font-mono font-bold text-[#4F8CFF]">
                        {pipelineProgress}%
                      </span>
                    </div>
                  </div>

                  {/* Deep Progress Bar */}
                  <div className="h-2 bg-[#0B0F14] rounded-full overflow-hidden mb-10 border border-[#1E2632] shadow-inner">
                    <div
                      className="h-full bg-[#4F8CFF] rounded-full transition-all duration-700 ease-out glow-primary relative"
                      style={{ width: `${pipelineProgress}%` }}
                    >
                      <div className="absolute top-0 right-0 w-8 h-full bg-white/30 blur-[2px]" />
                    </div>
                  </div>

                  {/* Step tracker */}
                  <div className="space-y-5">
                    {PIPELINE_STEPS.map((step, idx) => {
                      const stepKeys = PIPELINE_STEPS.map((s) => s.key);
                      const currentIdx = stepKeys.indexOf(pipelineStep);
                      const stepIdx = stepKeys.indexOf(step.key);
                      const done = stepIdx < currentIdx;
                      const active = step.key === pipelineStep;

                      return (
                        <div
                          key={step.key}
                          className={clsx(
                            "flex items-center gap-5 transition-all duration-300",
                            !active && !done ? "opacity-30" : "opacity-100"
                          )}
                        >
                          <div
                            className={clsx(
                              "w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0 border text-[11px] font-mono font-bold shadow-sm",
                              done
                                ? "bg-[#22C55E]/10 border-[#22C55E]/40 text-[#22C55E]"
                                : active
                                  ? "bg-[#4F8CFF]/10 border-[#4F8CFF]/60 text-[#4F8CFF] shadow-[0_0_15px_rgba(79,140,255,0.2)]"
                                  : "bg-[#0B0F14] border-[#1E2632] text-[#6B7280]"
                            )}
                          >
                            {done ? (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            ) : (
                              `0${idx + 1}`
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className={clsx("text-[14px] font-medium tracking-tight", done ? "text-[#9DA7B3]" : active ? "text-[#E6EDF3]" : "text-[#6B7280]")}>
                                {step.label}
                              </span>
                              <span className="text-[11px] font-mono text-[#6B7280]">
                                {step.api}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Error state */}
              {pipelineError && (
                <div className="mt-6 p-8 bg-[#EF4444]/5 border border-[#EF4444]/20 rounded-[14px] animate-slide-up shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    <span className="font-bold text-[16px] text-[#E6EDF3] tracking-tight">Pipeline disruption</span>
                  </div>
                  <p className="text-[#EF4444] font-mono text-[13px] bg-[#0B0F14] p-4 rounded-lg border border-[#1E2632]">{pipelineError}</p>
                  <div className="flex items-center gap-3 mt-6">
                    <button onClick={() => useAnalysisStore.getState().reset()} className="px-5 py-2.5 bg-[#161C24] hover:bg-[#1E2632] border border-[#1E2632] text-[#E6EDF3] rounded-lg transition-colors font-medium text-[13px]">
                      Retry with same file
                    </button>
                    <button onClick={() => useAnalysisStore.getState().clearAll()} className="px-5 py-2.5 bg-[#EF4444]/10 hover:bg-[#EF4444]/20 border border-[#EF4444]/30 text-[#EF4444] rounded-lg transition-colors font-medium text-[13px]">
                      Clear all & re-upload
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
