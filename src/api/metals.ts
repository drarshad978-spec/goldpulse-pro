import { fetchPriceViaAI } from "../services/geminiService";

export async function fetchSilverPrice() {
  // Try API first to save Gemini quota
  try {
    let res = await fetch('/api/proxy/metals/XAG');
    let data : any = null;
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      console.warn('Vite proxy not available. Fetching silver price directly from Gold-API...');
      res = await fetch('https://api.gold-api.com/price/XAG');
      if (res.ok) {
        data = await res.json();
      }
    }
    if (data && data.price) return data.price;
  } catch (error) {
    console.error('API fetch for silver failed, trying AI fallback:', error);
  }

  // Fallback to AI
  try {
    const text = await fetchPriceViaAI("silver");
    const price = parseFloat(text.replace(/[^0-9.]/g, ''));
    if (!isNaN(price)) return price;
  } catch (aiError) {
    console.error('AI fallback for silver also failed:', aiError);
  }
  
  return 23.5; // Hard fallback
}

export async function fetchGoldPriceFallback() {
  // Try API first to save Gemini quota
  try {
    let res = await fetch('/api/proxy/metals/XAU');
    let data : any = null;
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      console.warn('Vite proxy not available. Fetching gold price directly from Gold-API...');
      res = await fetch('https://api.gold-api.com/price/XAU');
      if (res.ok) {
        data = await res.json();
      }
    }
    if (data && data.price) return data.price;
  } catch (error) {
    console.error('API fetch for gold failed, trying AI fallback:', error);
  }

  // Fallback to AI
  try {
    const text = await fetchPriceViaAI("gold");
    const price = parseFloat(text.replace(/[^0-9.]/g, ''));
    if (!isNaN(price)) return price;
  } catch (aiError) {
    console.error('AI fallback for gold also failed:', aiError);
  }

  return 2000; // Hard fallback
}
