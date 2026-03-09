"use server"


import aj from "@/lib/arcjet";
import { prisma } from "@/lib/client";
import { getGemini } from "@/lib/gemini";
import { serializeCarData } from "@/lib/helper";
import { request } from "@arcjet/next";


export async function getFeaturedCars(limit = 3) {
  try {
    const cars = await prisma.car.findMany({
      where: {
        featured: true,
        status: "AVAILABLE",
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return cars.map(serializeCarData);
  } catch (error) {
    throw new Error("error fetching cars" + error.message)
  }
}

export async function processImageSearch(file) {
  try {
    // Rate Limiting with Arcjet
    const req = await request();

    const decision = await aj.protect(req, {
      requested: 1,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        const { remaining, reset } = decision.reason;

        return {
          success: false,
          error: "Rate limit exceeded",
          remaining,
          reset,
        };
      }

      return {
        success: false,
        error: "Request denied",
      };
    }

    // File ko Base64 mein convert karo
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = file.type;

    // Gemini AI Setup
    const genAI = getGemini();

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    const imagePart = {
      inlineData: {
        data: base64,
        mimeType,
      },
    };

    const prompt = `
Analyze this car image and extract the following information for a search query:
  1. Make (manufacturer)
  2. Body type (SUV, Sedan, Hatchback, etc.)
  3. Color

  Format your response as a clean JSON object with these fields:
  {
    "make": "",
    "bodyType": "",
    "color": "",
    "confidence": 0.0
  }

  For confidence, provide a value between 0 and 1 representing how confident you are in your overall identification.
  Only respond with the JSON object, nothing else.
`;

    const result = await model.generateContent([imagePart, prompt]);
    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    try {
      const carDetails = JSON.parse(cleanedText);
      return {
        success: true,
        data: carDetails,
      };
    } catch (parseError) {                 
      console.error("Failed to parse AI response", parseError);
      return {
        success: false,
        error: "Failed to parse AI response",
      };
    }

  } catch (error) {
    console.error("AI Search Error:", error); 
    return {                                            
      success: false,
      error: "AI search error: " + error.message,
    };
  }
}