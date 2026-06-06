async function fetchPrice(symbol: string, fallbackValue: number): Promise<number> {
  // 1. Try server-side proxy first
  try {
    const res = await fetch(`/api/proxy/metals/${symbol}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.price) {
        const val = parseFloat(data.price);
        if (!isNaN(val)) return val;
      }
    }
  } catch (error) {
    console.warn(`Proxy fetch for ${symbol} failed, trying direct client fetch:`, error);
  }

  // 2. Try direct fetch from API as first fallback (free, CORS-enabled, no key needed)
  try {
    const res = await fetch(`https://api.gold-api.com/price/${symbol}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.price) {
        const val = parseFloat(data.price);
        if (!isNaN(val)) return val;
      }
    }
  } catch (error) {
    console.warn(`Direct fetch for ${symbol} failed, trying server AI fallback:`, error);
  }

  // 3. Try cached server AI fallback
  try {
    const lowercaseMap: Record<string, string> = {
      XAU: 'gold',
      XAG: 'silver',
      XPT: 'platinum',
      XPD: 'palladium',
      BTC: 'bitcoin'
    };
    const mapped = lowercaseMap[symbol] || symbol.toLowerCase();
    const res = await fetch(`/api/proxy/ai-price/${mapped}`);
    if (res.ok) {
      const data = await res.json();
      const price = parseFloat(data.price);
      if (!isNaN(price)) return price;
    }
  } catch (aiError) {
    console.warn(`AI checks for ${symbol} failed:`, aiError);
  }

  return fallbackValue;
}

export async function fetchSilverPrice(): Promise<number> {
  return fetchPrice('XAG', 23.5);
}

export async function fetchGoldPriceFallback(): Promise<number> {
  return fetchPrice('XAU', 2000);
}

export async function fetchPlatinumPrice(): Promise<number> {
  return fetchPrice('XPT', 984.2);
}

export async function fetchPalladiumPrice(): Promise<number> {
  return fetchPrice('XPD', 1042.15);
}

export async function fetchBitcoinPrice(): Promise<number> {
  return fetchPrice('BTC', 68420.5);
}
