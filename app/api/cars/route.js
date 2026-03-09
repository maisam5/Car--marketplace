import { getCars } from "@/actions/car-listing";
import arcjet, { shield, detectBot } from '@arcjet/next';

export async function POST(req) {
  const body = await req.json();

  try {
    const data = await getCars(body);
    return Response.json(data);
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE"],
    }),
  ],
});