"use client";
import { useState } from "react";
import { clsx } from "clsx";
import { CheckCircle2, Play, TerminalSquare, FileJson, Loader2, Cpu, Activity } from "lucide-react";

const SEVERITY_DEFAULT = JSON.stringify({
  "logs": [
    { "module": "AXI_CTRL", "message": "AXI outstanding read limit reached" },
    { "module": "POWER_CTRL", "message": "Voltage regulator fine tuning completed" },
    { "module": "CACHE_CTRL", "message": "Cache line data parity error during operation" },
    { "module": "MEM_CTRL", "message": "Memory controller state machine transition timeout" },
    { "module": "CLOCK_MANAGER", "message": "Main system clock distribution network failure detected" }
  ]
}, null, 2);

const INTELLIGENCE_DEFAULT = JSON.stringify({
  "log_text": "Voltage sensor reporting out of range"
}, null, 2);

const RELIABILITY_DEFAULT = "100ns [ERROR] MEM_CTRL Parity error detected\n200ns [INFO] AXI_CTRL Transaction completed";

const ENDPOINTS = [
  {
    key: "severity",
    title: "Severity Classifier",
    url: "/api/playground?endpoint=severity",
    method: "POST",
    defaultInput: SEVERITY_DEFAULT,
    inputType: "json",
    description: "Predict severity (INFO/WARNING/ERROR/CRITICAL) for an array of logs.",
  },
  {
    key: "intelligence",
    title: "Intelligence API",
    url: "/api/playground?endpoint=intelligence",
    method: "POST",
    defaultInput: INTELLIGENCE_DEFAULT,
    inputType: "json",
    description: "Retrieves semantic cluster mapping via embedding analysis.",
  },
  {
    key: "reliability",
    title: "Reliability Engine",
    url: "/api/playground?endpoint=reliability",
    method: "POST (multipart)",
    defaultInput: RELIABILITY_DEFAULT,
    inputType: "file",
    description: "Multi-part upload. Computes module-level failures from full log files.",
  },
];

export function ModelPlayground() {
  const [selectedKey, setSelectedKey] = useState("severity");
  const [input, setInput] = useState(SEVERITY_DEFAULT);
  const [result, setResult] = useState<{ req: any; res: any; duration: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endpoint = ENDPOINTS.find((e) => e.key === selectedKey)!;

  const handleEndpointChange = (key: string) => {
    setSelectedKey(key);
    const ep = ENDPOINTS.find(e => e.key === key)!;
    setInput(ep.defaultInput);
    setResult(null);
    setError(null);
  };

  const handleSend = async () => {
    setError(null);
    setResult(null);
    setLoading(true);
    const start = Date.now();

    try {
      let res: Response;
      const proxyUrl = `/api/playground?endpoint=${endpoint.key}`;
      let reqPayload: any = null;

      if (endpoint.inputType === "file") {
        const fd = new FormData();
        const blob = new Blob([input], { type: "text/plain" });
        fd.append("file", blob, "rtl.txt");
        res = await fetch(proxyUrl, { method: "POST", body: fd });
        reqPayload = { info: "Multipart File (rtl.txt)", preview: input.split('\n')[0] + "..." };
      } else {
        try {
          reqPayload = JSON.parse(input);
        } catch (e) {
          throw new Error("Invalid JSON input for this service.");
        }
        res = await fetch(proxyUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reqPayload),
        });
      }

      const data = res.ok ? await res.json() : { error: `HTTP ${res.status}`, statusText: res.statusText };
      setResult({
        req: reqPayload,
        res: data,
        duration: Date.now() - start
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-[#0B0F14] overflow-hidden">
      {/* Header Area */}
      <div className="px-8 py-6 border-b border-[#1E2632] flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 bg-[#0B0F14]/40 backdrop-blur-xl z-20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-[#4F8CFF] shadow-[0_0_8px_rgba(79,140,255,0.6)]" />
            <h2 className="text-[18px] font-bold text-[#E6EDF3] tracking-tight uppercase">Technical Playground</h2>
          </div>
          <p className="text-[13px] text-[#6B7280] font-medium">Inference gateway for high-precision verification engines.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-[#161C24] border border-[#1E2632] rounded-xl shadow-inner">
          <CheckCircle2 size={14} className="text-[#22C55E]" />
          <span className="text-[11px] font-bold text-[#E6EDF3] tracking-widest uppercase">System Nominal</span>
        </div>
      </div>

      {/* Main Workspace: Centered and Framed */}
      <div className="flex-1 overflow-hidden flex items-center justify-center p-8 bg-[radial-gradient(circle_at_center,rgba(79,140,255,0.03)_0%,transparent_70%)]">
        <div className="w-full h-full max-w-[1600px] grid grid-cols-12 gap-6 items-stretch">

          {/* Column 1: Endpoint Navigator (3 cols) */}
          <div className="col-span-3 flex flex-col gap-6 overflow-hidden">
            <div className="flex-1 bg-[#161C24]/40 border border-[#1E2632] rounded-2xl p-4 flex flex-col overflow-hidden">
              <h3 className="text-[10px] font-bold text-[#6B7280] uppercase tracking-[0.2em] mb-4 px-2">Services</h3>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {ENDPOINTS.map((ep) => (
                  <button
                    key={ep.key}
                    onClick={() => handleEndpointChange(ep.key)}
                    className={clsx(
                      "w-full text-left p-4 rounded-xl transition-all duration-300 border group",
                      selectedKey === ep.key
                        ? "bg-[#4F8CFF]/10 border-[#4F8CFF]/30 shadow-lg"
                        : "bg-transparent border-transparent hover:bg-[#161C24] hover:border-[#1E2632]"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={clsx("text-[13px] font-bold", selectedKey === ep.key ? "text-[#4F8CFF]" : "text-[#9DA7B3]")}>
                        {ep.title}
                      </span>
                      <div className={clsx("w-1.5 h-1.5 rounded-full", selectedKey === ep.key ? "bg-[#4F8CFF]" : "bg-[#3F4554]")} />
                    </div>
                    <p className="text-[11px] text-[#6B7280] leading-snug line-clamp-2 italic">{ep.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Model Info Card */}
            <div className="bg-[#161C24] border border-[#1E2632] rounded-2xl p-5 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Cpu size={14} className="text-[#4F8CFF]" />
                <span className="text-[10px] font-bold text-[#E6EDF3] uppercase tracking-widest">Model Config</span>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Engine", val: "Gemini 2.5", color: "text-[#4F8CFF]" },
                  { label: "Stability", val: "Strict (0.1)", color: "text-[#E6EDF3]" },
                  { label: "Window", val: "1M Tokens", color: "text-[#E6EDF3]" }
                ].map(stat => (
                  <div key={stat.label} className="flex justify-between items-center text-[11px]">
                    <span className="text-[#6B7280] font-medium">{stat.label}</span>
                    <span className={clsx("font-bold font-mono", stat.color)}>{stat.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: The Core Editor (5 cols) */}
          <div className="col-span-5 flex flex-col bg-[#161C24] border border-[#1E2632] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#1E2632] flex items-center justify-between bg-[#0B0F14]/40">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/20 border border-[#EF4444]/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#EAB308]/20 border border-[#EAB308]/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]/20 border border-[#22C55E]/40" />
                </div>
                <div className="h-4 w-px bg-[#1E2632] mx-1" />
                <span className="text-[12px] font-bold text-[#E6EDF3] tracking-tight">Request payload.json</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#6B7280] px-2 py-0.5 rounded bg-[#0B0F14] border border-[#1E2632] uppercase">
                {endpoint.inputType}
              </span>
            </div>

            <div className="flex-1 relative bg-[#0B0F14]/20 p-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-full bg-[#0B0F14] rounded-2xl p-6 text-[13px] font-mono text-[#E6EDF3] placeholder-[#3F4554] focus:outline-none resize-none custom-scrollbar leading-relaxed selection:bg-[#4F8CFF]/20 border border-transparent focus:border-[#4F8CFF]/10 transition-colors shadow-inner"
                spellCheck={false}
              />
            </div>

            <div className="p-6 bg-[#0B0F14]/40 border-t border-[#1E2632] flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-1">Target Endpoint</span>
                <span className="text-[11px] font-mono text-[#4F8CFF]">{endpoint.url}</span>
              </div>
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="flex items-center gap-3 px-8 py-3 bg-[#4F8CFF] hover:bg-[#3A73E4] text-white text-[14px] font-bold rounded-2xl transition-all disabled:opacity-30 disabled:grayscale shadow-lg shadow-[#4F8CFF]/20 active:scale-95"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Play size={14} className="fill-white" />}
                {loading ? "INFERRING..." : "RUN INFERENCE"}
              </button>
            </div>
          </div>

          {/* Column 3: Response Viewer (4 cols) */}
          <div className="col-span-4 flex flex-col bg-[#0B0F14] border border-[#1E2632] rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#1E2632] flex items-center justify-between bg-[#161C24]/60">
              <div className="flex items-center gap-3">
                <Activity size={16} className="text-[#22C55E]" />
                <span className="text-[12px] font-bold text-[#E6EDF3] tracking-tight">Response Trace</span>
              </div>
              {result && (
                <span className="text-[10px] font-mono font-bold text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded border border-[#22C55E]/20">
                  {result.duration}ms
                </span>
              )}
            </div>

            <div className="flex-1 overflow-hidden relative group">
              {!result && !loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-[#3F4554] px-12 text-center">
                  <TerminalSquare size={48} className="mb-4 opacity-20" />
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-2">Awaiting Remote Call</p>
                  <p className="text-[12px] italic">Configure payload and trigger the engine above to view structural inference.</p>
                </div>
              )}

              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0B0F14]/60 backdrop-blur-sm z-10">
                  <Loader2 className="animate-spin text-[#4F8CFF] mb-3" size={32} />
                  <p className="text-[10px] font-bold text-[#4F8CFF] tracking-widest uppercase">Processing</p>
                </div>
              )}

              {result && (
                <div className="h-full overflow-y-auto p-6 custom-scrollbar text-[13px] font-mono leading-relaxed bg-[#0B0F14]/20">
                  {JSON.stringify(result.res, null, 2).split('\n').map((line, i) => {
                    const isKey = line.includes('":') && !line.includes('//');
                    return (
                      <div key={i} className="flex group/line">
                        <span className="text-[#232936] select-none inline-block w-8 text-right mr-6 flex-shrink-0 group-hover/line:text-[#4F8CFF]/40 transition-colors">{i + 1}</span>
                        <span className="text-[#9DA7B3] inline-block" dangerouslySetInnerHTML={{
                          __html: isKey
                            ? line.replace(/"([^"]+)":/, '<span class="text-[#4F8CFF] font-bold">"$1"</span>:')
                            : line.replace(/"([^"]+)"/, '<span class="text-[#22C55E]">"$1"</span>')
                        }} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Metadata */}
            <div className="px-6 py-4 border-t border-[#1E2632] bg-[#161C24]/20 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                  <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Auth: OK</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4F8CFF]" />
                  <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Region: int16-primary</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
