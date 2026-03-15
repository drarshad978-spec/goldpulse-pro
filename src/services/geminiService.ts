import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const MODELS = {
  PRO: "gemini-3.1-pro-preview",
  FLASH: "gemini-3-flash-preview"
};

function getAI() {
  const apiKey = process.env.GEMINI_API_KEY || "";
  return new GoogleGenAI({ apiKey });
}

async function callWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && (error?.status === "RESOURCE_EXHAUSTED" || error?.code === 429 || error?.message?.includes("429"))) {
      console.warn(`Quota exceeded, retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return callWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function getChatResponse(message: string, history: { role: string, parts: { text: string }[] }[] = []) {
  return callWithRetry(async () => {
    const ai = getAI();
    const chat = ai.chats.create({
      model: MODELS.PRO,
      config: {
        systemInstruction: "You are GoldPulse AI, a specialist in gold and precious metals markets, specifically for Pakistan. Provide accurate information, market analysis, and investment tips. Use a professional yet approachable tone.",
      },
      history,
    });

    const response = await chat.sendMessage({ message });
    return response.text;
  });
}

export async function analyzeGoldImage(base64Image: string, mimeType: string) {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: MODELS.PRO,
      contents: [
        {
          parts: [
            { text: "Analyze this image related to gold or jewelry. Identify the item, estimate its purity if possible, and provide any relevant market insights or historical context." },
            { inlineData: { data: base64Image, mimeType } }
          ]
        }
      ]
    });
    return response.text;
  });
}

export async function getComplexAnalysis(query: string) {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: MODELS.PRO,
      contents: [{ parts: [{ text: query }] }],
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
        systemInstruction: "Perform a deep, multi-step analysis of the following precious metals market query. Consider global economic factors, geopolitical events, and local market dynamics in Pakistan.",
      }
    });
    return response.text;
  });
}

export async function generateMarketNews() {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: MODELS.FLASH, // Use Flash for news generation to save Pro quota
      contents: "Generate 5 realistic, current-style news headlines and short summaries (1 sentence each) related to the global gold and silver market and the Pakistani economy. Include a 'source' (e.g. Reuters, Bloomberg, SBP), a 'time' (e.g. 10m ago), and an 'impact' level (high, medium, low). Format as JSON array.",
      config: {
        responseMimeType: "application/json",
      }
    });
    return response.text;
  });
}

export async function fetchPriceViaAI(metal: string) {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: MODELS.FLASH, // Use Flash for simple price lookups
      contents: `What is the current spot price of ${metal} in USD per ounce? Return only the numerical value.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    return response.text;
  });
}

export async function fetchExchangeRatesViaAI() {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: MODELS.FLASH, // Use Flash for exchange rates
      contents: "What are the current exchange rates from USD to PKR, EUR, GBP, AED, SAR, and INR? Return as a JSON object with these currency codes as keys and numerical values as values.",
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      },
    });
    return response.text;
  });
}

export async function summarizeTopStories(headlines: string[]) {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: MODELS.FLASH, // Use Flash for summarization
      contents: `Based on these headlines: "${headlines.join('", "')}", provide a concise 2-sentence market outlook for a gold investor in Pakistan. Focus on the immediate impact and sentiment.`,
    });
    return response.text;
  });
}
