export function extractJson(text) {
  try {
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start === -1 || end === -1) {
      throw new Error("No JSON found");
    }

    const jsonString = cleaned.slice(start, end + 1);
    return JSON.parse(jsonString);
  } catch (err) {
    throw new Error("Failed to parse Gemini JSON");
  }
}
