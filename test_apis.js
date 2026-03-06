const fs = require('fs');

async function testSeverity() {
  const payload = {
    logs: [
      { module: "AXI_CTRL", message: "AXI outstanding read limit reached" },
      { module: "POWER_CTRL", message: "Voltage regulator fine tuning completed" }
    ]
  };
  const res = await fetch("https://abhinavdread-rtl-log-severity-classifier-api.hf.space/predict_batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  console.log("SEVERITY STATUS:", res.status);
  console.log("SEVERITY RESPONSE:", await res.text());
}

async function testIntelligence() {
  const payload = { log_text: "Voltage sensor reporting out of range" };
  const res = await fetch("https://abhinavdread-rtl-log-intelligence-api.hf.space/analyze_log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  console.log("INTELLIGENCE STATUS:", res.status);
  console.log("INTELLIGENCE RESPONSE:", await res.text());
}

async function testReliability() {
  const logContent = `100ns [ERROR] MEM_CTRL Parity error detected
200ns [INFO] AXI_CTRL Transaction completed`;
  const blob = new Blob([logContent], { type: "text/plain" });
  const fd = new FormData();
  fd.append("file", blob, "rtl.txt");

  const res = await fetch("https://abhinavdread-rtl-reliability-engine.hf.space/predict_file", {
    method: "POST",
    body: fd
  });
  console.log("RELIABILITY STATUS:", res.status);
  console.log("RELIABILITY RESPONSE:", await res.text());
}

async function run() {
  await testSeverity();
  await testIntelligence();
  await testReliability();
}
run();
