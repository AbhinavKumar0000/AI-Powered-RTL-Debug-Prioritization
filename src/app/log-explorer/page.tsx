"use client";
import { useRouter } from "next/navigation";
import { LogViewer } from "@/components/log-explorer/LogViewer";
import { useAnalysisStore } from "@/store/analysisStore";

export default function LogExplorerPage() {
  const { result } = useAnalysisStore();
  const router = useRouter();

  return (
    <div className="h-full flex flex-col">
      {/* Header bar */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-slate-800 flex items-center gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-100">Log Explorer</h2>
          {result && (
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {result.stats.total.toLocaleString()} entries &nbsp;·&nbsp;
              {result.stats.severityBreakdown.CRITICAL} critical &nbsp;·&nbsp;
              {result.stats.severityBreakdown.ERROR} errors
            </p>
          )}
        </div>
        {!result && (
          <button
            onClick={() => router.push("/")}
            className="ml-auto px-3 py-1.5 bg-cobalt-600 hover:bg-cobalt-700 text-white text-xs font-mono rounded-lg transition-colors"
          >
            Upload Log File
          </button>
        )}
      </div>

      {/* Viewer (fills remaining height) */}
      <div className="flex-1 overflow-hidden">
        <LogViewer />
      </div>
    </div>
  );
}
