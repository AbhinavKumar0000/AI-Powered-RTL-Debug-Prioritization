"use client";
import React from "react";
import { useAnalysisStore } from "@/store/analysisStore";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

export function ModuleSeverityHeatmap() {
  const { result } = useAnalysisStore();
  if (!result) return null;

  const logs = result.logs.filter(l => l.severity === "ERROR" || l.severity === "CRITICAL");

  const moduleCounts: Record<string, { critical: number; error: number }> = {};
  logs.forEach(l => {
    if (!moduleCounts[l.module]) {
      moduleCounts[l.module] = { critical: 0, error: 0 };
    }
    if (l.severity === "CRITICAL") moduleCounts[l.module].critical += 1;
    if (l.severity === "ERROR") moduleCounts[l.module].error += 1;
  });

  const data = Object.entries(moduleCounts)
    .map(([module, counts]) => ({
      module,
      errors: counts.error + counts.critical,
      critical: counts.critical,
      warning: counts.error,
    }))
    .sort((a, b) => b.errors - a.errors)
    .slice(0, 10); // Top 10 modules

  if (data.length === 0) {
    return (
      <div className="card p-6 flex items-center justify-center min-h-[300px]">
        <p className="text-[13px] text-[#9BA3AF]">No module error data.</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#1C1F2A] border border-[#272B36] rounded-lg p-3 shadow-xl backdrop-blur-xl">
          <p className="text-[13px] font-semibold text-[#E6E8EF] mb-2">Module: <span className="text-[#4F8CFF]">{label}</span></p>
          <div className="space-y-1 text-[12px]">
            <p className="text-[#9BA3AF]">Errors: <span className="text-[#E6E8EF] font-medium">{data.errors}</span></p>
            <p className="text-[#9BA3AF]">Critical: <span className="text-[#EF4444] font-medium">{data.critical}</span></p>
            <p className="text-[#9BA3AF]">Warnings: <span className="text-[#F59E0B] font-medium">{data.warning}</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card p-6 min-h-[300px] flex flex-col">
      <div className="mb-6">
        <h3 className="text-[14px] font-semibold text-[#E6E8EF]">Errors per Module</h3>
        <p className="text-[12px] text-[#9BA3AF] mt-1">Top 10 most failing modules</p>
      </div>

      <div className="flex-1 w-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#272B36" vertical={false} />
            <XAxis
              dataKey="module"
              stroke="#6B7280"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#6B7280"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#272B36', opacity: 0.4 }} />
            <Bar dataKey="errors" radius={[4, 4, 0, 0]} barSize={24}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.critical > 0 ? "#EF4444" : "#F59E0B"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
