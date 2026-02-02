
import { GoogleGenAI } from "@google/genai";

/**
 * Service to interact with the Gemini API to get mystic oracle responses.
 * Follows the latest @google/genai SDK patterns.
 */
export const askOracle = async (prompt: string) => {
  // Always create a new instance right before making an API call for consistency
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are the Sorcerer Supreme's Mystic Oracle. Speak in a wise, slightly cryptic, yet helpful manner. Use metaphors involving time, space, and magic. Keep responses concise.",
        temperature: 0.8,
        topP: 0.9,
      },
    });
    // Access the .text property directly as per modern SDK guidelines
    return response.text || "The mirror is clouded. Try again later.";
  } catch (error) {
    console.error("Oracle Error:", error);
    return "The mystical energies are fluctuating. I cannot see clearly.";
  }
};
