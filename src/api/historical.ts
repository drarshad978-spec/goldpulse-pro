import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface HistoricalData {
  time: string;
  value: number;
}

export async function fetchHistoricalPrices(
  timeframe: string = '1M', 
  customRange?: { start: string; end: string }
): Promise<HistoricalData[]> {
  let prompt = "";
  
  if (customRange) {
    prompt = `Provide the daily closing spot price of gold (XAU/USD) from ${customRange.start} to ${customRange.end}. Return the data as a JSON array of objects with 'time' (YYYY-MM-DD) and 'value' (number) keys.`;
  } else {
    const promptMap: Record<string, string> = {
      '1D': "Provide the hourly spot price of gold (XAU/USD) for the last 24 hours. Return the data as a JSON array of objects with 'time' (YYYY-MM-DD HH:mm) and 'value' (number) keys.",
      '1W': "Provide the daily closing spot price of gold (XAU/USD) for each of the last 7 days. Return the data as a JSON array of objects with 'time' (YYYY-MM-DD) and 'value' (number) keys.",
      '1M': "Provide the daily closing spot price of gold (XAU/USD) for each of the last 30 days. Return the data as a JSON array of objects with 'time' (YYYY-MM-DD) and 'value' (number) keys.",
      '1Y': "Provide the weekly closing spot price of gold (XAU/USD) for the last 52 weeks. Return the data as a JSON array of objects with 'time' (YYYY-MM-DD) and 'value' (number) keys.",
      'ALL': "Provide the monthly closing spot price of gold (XAU/USD) for the last 5 years. Return the data as a JSON array of objects with 'time' (YYYY-MM-DD) and 'value' (number) keys."
    };
    prompt = promptMap[timeframe] || promptMap['1M'];
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              time: { type: Type.STRING },
              value: { type: Type.NUMBER }
            },
            required: ["time", "value"]
          }
        }
      },
    });

    const data = JSON.parse(response.text);
    // Sort by time ascending for lightweight-charts
    return data.sort((a: any, b: any) => a.time.localeCompare(b.time));
  } catch (error) {
    console.error(`Error fetching real historical prices for ${timeframe} via AI, using fallback generator:`, error);
    
    // Fallback generator
    const base = 2000;
    let days = 30;
    
    if (customRange) {
      const start = new Date(customRange.start);
      const end = new Date(customRange.end);
      days = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    } else {
      const daysMap: Record<string, number> = { '1D': 1, '1W': 7, '1M': 30, '1Y': 365, 'ALL': 1825 };
      days = daysMap[timeframe] || 30;
    }

    const data: HistoricalData[] = [];
    const endDate = customRange ? new Date(customRange.end) : new Date();
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - i);
      const time = date.toISOString().split('T')[0];
      const value = base + Math.sin(i / (Math.max(1, days/10))) * 50 + (Math.random() * 20 - 10);
      data.push({ time, value: Math.round(value * 100) / 100 });
    }
    return data;
  }
}
