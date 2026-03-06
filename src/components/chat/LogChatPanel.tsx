"use client";
import { useState, useRef, useEffect } from "react";
import { useAnalysisStore } from "@/store/analysisStore";
import { clsx } from "clsx";
import { Cpu, Play, Loader2 } from "lucide-react";

export function LogChatPanel() {
  const { result, chatHistory, appendChatMessage } = useAnalysisStore();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const disabled = !result || loading;

  const handleSend = async () => {
    if (!input.trim() || !result) return;
    const question = input.trim();
    setInput("");
    appendChatMessage("user", question);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          analysis: result,
        }),
      });

      const data = await res.json();
      const answer =
        data?.answer ||
        data?.summary ||
        "The assistant could not generate an answer. Please try again.";

      appendChatMessage("assistant", answer);
    } catch (err) {
      appendChatMessage(
        "assistant",
        err instanceof Error ? err.message : "Chat request failed."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!result) {
    return null;
  }

  return (
    <div className="card flex flex-col h-full min-h-[440px] bg-[#161C24] border-[#1E2632] shadow-2xl relative overflow-hidden group">
      {/* Glossy Header */}
      <div className="flex items-center justify-between px-6 py-4 z-10 border-b border-[#1E2632] bg-[#0B0F14]/30 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B0F14] border border-[#1E2632] shadow-inner text-[#4F8CFF]">
            <Cpu size={20} className="glow-primary-text" />
            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#161C24] bg-[#22C55E]" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-[#E6EDF3] tracking-tight">
              Log Context Intelligence
            </h3>
            <p className="text-[10px] text-[#6B7280] font-mono tracking-[0.1em] uppercase mt-0.5">
              Gemini 2.5 Flash · Analytical Assistant
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 px-6 py-6 custom-scrollbar z-10">
        {chatHistory.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full opacity-40">
            <Cpu size={32} className="text-[#6B7280] mb-4" />
            <p className="text-[#6B7280] text-[12px] font-mono text-center uppercase tracking-widest leading-relaxed">
              Synthesize patterns,<br />verify modules, or<br />trace failures.
            </p>
          </div>
        )}

        {chatHistory.map((m, idx) => (
          <div
            key={idx}
            className={clsx(
              "flex flex-col animate-fade-in",
              m.role === "user" ? "items-end" : "items-start"
            )}
          >
            <div className="flex items-center gap-2 mb-2 px-1">
              <span className={clsx("text-[10px] font-mono font-bold uppercase tracking-wider", m.role === "user" ? "text-[#4F8CFF]" : "text-[#22C55E]")}>
                {m.role === "user" ? "Local Operator" : "Synthetic Engine"}
              </span>
            </div>
            <div
              className={clsx(
                "rounded-[16px] px-5 py-3.5 text-[13px] font-medium leading-relaxed max-w-[85%] shadow-md",
                m.role === "user"
                  ? "bg-[#4F8CFF]/10 text-[#E6EDF3] border border-[#4F8CFF]/20 rounded-tr-none"
                  : "bg-[#0B0F14] text-[#9DA7B3] border border-[#1E2632] rounded-tl-none whitespace-pre-wrap"
              )}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex flex-col items-start animate-fade-in">
            <div className="flex items-center gap-2 mb-1 px-1">
              <span className="text-[10px] font-mono font-bold uppercase text-emerald-500">
                AI
              </span>
            </div>
            <div className="rounded-2xl p-3.5 max-w-[90%] shadow-sm bg-slate-900/80 border border-slate-700/50 rounded-tl-sm flex items-center gap-1.5 h-10 w-16 justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-[#1E2632] bg-[#0B0F14]/20 relative z-20">
        <div className="relative group/input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              disabled
                ? "Autonomous reasoning engaged..."
                : "Ask engine specific module or pattern questions..."
            }
            disabled={disabled}
            className="w-full pl-6 pr-14 py-4 text-[13px] bg-[#0B0F14] border border-[#1E2632] rounded-[14px] text-[#E6EDF3] placeholder-[#3F4554] focus:outline-none focus:border-[#4F8CFF]/50 focus:ring-1 focus:ring-[#4F8CFF]/20 transition-all shadow-inner font-medium"
          />
          <button
            onClick={handleSend}
            disabled={disabled}
            className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center rounded-[10px] bg-[#4F8CFF] text-white hover:bg-[#3A73E4] disabled:opacity-30 disabled:grayscale transition-all shadow-lg hover:shadow-[#4F8CFF]/30 active:scale-95"
          >
            <Play size={14} className="fill-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
