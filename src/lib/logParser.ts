import type { LogEntry, LogFormat, Severity } from "@/types";

// Regex patterns for each log format
// Format A: 100ns ClkGen Clock edge detected
const FORMAT_A = /^(\d+)ns\s+(\w+)\s+(.+)$/;
// Format B: [100] [ClkGen] Clock edge detected
const FORMAT_B = /^\[(\d+)\]\s+\[(\w+)\]\s+(.+)$/;
// Format C: 100ns [ERROR] ClkGen Clock edge detected
const FORMAT_C = /^(\d+)ns\s+\[(INFO|WARNING|ERROR|CRITICAL)\]\s+([\w_]+)\s+(.+)$/i;

const SEVERITY_MAP: Record<string, Severity> = {
  INFO: "INFO",
  WARNING: "WARNING",
  ERROR: "ERROR",
  CRITICAL: "CRITICAL",
};

export class LogParser {
  private lineCounter = 0;
  private skippedLines: number[] = [];

  detectFormat(line: string): LogFormat {
    if (FORMAT_C.test(line)) return "C";
    if (FORMAT_A.test(line)) return "A";
    if (FORMAT_B.test(line)) return "B";
    return "unknown";
  }

  private parseLine(
    rawLine: string,
    lineNumber: number
  ): LogEntry | null {
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("#")) {
      return null;
    }

    const id = `log-${lineNumber}-${Date.now()}`;

    // Try Format C first (most specific — has severity tag)
    let m = FORMAT_C.exec(trimmed);
    if (m) {
      return {
        id,
        line: lineNumber,
        time: m[1],
        module: m[3],
        message: m[4],
        severity: SEVERITY_MAP[m[2].toUpperCase()] ?? null,
        rawLine,
        format: "C",
      };
    }

    // Try Format A
    m = FORMAT_A.exec(trimmed);
    if (m) {
      return {
        id,
        line: lineNumber,
        time: m[1],
        module: m[2],
        message: m[3],
        severity: null,
        rawLine,
        format: "A",
      };
    }

    // Try Format B
    m = FORMAT_B.exec(trimmed);
    if (m) {
      return {
        id,
        line: lineNumber,
        time: m[1],
        module: m[2],
        message: m[3],
        severity: null,
        rawLine,
        format: "B",
      };
    }

    // Unknown / malformed
    this.skippedLines.push(lineNumber);
    return null;
  }

  parseFile(content: string): LogEntry[] {
    this.lineCounter = 0;
    this.skippedLines = [];
    const lines = content.split(/\r?\n/);
    const entries: LogEntry[] = [];

    for (let i = 0; i < lines.length; i++) {
      this.lineCounter = i + 1;
      const entry = this.parseLine(lines[i], this.lineCounter);
      if (entry) entries.push(entry);
    }

    return entries;
  }

  getSkippedLines(): number[] {
    return this.skippedLines;
  }

  getStats(entries: LogEntry[]) {
    const formatBreakdown = { A: 0, B: 0, C: 0, unknown: 0 };
    const severityBreakdown = { INFO: 0, WARNING: 0, ERROR: 0, CRITICAL: 0 };

    for (const e of entries) {
      formatBreakdown[e.format]++;
      if (e.severity) severityBreakdown[e.severity]++;
    }

    return { formatBreakdown, severityBreakdown };
  }
}
