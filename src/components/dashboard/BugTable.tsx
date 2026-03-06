"use client";
import React, { useState, useMemo } from "react";
import { useAnalysisStore } from "@/store/analysisStore";
import type { Severity } from "@/types";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ChevronRight } from "lucide-react";

const SEVERITY_ORDER: Severity[] = ["CRITICAL", "ERROR", "WARNING", "INFO"];
const PAGE_SIZE = 50;

function SeverityBadge({ severity }: { severity: Severity | null }) {
  if (!severity) return <span className="px-2 py-0.5 rounded-md bg-[#0B0F14] text-[#9DA7B3] text-[10px] font-bold border border-[#1E2632]">UNKNOWN</span>;
  const colors = {
    CRITICAL: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20",
    ERROR: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
    WARNING: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
    INFO: "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20",
  }[severity];

  return (
    <span className={clsx("px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider", colors)}>
      {severity}
    </span>
  );
}

export function BugTable() {
  const { result, severityFilter, setSeverityFilter, searchQuery, setSearchQuery } = useAnalysisStore();
  const [page, setPage] = useState(0);
  const [sortCol, setSortCol] = useState<"time" | "severity" | "confidence">("severity");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const clusterMap = useMemo(() => {
    if (!result) return new Map<string, any>();
    return new Map(result.clusters.map((c) => [c.logId, c]));
  }, [result]);

  const filtered = useMemo(() => {
    if (!result) return [];
    return result.logs
      .filter((log) => {
        if (severityFilter && log.severity !== severityFilter) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return (
            log.message.toLowerCase().includes(q) ||
            log.module.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortCol === "severity") {
          const ai = SEVERITY_ORDER.indexOf(a.severity as Severity);
          const bi = SEVERITY_ORDER.indexOf(b.severity as Severity);
          return sortDir === "asc" ? bi - ai : ai - bi;
        }
        if (sortCol === "time") {
          return sortDir === "asc"
            ? Number(a.time) - Number(b.time)
            : Number(b.time) - Number(a.time);
        }
        if (sortCol === "confidence") {
          const ac = clusterMap.get(a.id)?.confidence ?? 0;
          const bc = clusterMap.get(b.id)?.confidence ?? 0;
          return sortDir === "asc" ? ac - bc : bc - ac;
        }
        return 0;
      });
  }, [result, severityFilter, searchQuery, sortCol, sortDir, clusterMap]);

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  if (!result) return null;

  const toggleSort = (col: typeof sortCol) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("desc"); }
  };

  const activeCluster = selectedLog ? clusterMap.get(selectedLog.id) : null;

  return (
    <div className="relative">
      <div className="card overflow-hidden bg-[#161C24] border-[#1E2632] flex flex-col min-h-[500px] shadow-lg">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-[#1E2632] bg-[#0B0F14]/20">
          <div className="flex items-center gap-3">
            <h3 className="text-[16px] font-semibold text-[#E6EDF3] tracking-tight">Logs Explorer</h3>
            <span className="px-2 py-0.5 rounded-full bg-[#4F8CFF]/10 text-[#4F8CFF] text-[10px] font-mono font-bold border border-[#4F8CFF]/20">
              {filtered.length} Trace{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" size={14} />
              <input
                type="text"
                placeholder="Find in logs..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
                className="pl-9 pr-4 py-1.5 text-[12px] bg-[#0B0F14] border border-[#1E2632] rounded-lg text-[#E6EDF3] placeholder-[#6B7280] focus:outline-none focus:border-[#4F8CFF] w-[240px] transition-all font-medium"
              />
            </div>

            {/* Severity filter pills */}
            <div className="flex items-center gap-1 bg-[#0B0F14] p-1 rounded-lg border border-[#1E2632]">
              {([null, "CRITICAL", "ERROR", "WARNING", "INFO"] as (Severity | null)[]).map((s) => (
                <button
                  key={String(s)}
                  onClick={() => { setSeverityFilter(s); setPage(0); }}
                  className={clsx(
                    "px-3 py-1 text-[11px] font-bold rounded-md transition-all uppercase tracking-tight",
                    severityFilter === s
                      ? "bg-[#1E2632] text-[#4F8CFF] border border-[#4F8CFF]/20 shadow-sm"
                      : "text-[#6B7280] hover:text-[#9DA7B3]"
                  )}
                >
                  {s ?? "ALL"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1E2632] bg-[#161C24]/95 sticky top-0 z-10 backdrop-blur-xl text-[11px] font-bold text-[#6B7280] uppercase tracking-[0.1em]">
                <th className="px-6 py-4 cursor-pointer hover:text-[#4F8CFF] transition-colors whitespace-nowrap" onClick={() => toggleSort("time")}>
                  Timestamp {sortCol === "time" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                </th>
                <th className="px-6 py-4">Module Identifier</th>
                <th className="px-6 py-4 w-1/2">Log Perspective</th>
                <th className="px-6 py-4 cursor-pointer hover:text-[#4F8CFF] transition-colors" onClick={() => toggleSort("severity")}>
                  Level {sortCol === "severity" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                </th>
                <th className="px-6 py-4">Pipeline</th>
              </tr>
            </thead>
            <tbody className="text-[13px] text-[#E6EDF3]">
              {paginated.map((log) => {
                const cluster = clusterMap.get(log.id);
                const isSelected = selectedLog?.id === log.id;
                return (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(isSelected ? null : log)}
                    className={clsx(
                      "border-b border-[#1E2632]/50 transition-all cursor-pointer group",
                      isSelected ? "bg-[#4F8CFF]/5" : "hover:bg-[#1E2632]/20"
                    )}
                  >
                    <td className="px-6 py-4 text-[#9DA7B3] font-mono text-[12px]">{log.time ? `${log.time}ns` : "—"}</td>
                    <td className="px-6 py-4 font-semibold text-[#E6EDF3] tracking-tight">{log.module}</td>
                    <td className="px-6 py-4 text-[#9DA7B3] max-w-sm font-medium">
                      <div className="truncate group-hover:text-[#E6EDF3] transition-colors">
                        {log.message}
                      </div>
                    </td>
                    <td className="px-6 py-4"><SeverityBadge severity={log.severity} /></td>
                    <td className="px-6 py-4">
                      {cluster ? (
                        <div className="flex items-center gap-2 text-[#4F8CFF]/60 text-[11px] font-bold uppercase tracking-wider group-hover:text-[#4F8CFF] transition-colors">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4F8CFF] animate-pulse" />
                          Inspected
                        </div>
                      ) : (
                        <span className="text-[#6B7280] font-mono text-[11px]">RAW</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {paginated.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-[#6B7280]">
              <Search size={24} className="mb-2 opacity-50" />
              <p className="text-[13px]">No logs match your filter criteria.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[#272B36] shrink-0">
            <span className="text-[12px] text-[#6B7280]">
              Showing {page * PAGE_SIZE + 1} to {Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length} logs
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 text-[12px] font-medium bg-[#0F1115] border border-[#272B36] text-[#E6E8EF] rounded-md hover:bg-[#272B36] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 text-[12px] font-medium bg-[#0F1115] border border-[#272B36] text-[#E6E8EF] rounded-md hover:bg-[#272B36] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Slide-out Drawer Panel */}
      <AnimatePresence>
        {selectedLog && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="absolute top-0 right-0 bottom-0 w-[440px] bg-[#121821] border-l border-[#1E2632] shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col z-30 m-2 rounded-l-[20px] border-t border-b overflow-hidden"
          >
            <div className="flex items-center justify-between px-8 py-6 border-b border-[#1E2632] bg-[#0B0F14]/40">
              <div>
                <h3 className="text-[16px] font-bold text-[#E6EDF3] tracking-tight whitespace-nowrap">Technical Inspector</h3>
                <p className="text-[11px] font-mono text-[#4F8CFF]/80 uppercase mt-0.5">Log Identity Hash: {selectedLog.id.slice(0, 8)}</p>
              </div>
              <button onClick={() => setSelectedLog(null)} className="p-2 rounded-lg text-[#6B7280] hover:text-[#E6EDF3] hover:bg-[#1E2632] transition-colors border border-transparent hover:border-[#1E2632]">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              <section>
                <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-[0.1em] mb-3">System Message Output</p>
                <div className="bg-[#0B0F14] border border-[#1E2632] rounded-[12px] p-5 text-[14px] text-[#E6EDF3] font-mono leading-relaxed whitespace-pre-wrap shadow-inner selection:bg-[#4F8CFF]/30">
                  {selectedLog.message}
                </div>
              </section>

              <div className="grid grid-cols-1 gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0B0F14]/40 p-4 rounded-xl border border-[#1E2632]">
                    <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">Timing Reference</p>
                    <p className="text-[14px] text-[#E6EDF3] font-mono font-bold tracking-tight">{selectedLog.time ? `${selectedLog.time}ns` : "ASYNCHRONOUS"}</p>
                  </div>
                  <div className="bg-[#0B0F14]/40 p-4 rounded-xl border border-[#1E2632]">
                    <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">Source Module</p>
                    <p className="text-[14px] text-[#E6EDF3] font-bold tracking-tight">{selectedLog.module}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-[#0B0F14]/40 p-4 rounded-xl border border-[#1E2632]">
                  <div>
                    <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">Level Classification</p>
                    <SeverityBadge severity={selectedLog.severity} />
                  </div>
                  {activeCluster && (
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">AI Confidence</p>
                      <p className="text-[18px] text-[#22C55E] font-mono font-bold">
                        {(activeCluster.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {activeCluster && (
                <div className="pt-8 border-t border-[#1E2632]">
                  <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-[0.1em] mb-4">Pipeline Semantic Resolution</p>
                  <div className="space-y-5">
                    <div className="flex items-center justify-between bg-[#4F8CFF]/5 border border-[#4F8CFF]/20 p-4 rounded-xl">
                      <span className="text-[13px] font-medium text-[#9DA7B3]">Associated Motif</span>
                      <span className="text-[13px] text-[#4F8CFF] font-mono font-bold bg-[#4F8CFF]/10 px-2 py-0.5 rounded border border-[#4F8CFF]/20">
                        {activeCluster.cluster_name}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[12px] font-semibold text-[#E6EDF3]">Resolution Strategy</p>
                      {selectedLog.severity === "CRITICAL" ? (
                        <div className="bg-[#EF4444]/1 hover:bg-[#EF4444]/5 border border-[#EF4444]/20 p-4 rounded-xl text-[13px] text-[#EF4444] font-medium leading-relaxed transition-colors shadow-sm">
                          <div className="flex gap-2 items-start">
                            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#EF4444] shrink-0 animate-pulse" />
                            Critical failure path detected. Immediate verification block required. Trace associated logic gates for race conditions.
                          </div>
                        </div>
                      ) : selectedLog.severity === "ERROR" ? (
                        <div className="bg-[#F59E0B]/1 border border-[#F59E0B]/20 p-4 rounded-xl text-[13px] text-[#F59E0B] font-medium leading-relaxed transition-colors shadow-sm">
                          Functional error state. Requires prioritized triage. Review module boundary signals and data parity.
                        </div>
                      ) : (
                        <div className="bg-[#22C55E]/1 border border-[#22C55E]/20 p-4 rounded-xl text-[13px] text-[#22C55E] font-medium leading-relaxed transition-colors shadow-sm">
                          Informational event. System performing as specified. Logged for longitudinal stability tracking.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
