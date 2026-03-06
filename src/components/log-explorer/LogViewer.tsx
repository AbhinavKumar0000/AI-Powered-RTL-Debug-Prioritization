"use client";
import { useState, useMemo } from "react";
import { useAnalysisStore } from "@/store/analysisStore";
import type { Severity } from "@/types";
import { clsx } from "clsx";

const SEV_COLOR: Record<Severity, string> = {
  CRITICAL: "text-red-400 bg-red-500/5 border-l-red-500",
  ERROR: "text-orange-400 bg-orange-500/5 border-l-orange-500",
  WARNING: "text-yellow-400 bg-yellow-500/5 border-l-yellow-500/50",
  INFO: "text-green-400 bg-green-500/5 border-l-green-500/30",
};

const SEV_BORDER: Record<Severity, string> = {
  CRITICAL: "border-l-red-500",
  ERROR: "border-l-orange-500",
  WARNING: "border-l-yellow-500",
  INFO: "border-l-green-500/30",
};

export function LogViewer() {
  const { result, severityFilter, setSeverityFilter, searchQuery, setSearchQuery } = useAnalysisStore();
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 100;

  const filtered = useMemo(() => {
    if (!result) return [];
    return result.logs.filter((log) => {
      if (severityFilter && log.severity !== severityFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          log.message.toLowerCase().includes(q) ||
          log.module.toLowerCase().includes(q) ||
          log.rawLine.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [result, severityFilter, searchQuery]);

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  if (!result) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500 font-mono text-sm">No log data loaded.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-4 border-b border-slate-800 flex-shrink-0">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Filter logs..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
            className="w-full pl-8 pr-3 py-1.5 text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cobalt-600"
          />
        </div>

        <div className="flex items-center gap-1">
          {([null, "CRITICAL", "ERROR", "WARNING", "INFO"] as (Severity | null)[]).map((s) => (
            <button
              key={String(s)}
              onClick={() => { setSeverityFilter(s); setPage(0); }}
              className={clsx(
                "px-2.5 py-1 text-xs font-mono font-semibold rounded transition-all",
                severityFilter === s
                  ? "bg-cobalt-600 text-white"
                  : "bg-slate-800 text-slate-500 hover:text-slate-300"
              )}
            >
              {s ?? "ALL"}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-600 font-mono ml-auto">
          {filtered.length.toLocaleString()} / {result.stats.total.toLocaleString()} entries
        </span>
      </div>

      {/* Log lines */}
      <div className="flex-1 overflow-y-auto font-mono text-xs">
        {paginated.map((log) => {
          const sev = log.severity ?? "INFO";
          return (
            <div
              key={log.id}
              className={clsx(
                "border-l-2 px-4 py-1.5 hover:bg-slate-800/40 transition-colors",
                SEV_BORDER[sev as Severity],
                SEV_COLOR[sev as Severity]
              )}
            >
              <span className="text-slate-600 select-none w-8 inline-block">{log.line}</span>
              <span className="text-slate-600"> {log.time}ns </span>
              <span className={clsx("font-semibold", SEV_COLOR[sev as Severity])}>[{sev}]</span>
              <span className="text-cobalt-400 font-semibold"> {log.module} </span>
              <span className="text-slate-400">{log.message}</span>
              <span className="text-slate-700 ml-2">fmt:{log.format}</span>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-800 flex-shrink-0">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 text-xs font-mono bg-slate-800 text-slate-400 rounded hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Prev
          </button>
          <span className="text-xs font-mono text-slate-600">
            {page + 1} / {totalPages} &nbsp;·&nbsp; {PAGE_SIZE} per page
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 text-xs font-mono bg-slate-800 text-slate-400 rounded hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
