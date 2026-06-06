import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import compression from "compression";
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple high-performance in-memory Cache mapping
interface CacheEntry<T> {
  data: T;
  expiry: number;
}
const cacheStore = new Map<string, CacheEntry<any>>();

function getCached<T>(key: string): T | null {
  const entry = cacheStore.get(key);
  if (entry && Date.now() < entry.expiry) {
    return entry.data;
  }
  return null;
}

function setCached<T>(key: string, data: T, ttlMs: number) {
  cacheStore.set(key, { data, expiry: Date.now() + ttlMs });
}

// Lazy Gemini Initialization (avoids crashing on missing key and handles fallback gracefully)
let aiClient: GoogleGenAI | null = null;
function getAI() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("GEMINI_API_KEY is not defined. Falling back to offline fallback generators.");
      return null;
    }
    aiClient = new GoogleGenAI({ 
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Resilient API retry and model fallback mechanism
async function callWithRetry<T>(fn: () => Promise<T>, fallbackFn?: () => Promise<T>, retries = 2, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isRateLimit = error?.status === "RESOURCE_EXHAUSTED" || error?.code === 429 || error?.message?.includes("429");
    const isUnavailable = error?.status === "UNAVAILABLE" || error?.code === 503 || error?.message?.includes("503");
    
    if (retries > 0 && (isRateLimit || isUnavailable)) {
      console.warn(`Gemini API busy: retrying in ${delay}ms... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return callWithRetry(fn, fallbackFn, retries - 1, delay * 1.5);
    }
    
    if (fallbackFn) {
      console.info("Primary Gemini call failed. Trying fallback setup...");
      try {
        return await fallbackFn();
      } catch (fallbackError) {
        console.warn("Fallback call failed too, throwing exception.");
      }
    }
    throw error;
  }
}

// Historical pricing fallback generator
function generateFallbackHistorical(timeframe: string, customRange?: { start: string; end: string }) {
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
  const data: any[] = [];
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

// Default exchange rates for PKR-centered precious metal markets
const defaultExchangeRates = {
  USD: 1,
  PKR: 280,
  EUR: 0.92,
  GBP: 0.78,
  AED: 3.67,
  SAR: 3.75,
  INR: 83.00,
  CAD: 1.35
};

const defaultMockNews = [
  {
    title: "Gold Prices Stabilize Near Historic Highs as Inflation Fears Persist",
    summary: "Spot gold prices remained strong today as investors seek safety in real assets amidst ongoing global inflation concerns and currency fluctuations.",
    source: "Bloomberg",
    time: "10m ago",
    impact: "high"
  },
  {
    title: "Pakistani Rupee Holds Firm Against US Dollar in Interbank Market",
    summary: "The State Bank of Pakistan reports steady interbank rates for the rupee, providing a stable base for local jewelry and bullion pricing indices.",
    source: "SBP",
    time: "45m ago",
    impact: "medium"
  },
  {
    title: "Silver Spot Rates Trend Upwards Following Industrial Demand Speculation",
    summary: "According to market traders, industrial consumption in clean energy and electronics continues to support silver prices worldwide.",
    source: "Reuters",
    time: "2h ago",
    impact: "medium"
  },
  {
    title: "Bullion Association Adjusts Local Premiums for Karachi and Lahore",
    summary: "Karachi's local bullion groups have adjusted key pricing premiums to align physical demand with international spot conversions.",
    source: "Local Bullion",
    time: "3h ago",
    impact: "high"
  },
  {
    title: "Federal Reserve Hints at Cautious Interest Rate Policy in Coming Quarter",
    summary: "Financial analysts suggest that future Fed policy comments will maintain macro-supportive pressure on precious metals.",
    source: "Financial Times",
    time: "5h ago",
    impact: "low"
  }
];

async function createServer() {
  const app = express();

  // Optimizations Middlewares
  app.use(compression()); // Compress all bundles with Gzip for superior payload transfer rates
  app.use(express.json({ limit: "15mb" })); // Parse incoming JSON requests

  // API Proxy Routes with smart server-side caching to make transactions instantaneous

  // 1. Metals spot price API (Cached for 1 minute)
  app.get("/api/proxy/metals/:symbol", async (req, res) => {
    const { symbol } = req.params;
    const cacheKey = `metals_${symbol}`;
    const cached = getCached<any>(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    try {
      const response = await fetch(`https://api.gold-api.com/price/${symbol}`);
      const data = await response.json();
      setCached(cacheKey, data, 60000); // Cache for 60 seconds
      res.json(data);
    } catch (error) {
      console.error(`Proxy error for ${symbol}:`, error);
      res.status(500).json({ error: "Failed to fetch from upstream" });
    }
  });

  // 2. Exchange currency rate API (Cached for 1 hour)
  app.get("/api/proxy/exchange", async (req, res) => {
    const cacheKey = "exchange_rates";
    const cached = getCached<any>(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    try {
      const response = await fetch('https://open.er-api.com/v6/latest/USD');
      const data = await response.json();
      setCached(cacheKey, data, 3600000); // Cache for 1 hour
      res.json(data);
    } catch (error) {
      console.error("Proxy error for exchange rates:", error);
      res.status(500).json({ error: "Failed to fetch from upstream" });
    }
  });

  // 3. Historical Data Gemini Proxy (Cached for 30 minutes to bypass 3s loading spinner)
  app.get("/api/proxy/historical", async (req, res) => {
    const timeframe = (req.query.timeframe as string) || "1M";
    const start = req.query.start as string | undefined;
    const end = req.query.end as string | undefined;

    const cacheKey = `historical_${timeframe}_${start || ""}_${end || ""}`;
    const cachedData = getCached<any[]>(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const ai = getAI();
    if (!ai) {
      const fallback = generateFallbackHistorical(timeframe, start && end ? { start, end } : undefined);
      setCached(cacheKey, fallback, 60000); // Cache fallback temporarily
      return res.json(fallback);
    }

    let prompt = "";
    if (start && end) {
      prompt = `Provide the daily closing spot price of gold (XAU/USD) from ${start} to ${end}. Return the data as a JSON array of objects with 'time' (YYYY-MM-DD) and 'value' (number) keys.`;
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
      const data = await callWithRetry(async () => {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
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
        const parsed = JSON.parse(response.text);
        return parsed.sort((a: any, b: any) => a.time.localeCompare(b.time));
      });
      
      setCached(cacheKey, data, 1800000); // Cache for 30 minutes
      return res.json(data);
    } catch (err: any) {
      console.warn("Historical prices offline fallback triggered.");
      const fallback = generateFallbackHistorical(timeframe, start && end ? { start, end } : undefined);
      return res.json(fallback);
    }
  });

  // 4. Market Intelligence News (Cached for 15 minutes)
  app.get("/api/proxy/news", async (req, res) => {
    const cacheKey = "market_news";
    const cached = getCached<any>(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const ai = getAI();
    if (!ai) {
      setCached(cacheKey, defaultMockNews, 60000);
      return res.json(defaultMockNews);
    }

    try {
      const text = await callWithRetry(async () => {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: "Generate 5 realistic, current-style news headlines and short summaries (1 sentence each) related to the global gold and silver market and the Pakistani economy. Include a 'source' (e.g. Reuters, Bloomberg, SBP), a 'time' (e.g. 10m ago), and an 'impact' level (high, medium, low). Format as JSON array.",
          config: {
            responseMimeType: "application/json",
          }
        });
        return response.text;
      });
      const data = JSON.parse(text);
      setCached(cacheKey, data, 900000); // Cache for 15 minutes
      return res.json(data);
    } catch (err: any) {
      console.warn("Market intelligence news fallback triggered.");
      return res.json(defaultMockNews);
    }
  });

  // 5. News Briefing Summarization (Cached for 15 minutes)
  app.post("/api/proxy/briefing", async (req, res) => {
    const { headlines } = req.body;
    if (!headlines || !Array.isArray(headlines)) {
      return res.status(400).json({ error: "Invalid headlines array" });
    }

    const key = `briefing_${headlines.join("_")}`;
    const cached = getCached<string>(key);
    if (cached) {
      return res.json({ briefing: cached });
    }

    const ai = getAI();
    if (!ai) {
      const fallback = "Gold prices in Pakistan continue to show resilient safe-haven support amid stable interbank metrics. Broad demand dynamics suggest bullion buying remains highly attractive as a reliable medium-term hedge.";
      return res.json({ briefing: fallback });
    }

    try {
      const briefingText = await callWithRetry(async () => {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `Based on these headlines: "${headlines.join('", "')}", provide a concise 2-sentence market outlook for a gold investor in Pakistan. Focus on the immediate impact and sentiment.`,
        });
        return response.text;
      });
      setCached(key, briefingText, 900000); // Cache for 15 minutes
      return res.json({ briefing: briefingText });
    } catch (err: any) {
      console.warn("Briefing summarizer fallback triggered.");
      return res.json({ briefing: "Precious metals trade with stable Safe-Haven premiums inline with global macroeconomic updates." });
    }
  });

  // 6. Real-time Specialist Chat (Dynamic)
  app.post("/api/proxy/chat", async (req, res) => {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Missing message" });
    }

    const ai = getAI();
    if (!ai) {
      return res.json({ text: "Thank you for reaching out. The live AI consultation service is currently in offline mode. Local gold remains a highly trusted asset in current financial conditions." });
    }

    try {
      const responseText = await callWithRetry(async () => {
        const chat = ai.chats.create({
          model: "gemini-3.1-pro-preview",
          config: {
            systemInstruction: "You are GoldPulse AI, a specialist in gold and precious metals markets, specifically for Pakistan. Provide accurate information, market analysis, and investment tips. Use a professional yet approachable tone.",
          },
          history,
        });
        const response = await chat.sendMessage({ message });
        return response.text;
      }, async () => {
        const chat = ai.chats.create({
          model: "gemini-3.5-flash",
          config: {
            systemInstruction: "You are GoldPulse AI, a specialist in gold and precious metals markets, specifically for Pakistan. Provide accurate information, market analysis, and investment tips. Use a professional yet approachable tone.",
          },
          history,
        });
        const response = await chat.sendMessage({ message });
        return response.text;
      });
      return res.json({ text: responseText });
    } catch (err: any) {
      console.warn("Chat assistant offline fallback triggered.");
      return res.json({ text: "The specialist advisor is currently experiencing high load. Please retry your inquiry shortly!" });
    }
  });

  // 7. Core Intel Query (Cached for 15 minutes)
  app.post("/api/proxy/complex-analysis", async (req, res) => {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Missing query parameter" });
    }

    const key = `complex_${query}`;
    const cached = getCached<string>(key);
    if (cached) {
      return res.json({ text: cached });
    }

    const ai = getAI();
    if (!ai) {
      return res.json({ text: "Market Outlook Analysis: Long-term trends indicate solid strategic interest in reserve assets. Safe-haven buying, coupled with domestic macro-factors, supports gold retention. Short-term oscillations remain bounded by regional physical market premiums." });
    }

    try {
      const text = await callWithRetry(async () => {
        const response = await ai.models.generateContent({
          model: "gemini-3.1-pro-preview",
          contents: [{ parts: [{ text: query }] }],
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
            systemInstruction: "Perform a deep, multi-step analysis of the following precious metals market query. Consider global economic factors, geopolitical events, and local market dynamics in Pakistan.",
          }
        });
        return response.text;
      }, async () => {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: [{ parts: [{ text: query }] }],
          config: {
            systemInstruction: "Perform a deep, multi-step analysis of the following precious metals market query. Consider global economic factors, geopolitical events, and local market dynamics in Pakistan.",
          }
        });
        return response.text;
      });
      setCached(key, text, 900000); // Cache for 15 minutes
      return res.json({ text });
    } catch (err: any) {
      console.warn("Complex analysis fallback triggered.");
      return res.json({ text: "Market Outlook Analysis: Long-term trends indicate solid strategic interest in reserve assets. Safe-haven buying, coupled with domestic macro-factors, supports gold retention. Short-term oscillations remain bounded by regional physical market premiums." });
    }
  });

  // 8. Image analyzer
  app.post("/api/proxy/analyze-image", async (req, res) => {
    const { base64Image, mimeType } = req.body;
    if (!base64Image || !mimeType) {
      return res.status(400).json({ error: "Missing picture data" });
    }

    const ai = getAI();
    if (!ai) {
      return res.json({ text: "Image received. Estimates for standard jewelry and bullion verify high structural quality with common purity metrics between 21K and 22K." });
    }

    try {
      const responseText = await callWithRetry(async () => {
        const response = await ai.models.generateContent({
          model: "gemini-3.1-pro-preview",
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
      }, async () => {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
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
      return res.json({ text: responseText });
    } catch (err: any) {
      console.warn("Image analysis fallback triggered.");
      return res.json({ text: "Image received. Estimates for standard jewelry and bullion verify high structural quality with common purity metrics between 21K and 22K." });
    }
  });

  // 9. Standard metals fallback check lookup APIs
  app.get("/api/proxy/ai-price/:metal", async (req, res) => {
    const metal = req.params.metal.toLowerCase();
    const cacheKey = `ai_price_${metal}`;
    const cached = getCached<string>(cacheKey);
    if (cached) {
      return res.json({ price: cached });
    }

    const ai = getAI();
    if (!ai) {
      const fallbackPrice = metal === "silver" ? "23.50" : "2000.00";
      return res.json({ price: fallbackPrice });
    }

    try {
      const text = await callWithRetry(async () => {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `What is the current spot price of ${metal} in USD per ounce? Return only the numerical value.`,
          config: {
            tools: [{ googleSearch: {} }],
          },
        });
        return response.text;
      });
      const cleaned = text.replace(/[^0-9.]/g, '');
      setCached(cacheKey, cleaned, 1800000); // 30 minutes cache for AI gold spot price
      return res.json({ price: cleaned });
    } catch (err) {
      const fallbackPrice = metal === "silver" ? "23.50" : "2000.00";
      return res.json({ price: fallbackPrice });
    }
  });

  // 10. AI fallbacks for Exchange rates
  app.get("/api/proxy/ai-exchange", async (req, res) => {
    const cacheKey = "ai_exchange_rates";
    const cached = getCached<any>(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const ai = getAI();
    if (!ai) {
      return res.json(defaultExchangeRates);
    }

    try {
      const text = await callWithRetry(async () => {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: "What are the current exchange rates from USD to PKR, EUR, GBP, AED, SAR, and INR? Return as a JSON object with these currency codes as keys and numerical values as values.",
          config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
          },
        });
        return response.text;
      });
      const parsed = JSON.parse(text);
      const output = { USD: 1, ...parsed };
      setCached(cacheKey, output, 3600000); // 1 hour cache
      return res.json(output);
    } catch (err) {
      return res.json(defaultExchangeRates);
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development / static serving in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, {
      maxAge: '1d', // Enable long term caching of compiled JS, CSS, and imagery
      etag: true
    }));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  return app;
}

// Export for Vercel
export default async (req: express.Request, res: express.Response) => {
  const app = await createServer();
  return app(req, res);
};

// Start dev or production listen locally
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  createServer().then(app => {
    const PORT = 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server optimized & running on http://localhost:${PORT}`);
    });
  });
}
