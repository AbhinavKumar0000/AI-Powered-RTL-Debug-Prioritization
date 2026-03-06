"use client";
import React from "react";
import { useAnalysisStore } from "@/store/analysisStore";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export function ErrorTimelineChart() {
  const { result } = useAnalysisStore();
  if (!result) return null;

  const logs = result.logs
    .filter((l) => l.severity === "ERROR" || l.severity === "CRITICAL")
    .map((l) => ({ ...l, t: Number(l.time) || 0 }))
    .sort((a, b) => a.t - b.t);

  const maxT = logs.length ? logs[logs.length - 1].t || 1 : 1;
  const bucketCount = 20;
  const bucketSize = Math.max(maxT / bucketCount, 1);

  const counts = Array(bucketCount).fill(0);
  logs.forEach((l) => {
    const idx = Math.min(bucketCount - 1, Math.floor(l.t / bucketSize));
    counts[idx] += 1;
  });

  const data = counts.map((count, i) => ({
    time: `${Math.round(i * bucketSize)}ns`,
    errors: count,
  }));

  if (logs.length === 0) {
    return (
      <div className="card p-6 flex flex-col items-center justify-center min-h-[300px]">
        <p className="text-[13px] text-[#9BA3AF] font-medium">No error events detected.</p>
      </div>
    );
  }

  return (
    <div className="card p-6 min-h-[300px] flex flex-col">
      <div className="mb-6">
        <h3 className="text-[15px] font-semibold text-[#E6EDF3] tracking-tight">Logs Over Time</h3>
        <p className="text-[13px] text-[#9DA7B3] mt-1">Critical & Error events volume</p>
      </div>

      <div className="flex-1 w-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2632" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#6B7280"
              fontSize={11}
              fontFamily="JetBrains Mono"
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#6B7280"
              fontSize={11}
              fontFamily="JetBrains Mono"
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#161C24', borderColor: '#1E2632', borderRadius: '8px', fontSize: '12px' }}
              itemStyle={{ color: '#E6EDF3', fontFamily: 'JetBrains Mono, monospace' }}
              labelStyle={{ color: '#9DA7B3', marginBottom: '4px' }}
            />
            <Line
              type="monotone"
              dataKey="errors"
              stroke="#4F8CFF"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#4F8CFF", stroke: "#0B0F14", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
