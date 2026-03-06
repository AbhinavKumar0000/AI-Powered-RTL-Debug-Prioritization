"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAnalysisStore } from "@/store/analysisStore";
import { SummaryCards } from "@/components/dashboard/SummaryCards";

import { ModuleRiskHeatmap } from "@/components/dashboard/ModuleRiskHeatmap";
import { SeverityBreakdownChart } from "@/components/dashboard/SeverityBreakdownChart";
import { ErrorTimelineChart } from "@/components/dashboard/ErrorTimelineChart";
import { BugTable } from "@/components/dashboard/BugTable";
import { AIInsightsPanel } from "@/components/dashboard/AIInsightsPanel";
import { LogChatPanel } from "@/components/chat/LogChatPanel";

export default function DashboardPage() {
  const { result, pipelineStep } = useAnalysisStore();
  const router = useRouter();

  useEffect(() => {
    if (pipelineStep === "idle") router.replace("/");
  }, [pipelineStep, router]);

  if (!result) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-[#9BA3AF] text-[13px] mb-4">
            No analysis data. Upload a log file first.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-[#4F8CFF] hover:bg-[#3A73E4] text-white text-[13px] font-medium rounded-lg transition-colors"
          >
            Upload File
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 pb-32">
      <div className="max-w-[1400px] mx-auto space-y-8">

        {/* Row 1: Stats Cards */}
        <SummaryCards />

        {/* Row 2: Developer Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ErrorTimelineChart />
          <SeverityBreakdownChart />
        </div>

        {/* Row 3: Module Risk Heatmap */}
        <div className="grid grid-cols-1 gap-6">
          <ModuleRiskHeatmap />
        </div>

        {/* Row 4: AI Insights + Chat */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          <div className="xl:col-span-2 h-[480px]">
            <AIInsightsPanel />
          </div>
          <div className="xl:col-span-3 h-[480px]">
            <LogChatPanel />
          </div>
        </div>

        {/* Row 5: Logs Details Table */}
        <BugTable />

      </div>
    </div>
  );
}
