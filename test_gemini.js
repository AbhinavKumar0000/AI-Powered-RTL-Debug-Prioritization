const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

// Simple env parser as fallback for missing dotenv
function loadEnv() {
  try {
    const data = fs.readFileSync(".env.local", "utf8");
    data.split("\n").forEach(line => {
      const [key, ...value] = line.split("=");
      if (key && value) {
        process.env[key.trim()] = value.join("=").trim().replace(/^"(.*)"$/, '$1');
      }
    });
  } catch (e) {
    console.error("Could not load .env.local");
  }
}

async function test() {
  loadEnv();
  const apiKey = process.env.GOOGLE_API_KEY;
  console.log("API Key exists:", !!apiKey);
  if (!apiKey) return;

  const genAI = new GoogleGenerativeAI(apiKey);
  const models = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro"];

  for (const m of models) {
    console.log(`Testing model: ${m}...`);
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("Hi");
      console.log(`Success with ${m}:`, result.response.text());
      break;
    } catch (e) {
      console.error(`Failed with ${m}:`, e.message);
    }
  }
}

test();
