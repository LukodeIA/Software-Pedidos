import { GoogleGenAI } from "@google/genai";

// Helper to safely get env variable without crashing if process is undefined
const getApiKey = () => {
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env?.API_KEY) {
      // @ts-ignore
      return process.env.API_KEY;
    }
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_KEY) {
      // @ts-ignore
      return import.meta.env.VITE_API_KEY;
    }
  } catch (e) {
    return '';
  }
  return '';
};

const apiKey = getApiKey();
// We initialize AI only if key exists to avoid immediate errors, 
// or pass a placeholder if strict initialization is required by the library logic structure.
const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key-to-prevent-crash' });

export const generateProductDescription = async (productName: string, category: string): Promise<string> => {
  if (!apiKey || apiKey === 'dummy-key-to-prevent-crash') {
    console.warn("Gemini API Key missing. Returning mock description.");
    return `Delicious homemade ${productName} prepared with fresh ingredients. A classic ${category} choice.`;
  }

  try {
    const model = 'gemini-3-flash-preview';
    const prompt = `Write a short, appetizing, mouth-watering description (max 20 words) for a restaurant menu item called "${productName}" in the category "${category}". Do not use quotes.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Fresh and delicious.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Freshly prepared with quality ingredients.";
  }
};