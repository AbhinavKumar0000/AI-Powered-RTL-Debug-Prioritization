"use client";
import dynamic from "next/dynamic";
import { useAnalysisStore } from "@/store/analysisStore";
import type { PlotParams } from "react-plotly.js";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export function ClusterDistribution() {
  const { result } = useAnalysisStore();

  if (!result || result.clusters.length === 0) {
    return (
      <div className="card p-6 flex items-center justify-center min-h-[280px]">
        <p className="text-sm text-slate-500 font-mono">No cluster data available.</p>
      </div>
    );
  }

  // Aggregate clusters by name
  const clusterMap = new Map<string, { count: number; id: number }>();
  for (const c of result.clusters) {
    const existing = clusterMap.get(c.cluster_name);
    if (existing) {
      existing.count++;
    } else {
      clusterMap.set(c.cluster_name, { count: 1, id: c.cluster_id });
    }
  }

  const names = Array.from(clusterMap.keys());
  const counts = names.map((n) => clusterMap.get(n)!.count);

  const data: PlotParams["data"] = [
    {
      type: "bar",
      x: counts,
      y: names,
      orientation: "h",
      marker: {
        color: "#6366f1", // Indigo
        line: { color: "#4338ca", width: 1 },
      },
      hovertemplate: "<b>%{y}</b><br>Count: %{x}<br><extra></extra>",
    } as never,
  ];

  const layout: PlotParams["layout"] = {
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    margin: { t: 10, b: 10, l: 120, r: 10 },
    font: { color: "#64748b", family: "JetBrains Mono, monospace" },
    height: 280,
    xaxis: {
      showgrid: false,
      showticklabels: false,
      zeroline: false,
    },
    yaxis: {
      automargin: true,
      showgrid: false,
      showticklabels: true,
      tickfont: { size: 10 },
    },
  };

  const config: PlotParams["config"] = {
    displayModeBar: false,
    responsive: true,
  };

  return (
    <div className="card p-6 bg-slate-950/20 border-slate-800/60">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">
            Cluster distribution
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">
            {clusterMap.size} unique clusters · {result.clusters.length} incidents
          </p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center">
          <svg
            className="text-slate-400"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M3 3v18h18" />
            <path d="M7 15l4-6 4 4 4-8" />
          </svg>
        </div>
      </div>
      <Plot
        data={data}
        layout={layout}
        config={config}
        style={{ width: "100%" }}
        className="animate-fade-in"
      />
    </div>
  );
}
