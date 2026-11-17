import { GoogleGenerativeAI } from "@google/generative-ai";

let client;

const GEMINI_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3-flash-preview",
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash",
  "gemini-3.5-flash",
  "gemini-flash-latest",
];

export function getGemini() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GEMENI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY missing");
  }

  if (!client) {
    client = new GoogleGenerativeAI(apiKey);
  }

  return client;
}

/**
 * Generate content using Gemini with automatic model fallback on transient/model errors.
 */
export async function generateWithGemini(parts, { timeoutMs = 15000 } = {}) {
  const genAI = getGemini();
  let lastError;

  for (const modelName of GEMINI_MODELS) {
    const controller = new AbortController();
    let timer;

    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await Promise.race([
        model.generateContent(
          { contents: [{ role: "user", parts }] },
          { signal: controller.signal }
        ),
        new Promise((_, reject) => {
          timer = setTimeout(() => {
            controller.abort();
            reject(new Error("Gemini request timed out"));
          }, timeoutMs);
        }),
      ]);
      return result.response.text();
    } catch (err) {
      lastError = err;
      const msg = (err?.message || "").toLowerCase();
      const isRetryable =
        msg.includes("404") ||
        msg.includes("429") ||
        msg.includes("500") ||
        msg.includes("502") ||
        msg.includes("503") ||
        msg.includes("504") ||
        msg.includes("not found") ||
        msg.includes("high demand") ||
        msg.includes("timed out") ||
        msg.includes("timeout") ||
        msg.includes("abort") ||
        msg.includes("fetch failed");
      if (!isRetryable) {
        throw err;
      }
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError || new Error("All Gemini models failed");
}
