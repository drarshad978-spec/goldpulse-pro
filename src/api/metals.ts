import { fetchPriceViaAI } from "../services/geminiService";

export async function fetchSilverPrice() {
  // Try API first to save Gemini quota
  try {
    const res = await fetch('/api/proxy/metals/XAG');
    const data = await res.json();
    if (data.price) return data.price;
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
    const res = await fetch('/api/proxy/metals/XAU');
    const data = await res.json();
    if (data.price) return data.price;
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
