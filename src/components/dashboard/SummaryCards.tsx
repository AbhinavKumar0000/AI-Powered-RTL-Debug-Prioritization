"use client";
import React from "react";
import { useAnalysisStore } from "@/store/analysisStore";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import { FileText, AlertTriangle, Layers, Percent, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  trend: number;
  icon: React.ElementType;
  delay?: number;
}

function StatCard({ title, value, trend, icon: Icon, delay = 0 }: StatCardProps) {
  const isPositive = trend >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-[#161C24] border border-[#1E2632] rounded-[16px] p-6 flex flex-col justify-between shadow-sm cursor-default"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-[14px] font-medium text-[#9DA7B3] tracking-tight">{title}</span>
        <div className="w-8 h-8 rounded-lg bg-[#0B0F14] border border-[#1E2632] flex items-center justify-center text-[#9DA7B3] shadow-inner">
          <Icon size={16} />
        </div>
      </div>

      <div className="flex items-baseline gap-3 mt-2">
        <span className="text-[32px] font-mono font-bold text-[#E6E8EF] tracking-tighter">{value}</span>

        <div className={clsx(
          "flex items-center gap-1 text-[11px] font-semibold tracking-wide",
          isPositive ? "text-[#22C55E]" : "text-[#EF4444]"
        )}>
          {isPositive ? <TrendingUp size={12} strokeWidth={2.5} /> : <TrendingDown size={12} strokeWidth={2.5} />}
          {Math.abs(trend)}%
        </div>
      </div>
    </motion.div>
  );
}

export function SummaryCards() {
  const { result } = useAnalysisStore();
  if (!result) return null;
  const { stats } = result;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Logs Processed"
        value={stats.total.toLocaleString()}
        trend={12.4}
        icon={FileText}
        delay={0.1}
      />
      <StatCard
        title="Critical Errors"
        value={stats.criticalCount.toLocaleString()}
        trend={-4.5}
        icon={AlertTriangle}
        delay={0.2}
      />
      <StatCard
        title="Modules Affected"
        value={result.moduleRisks.length.toLocaleString()}
        trend={2.1}
        icon={Layers}
        delay={0.3}
      />
      <StatCard
        title="Error Density"
        value={`${stats.errorDensity.toFixed(1)}%`}
        trend={-1.2}
        icon={Percent}
        delay={0.4}
      />
    </div>
  );
}
