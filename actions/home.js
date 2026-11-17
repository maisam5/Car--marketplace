"use server"


import aj from "@/lib/arcjet";
import { prisma } from "@/lib/client";
import { generateWithGemini } from "@/lib/gemini";
import { serializeCarData } from "@/lib/helper";
import { extractJson } from "@/lib/safeParse";
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

export async function processImageSearch(input) {
  try {
    // Rate Limiting with Arcjet (only when ARCJET_KEY is configured)
    if (process.env.ARCJET_KEY) {
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
    }

    let base64;
    let mimeType;

    if (input && typeof input.arrayBuffer === "function") {
      const arrayBuffer = await input.arrayBuffer();
      base64 = Buffer.from(arrayBuffer).toString("base64");
      mimeType = input.type || "image/jpeg";
    } else if (input?.base64) {
      base64 = input.base64;
      mimeType = input.mimeType || "image/jpeg";
    } else {
      return {
        success: false,
        error: "Invalid image input",
      };
    }

    const imagePart = {
      inlineData: {
        data: base64,
        mimeType,
      },
    };

    const prompt = `
Analyze this car image and extract the following information for a search query:
  1. Make (manufacturer)
  2. Body type (SUV, Sedan, Hatchback, Convertible, Coupe, Wagon, Pickup)
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

    const text = await generateWithGemini([imagePart, { text: prompt }]);

    try {
      const carDetails = extractJson(text);
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