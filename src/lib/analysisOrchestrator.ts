import type {
  LogEntry,
  ClusterResult,
  ModuleRisk,
  AnalysisResult,
  Severity,
  SeverityPrediction,
} from "@/types";

const SEVERITY_API =
  "https://abhinavdread-rtl-log-severity-classifier-api.hf.space/predict_batch";
const INTELLIGENCE_API =
  "https://abhinavdread-rtl-log-intelligence-api.hf.space/analyze_log";
const RELIABILITY_API =
  "https://abhinavdread-rtl-reliability-engine.hf.space/predict_file";

const TIMEOUT_MS = 10000; // 10-second timeout

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout = TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// Step 2: Call Severity Classifier for null-severity logs
async function inferSeverities(
  entries: LogEntry[]
): Promise<Map<string, Severity>> {
  const nullEntries = entries.filter((e) => e.severity === null);
  const severityMap = new Map<string, Severity>();
  if (nullEntries.length === 0) return severityMap;

  const BATCH_SIZE = 50;
  // Only process the first few batches to avoid long waits
  const maxBatches = Math.min(Math.ceil(nullEntries.length / BATCH_SIZE), 5);

  for (let i = 0; i < maxBatches * BATCH_SIZE && i < nullEntries.length; i += BATCH_SIZE) {
    const batch = nullEntries.slice(i, i + BATCH_SIZE);
    try {
      const res = await fetchWithTimeout(SEVERITY_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logs: batch.map((e) => ({ module: e.module, message: e.message })),
        }),
      });

      if (!res.ok) {
        console.warn(`Severity API returned ${res.status}`);
        continue;
      }

      const data: { results: SeverityPrediction[] } = await res.json();
      data.results.forEach((pred, idx) => {
        if (batch[idx]) {
          severityMap.set(batch[idx].id, pred.predicted_severity);
        }
      });
    } catch (err) {
      console.error("Severity API error batch:", err);
      // Individual batch failure doesn't stop others
    }
  }
  return severityMap;
}

// Step 3: Call Intelligence API for unique messages
async function clusterMessages(
  entries: LogEntry[]
): Promise<ClusterResult[]> {
  const uniqueMessages = Array.from(new Set(entries.map((e) => e.message))).slice(0, 20); // Cap at 20 unique for speed
  const clusterMap = new Map<string, ClusterResult>();

  // Process in parallel with individual try-catch
  await Promise.all(
    uniqueMessages.map(async (msg) => {
      try {
        const res = await fetchWithTimeout(INTELLIGENCE_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ log_text: msg }),
        });

        if (!res.ok) {
          console.warn(`Intelligence API failed for message: ${msg.slice(0, 30)}... [Status ${res.status}]`);
          return;
        }

        const data: any = await res.json();
        const analysis = data.analysis;

        if (analysis) {
          clusterMap.set(msg, {
            logId: "", // placeholder
            message: msg,
            cluster_id: analysis.cluster_id ?? -1,
            cluster_name: analysis.cluster_name ?? "Unclustered",
            subsystem: analysis.subsystem,
            description: analysis.description ?? "",
            confidence: analysis.similarity_score ?? 0,
            anomaly: analysis.anomaly,
          });
        }
      } catch (err) {
        console.error(`Clustering error for: ${msg.slice(0, 30)}...`, err);
      }
    })
  );

  // Map results back to all entries
  return entries.map((entry) => {
    const cluster = clusterMap.get(entry.message);
    if (cluster) return { ...cluster, logId: entry.id };
    return {
      logId: entry.id,
      message: entry.message,
      cluster_id: -1,
      cluster_name: "Unclustered",
      description: "Clustering unavailable",
      confidence: 0,
    };
  });
}

// Step 4: Call Reliability Engine with raw file blob
async function scoreReliability(
  fileBlob: Blob
): Promise<{ moduleRisks: ModuleRisk[]; unavailable: boolean }> {
  try {
    const formData = new FormData();
    // Ensure the blob is named "file" as per requirement
    formData.append("file", fileBlob, "rtl.txt");

    const res = await fetchWithTimeout(RELIABILITY_API, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      console.error("Reliability Engine failure:", res.status);
      return { moduleRisks: [], unavailable: true };
    }

    const data = await res.json();
    console.log("Reliability API Data received:", JSON.stringify(data).slice(0, 100));

    let moduleRisks: ModuleRisk[] = [];

    // The backend now returns an array of objects for module_risk
    if (Array.isArray(data.module_risk)) {
      moduleRisks = data.module_risk.map((m: any) => ({
        module: m.module || "Unknown",
        failure_probability: typeof m.failure_probability === "number" ? m.failure_probability : (m.risk_score || 0),
        risk_level: typeof m.risk === "string"
          ? m.risk.toLowerCase()
          : (m.failure_probability >= 0.7 ? "high" : m.failure_probability >= 0.4 ? "medium" : "low"),
        error_count: m.error_count || 0,
      }));
    } else {
      // Fallback for older object mapping
      let moduleData: Record<string, number> = {};
      if (data.module_risk) {
        moduleData = data.module_risk;
      } else if (data.risk_scores) {
        moduleData = data.risk_scores;
      } else if (data.summary && data.module_risk) {
        moduleData = data.module_risk;
      } else if (typeof data === "object" && !Array.isArray(data)) {
        moduleData = data;
      }

      moduleRisks = Object.entries(moduleData)
        .filter(([key]) => !["status", "error", "message", "overall_reliability", "risk", "total_logs", "modules_analyzed", "total_failures", "summary", "module_risk"].includes(key))
        .map(([module, prob]) => ({
          module,
          failure_probability: typeof prob === "number" ? prob : 0,
          risk_level:
            (prob as number) >= 0.7
              ? "high"
              : (prob as number) >= 0.4
                ? "medium"
                : "low",
          error_count: data.error_counts?.[module] ?? 0,
        })) as ModuleRisk[];
    }

    console.log("Mapped Module Risks:", moduleRisks.length);
    return { moduleRisks, unavailable: false };
  } catch (err) {
    console.error("Reliability Engine exception:", err);
    return { moduleRisks: [], unavailable: true };
  }
}

// Master pipeline orchestrator
export async function runAnalysisPipeline(
  fileBlob: Blob,
  parsedEntries: LogEntry[],
  onProgress: (step: string, progress: number) => void
): Promise<Omit<AnalysisResult, "summary">> {
  // Step 2 – Severity inference (20-45%)
  onProgress("inferring severities", 20);
  let severityMap = new Map<string, Severity>();
  try {
    severityMap = await inferSeverities(parsedEntries);
  } catch (e) {
    console.error("Severity inference failed completely", e);
  }

  // Apply inferred severities with fallback to INFO
  const entries = parsedEntries.map((e) => ({
    ...e,
    severity: e.severity ?? severityMap.get(e.id) ?? "INFO",
  }));
  onProgress("severities complete", 45);

  // Step 3 – Clustering (45-70%)
  onProgress("clustering logs", 50);
  let clusters: ClusterResult[] = [];
  try {
    // Limit clustering to first 100 entries to prevent timeouts
    const clusterSample = entries.slice(0, 100);
    clusters = await clusterMessages(clusterSample);
  } catch (e) {
    console.error("Clustering failed completely", e);
    // Fallback handled inside clusterMessages
    clusters = entries.slice(0, 100).map(e => ({
      logId: e.id,
      message: e.message,
      cluster_id: -1,
      cluster_name: "Unclustered",
      description: "Service unreachable",
      confidence: 0
    }));
  }
  onProgress("clustering complete", 70);

  // Step 4 – Reliability scoring (70-90%)
  onProgress("scoring module reliability", 75);
  let moduleRisks: ModuleRisk[] = [];
  let reliabilityUnavailable = false;
  try {
    // Wrap reliability fetch in a final safeguard to ensure progress bar doesn't stall
    const reliabilityRes = await scoreReliability(fileBlob).catch((err) => {
      console.error("Final catch in reliability scoring:", err);
      return { moduleRisks: [], unavailable: true };
    });
    moduleRisks = reliabilityRes.moduleRisks;
    reliabilityUnavailable = reliabilityRes.unavailable;
  } catch (e) {
    console.error("Reliability scoring outer catch:", e);
    reliabilityUnavailable = true;
  }
  onProgress("scoring complete", 90);

  // Compute stats
  const total = entries.length;
  const errorCount = entries.filter(
    (e) => e.severity === "ERROR" || e.severity === "CRITICAL"
  ).length;
  const criticalCount = entries.filter((e) => e.severity === "CRITICAL").length;
  const highRiskModules = moduleRisks.filter(
    (m) => m.risk_level === "high"
  ).length;
  const errorDensity = total > 0 ? (errorCount / total) * 100 : 0;

  const severityBreakdown = {
    INFO: entries.filter((e) => e.severity === "INFO").length,
    WARNING: entries.filter((e) => e.severity === "WARNING").length,
    ERROR: entries.filter((e) => e.severity === "ERROR").length,
    CRITICAL: entries.filter((e) => e.severity === "CRITICAL").length,
  };

  const formatBreakdown = {
    A: entries.filter((e) => e.format === "A").length,
    B: entries.filter((e) => e.format === "B").length,
    C: entries.filter((e) => e.format === "C").length,
    unknown: entries.filter((e) => e.format === "unknown").length,
  };

  onProgress("finalizing analysis", 100);

  return {
    logs: entries,
    clusters,
    moduleRisks,
    reliabilityUnavailable,
    stats: {
      total,
      errorDensity,
      criticalCount,
      highRiskModules,
      formatBreakdown,
      severityBreakdown,
    },
  };
}
