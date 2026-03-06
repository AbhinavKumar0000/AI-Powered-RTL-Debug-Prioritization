"use client";
import { useAnalysisStore } from "@/store/analysisStore";
import { Sparkles, Loader2 } from "lucide-react";

// Minimal markdown-to-HTML renderer adjusted for the new theme
function renderMarkdown(text: string): string {
  return text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/^### (.+)$/gm, '<h4 class="text-[12px] font-bold text-[#4F8CFF] mt-5 mb-2 font-mono uppercase tracking-wider">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 class="text-[14px] font-semibold text-[#E6E8EF] mt-6 mb-3">$1</h3>')
    .replace(/^# (.+)$/gm, '<h2 class="text-[16px] font-semibold text-[#E6E8EF] mt-5 mb-3">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-[#E6E8EF] font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="text-[#9BA3AF] italic">$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-[#0F1115] border border-[#272B36] text-[#4F8CFF] px-1.5 py-0.5 rounded text-[11px] font-mono">$1</code>')
    .replace(/^[-*] (.+)$/gm, '<li class="ml-4 text-[#9BA3AF] list-disc list-outside tracking-wide mb-1.5">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 text-[#9BA3AF] list-decimal list-outside tracking-wide mb-1.5">$1</li>')
    .replace(/^---$/gm, '<hr class="border-[#272B36] my-5" />')
    .replace(/\n\n/g, '</p><p class="text-[#9BA3AF] text-[13px] leading-relaxed mb-3">')
    .replace(/\n/g, "<br />");
}

export function AIInsightsPanel() {
  const { result, pipelineStep } = useAnalysisStore();

  if (pipelineStep === "synthesizing") {
    return (
      <div className="bg-[#161C24] border border-[#1E2632] rounded-[16px] p-8 h-full flex flex-col justify-center shadow-lg relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#4F8CFF]/30 to-transparent animate-shimmer" />
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#0B0F14] border border-[#1E2632] flex items-center justify-center">
            <Loader2 size={20} className="text-[#4F8CFF] animate-spin" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-[#E6EDF3] tracking-tight">AI Insights</h3>
            <span className="text-[11px] text-[#4F8CFF] font-mono uppercase tracking-wider">Synthesizing intelligence...</span>
          </div>
        </div>
        <div className="space-y-4">
          {[100, 85, 92, 75, 65].map((w, i) => (
            <div
              key={i}
              className="h-2 rounded-full bg-[#0B0F14] overflow-hidden"
              style={{ width: `${w}%` }}
            >
              <div
                className="h-full bg-gradient-to-r from-[#4F8CFF]/10 via-[#4F8CFF]/20 to-[#4F8CFF]/10 animate-pulse-slow"
                style={{ width: '100%', animationDelay: `${i * 150}ms` }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!result?.summary) return null;

  return (
    <div className="bg-[#161C24] border border-[#1E2632] rounded-[16px] flex flex-col h-full shadow-lg overflow-hidden">
      <div className="px-8 py-5 flex items-center gap-4 shrink-0 bg-[#0B0F14]/30 border-b border-[#1E2632]">
        <div className="w-10 h-10 bg-[#0B0F14] rounded-xl flex items-center justify-center border border-[#1E2632] text-[#4F8CFF] shadow-inner">
          <Sparkles size={20} className="glow-primary-text" />
        </div>
        <div>
          <h3 className="text-[16px] font-semibold text-[#E6EDF3] tracking-tight">AI Root Cause Analysis</h3>
          <p className="text-[11px] font-mono text-[#6B7280] uppercase tracking-wider">Gemini 2.5 Flash · Technical Synthesis</p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-6">
        <div className="h-full bg-[#121821] border border-[#1E2632] rounded-[12px] p-6 overflow-y-auto custom-scrollbar shadow-inner relative">
          <div className="absolute top-0 right-0 p-4 pointer-events-none opacity-10">
            <Sparkles size={120} className="text-[#4F8CFF]" />
          </div>
          <div
            className="relative z-10 text-[#9DA7B3] prose-invert max-w-none"
            dangerouslySetInnerHTML={{
              __html: `<p class="text-[#9DA7B3] text-[14px] leading-relaxed mb-4">${renderMarkdown(result.summary)}</p>`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
