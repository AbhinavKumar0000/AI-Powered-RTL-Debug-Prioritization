"use client";
import React from "react";
import { useAnalysisStore } from "@/store/analysisStore";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = {
  CRITICAL: "#EF4444",
  ERROR: "#F59E0B",
  WARNING: "#F59E0B",
  INFO: "#22C55E"
};

export function SeverityBreakdownChart() {
  const { result } = useAnalysisStore();
  if (!result) return null;

  const { severityBreakdown } = result.stats;

  const data = [
    { name: "Critical", value: severityBreakdown.CRITICAL, color: COLORS.CRITICAL },
    { name: "Error", value: severityBreakdown.ERROR, color: COLORS.ERROR },
    { name: "Warning", value: severityBreakdown.WARNING, color: COLORS.WARNING },
    { name: "Info", value: severityBreakdown.INFO, color: COLORS.INFO },
  ].filter(d => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="card p-6 flex flex-col items-center justify-center min-h-[300px]">
        <p className="text-[13px] text-[#9BA3AF] font-medium">No severity data available.</p>
      </div>
    );
  }

  return (
    <div className="card p-6 min-h-[300px] flex flex-col">
      <div className="mb-2">
        <h3 className="text-[15px] font-semibold text-[#E6EDF3] tracking-tight">Severity Distribution</h3>
        <p className="text-[13px] text-[#9DA7B3] mt-1">Logs broken down by level</p>
      </div>

      <div className="flex-1 w-full min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#161C24', borderColor: '#1E2632', borderRadius: '8px', fontSize: '12px' }}
              itemStyle={{ color: '#E6EDF3', fontFamily: 'JetBrains Mono, monospace' }}
              itemSorter={() => -1}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', color: '#9DA7B3', fontWeight: 500 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
