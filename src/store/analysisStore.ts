"use client";
import { create } from "zustand";
import type { AnalysisResult, PipelineStep } from "@/types";

interface AnalysisStore {
  // File state
  fileName: string | null;
  fileSize: number | null;

  // Pipeline state
  pipelineStep: PipelineStep;
  pipelineProgress: number;
  pipelineMessage: string;
  pipelineError: string | null;

  // Analysis results (persisted across filter changes)
  result: AnalysisResult | null;

  // Active filters (do NOT affect underlying result data)
  severityFilter: string | null;
  clusterFilter: string | null;
  searchQuery: string;

  // Chatbot state
  chatHistory: { role: "user" | "assistant"; content: string }[];

  // Actions
  setFile: (name: string, size: number) => void;
  setPipelineStep: (step: PipelineStep, progress: number, message: string) => void;
  setPipelineError: (error: string) => void;
  setResult: (result: AnalysisResult) => void;
  setSeverityFilter: (severity: string | null) => void;
  setClusterFilter: (cluster: string | null) => void;
  setSearchQuery: (query: string) => void;
  appendChatMessage: (role: "user" | "assistant", content: string) => void;
  reset: () => void;
  clearAll: () => void;
}

export const useAnalysisStore = create<AnalysisStore>((set) => ({
  fileName: null,
  fileSize: null,
  pipelineStep: "idle",
  pipelineProgress: 0,
  pipelineMessage: "",
  pipelineError: null,
  result: null,
  severityFilter: null,
  clusterFilter: null,
  searchQuery: "",
  chatHistory: [],

  setFile: (name, size) => set({ fileName: name, fileSize: size }),

  setPipelineStep: (step, progress, message) =>
    set({ pipelineStep: step, pipelineProgress: progress, pipelineMessage: message }),

  setPipelineError: (error) =>
    set({ pipelineStep: "error", pipelineError: error }),

  setResult: (result: AnalysisResult) =>
    set({ result, pipelineStep: "complete", pipelineProgress: 100 }),

  setSeverityFilter: (severity) => set({ severityFilter: severity }),
  setClusterFilter: (cluster) => set({ clusterFilter: cluster }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  appendChatMessage: (role, content) =>
    set((state) => ({
      chatHistory: [...state.chatHistory, { role, content }],
    })),

  reset: () =>
    set({
      fileName: null,
      fileSize: null,
      pipelineStep: "idle",
      pipelineProgress: 0,
      pipelineMessage: "",
      pipelineError: null,
      result: null,
      severityFilter: null,
      clusterFilter: null,
      searchQuery: "",
      chatHistory: [],
    }),

  clearAll: () =>
    set({
      fileName: null,
      fileSize: null,
      pipelineStep: "idle",
      pipelineProgress: 0,
      pipelineMessage: "",
      pipelineError: null,
      result: null,
      severityFilter: null,
      clusterFilter: null,
      searchQuery: "",
      chatHistory: [],
    }),
}));
