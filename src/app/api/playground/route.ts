import { NextRequest, NextResponse } from "next/server";

const ENDPOINTS: Record<string, string> = {
  severity: "https://abhinavdread-rtl-log-severity-classifier-api.hf.space/predict_batch",
  intelligence: "https://abhinavdread-rtl-log-intelligence-api.hf.space/analyze_log",
  reliability: "https://abhinavdread-rtl-reliability-engine.hf.space/predict_file",
};

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const endpointKey = url.searchParams.get("endpoint");

    if (!endpointKey || !ENDPOINTS[endpointKey]) {
      return NextResponse.json({ error: "Invalid endpoint" }, { status: 400 });
    }

    const targetUrl = ENDPOINTS[endpointKey];

    // For Reliability Engine (Multipart)
    if (endpointKey === "reliability") {
      const formData = await req.formData();
      const res = await fetch(targetUrl, {
        method: "POST",
        body: formData,
      });

      const text = await res.text();
      let data: unknown;
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }

      if (!res.ok) {
        return NextResponse.json(
          {
            error: "Upstream reliability endpoint failed",
            status: res.status,
            statusText: res.statusText,
            endpoint: targetUrl,
            payloadType: "multipart/form-data",
            response: data,
          },
          { status: 502 }
        );
      }

      return NextResponse.json(data, { status: res.status });
    }

    // For JSON endpoints
    const body = await req.json();
    const res = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!res.ok) {
      return NextResponse.json(
        {
          error: "Upstream playground endpoint failed",
          status: res.status,
          statusText: res.statusText,
          endpoint: targetUrl,
          payloadType: "json",
          response: data,
        },
        { status: 502 }
      );
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Playground proxy error:", err);
    return NextResponse.json(
      { error: "Proxy failure", detail: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
