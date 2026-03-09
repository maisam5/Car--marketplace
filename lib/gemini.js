import { GoogleGenerativeAI } from "@google/generative-ai";

let client;

export function getGemini() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY missing");
  }

  if (!client) {
    client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  return client;
}
