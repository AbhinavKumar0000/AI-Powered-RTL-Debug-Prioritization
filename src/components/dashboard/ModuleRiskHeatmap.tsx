"use client";
import React from "react";
import { useAnalysisStore } from "@/store/analysisStore";
import { clsx } from "clsx";
import { motion } from "framer-motion";

function riskColor(prob: number): string {
  if (prob >= 0.7) return "bg-[#EF4444]";
  if (prob >= 0.4) return "bg-[#F59E0B]";
  return "bg-[#22C55E]";
}

function riskBg(prob: number): string {
  if (prob >= 0.7) return "bg-[#EF4444]/10 border-[#EF4444]/20 hover:border-[#EF4444]/40";
  if (prob >= 0.4) return "bg-[#F59E0B]/10 border-[#F59E0B]/20 hover:border-[#F59E0B]/40";
  return "bg-[#22C55E]/10 border-[#22C55E]/20 hover:border-[#22C55E]/40";
}

function riskText(prob: number): string {
  if (prob >= 0.7) return "text-[#EF4444]";
  if (prob >= 0.4) return "text-[#F59E0B]";
  return "text-[#22C55E]";
}

export function ModuleRiskHeatmap() {
  const { result } = useAnalysisStore();
  if (!result) return null;

  if (result.reliabilityUnavailable || result.moduleRisks.length === 0) {
    return (
      <div className="card p-6 flex items-center justify-center min-h-[200px]">
        <p className="text-[13px] text-[#9BA3AF]">Reliability service data unavailable.</p>
      </div>
    );
  }

  const sorted = [...result.moduleRisks].sort(
    (a, b) => b.failure_probability - a.failure_probability
  );

  return (
    <div className="card p-6 bg-[#161C24] border-[#1E2632]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-[15px] font-semibold text-[#E6EDF3] tracking-tight">Module Health Visualization</h3>
          <p className="text-[13px] text-[#9DA7B3] mt-1">Risk probability across verification blocks</p>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-medium text-[#9DA7B3]">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#22C55E]" /> Low</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> Medium</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#EF4444]" /> High</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sorted.map((m, idx) => (
          <motion.div
            key={m.module}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            whileHover={{ y: -2 }}
            className={clsx(
              "border rounded-[14px] p-5 h-[110px] flex flex-col justify-between transition-colors duration-200 shadow-sm cursor-default",
              riskBg(m.failure_probability)
            )}
          >
            <div className="flex justify-between items-start mb-2">
              <span className={clsx(
                "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                riskText(m.failure_probability),
                "bg-[#0B0F14]/50 border border-current/20"
              )}>
                {m.failure_probability >= 0.7 ? "Critical" : m.failure_probability >= 0.4 ? "Caution" : "Stable"}
              </span>
              <span className={clsx("text-[14px] font-mono font-bold tracking-tight", riskText(m.failure_probability))}>
                {(m.failure_probability * 100).toFixed(0)}<span className="text-[11px] font-sans opacity-70 ml-0.5">%</span>
              </span>
            </div>
            <p className="text-[13px] font-medium text-[#E6EDF3] truncate mb-3" title={m.module}>{m.module}</p>
            <div className="h-1.5 bg-[#0B0F14] rounded-full overflow-hidden border border-[rgba(255,255,255,0.03)] shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, m.failure_probability * 100)}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: idx * 0.05 }}
                className={clsx("h-full rounded-full", riskColor(m.failure_probability))}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
