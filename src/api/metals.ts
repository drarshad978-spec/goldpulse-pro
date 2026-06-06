/**
 * Validation and logging helper for metals price API responses.
 * Confirms structural presence and numeric correctness of price fields.
 */
function validateAndLogPrice(
  label: string, 
  url: string, 
  status: number, 
  ok: boolean, 
  data: any
): number | null {
  console.log(`[API Validate] ${label} response:`, {
    url,
    status,
    ok,
    type: typeof data,
    data: data ? JSON.stringify(data).slice(0, 300) : null
  });

  if (status === 429) {
    console.warn(`[API Rate-Limited] Rate limit (429 Too Many Requests) encountered at ${url} for ${label}`);
    return null;
  }

  if (!ok) {
    console.warn(`[API Response Error] HTTP error status ${status} at ${url} for ${label}`);
    return null;
  }

  if (!data || typeof data !== 'object') {
    console.warn(`[API Validation Error] Expected a JSON object but received ${typeof data} from ${url}`);
    return null;
  }

  const priceVal = data.price;
  if (priceVal === undefined || priceVal === null) {
    console.warn(`[API Validation Error] Missing 'price' field in response from ${url}`);
    return null;
  }

  const numericValue = parseFloat(priceVal);
  if (isNaN(numericValue) || !isFinite(numericValue)) {
    console.warn(`[API Validation Error] 'price' value (${priceVal}) of type ${typeof priceVal} from ${url} is not a valid number`);
    return null;
  }

  if (numericValue <= 0) {
    console.warn(`[API Validation Warning] Received suspicious zero or negative price (${numericValue}) from ${url}`);
    return null;
  }

  console.log(`[API Validation Success] Validated pricing for ${label}: ${numericValue}`);
  return numericValue;
}

async function fetchPrice(symbol: string, fallbackValue: number): Promise<number> {
  const lowercaseMap: Record<string, string> = {
    XAU: 'gold',
    XAG: 'silver',
    XPT: 'platinum',
    XPD: 'palladium',
    BTC: 'bitcoin'
  };
  const mapped = lowercaseMap[symbol] || symbol.toLowerCase();

  const endpoints = [
    { url: `/api/proxy/metals/${symbol}`, label: `${symbol} (Server Proxy)` },
    { url: `https://api.gold-api.com/price/${symbol}`, label: `${symbol} (Direct Client)` },
    { url: `/api/proxy/ai-price/${mapped}`, label: `${symbol} (Server AI Fallback)` }
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint.url);
      let data: any = null;
      try {
        data = await res.json();
      } catch (e) {
        console.warn(`[API Parsing Error] Failed to parse JSON response from ${endpoint.url}:`, e);
      }
      
      const price = validateAndLogPrice(endpoint.label, endpoint.url, res.status, res.ok, data);
      if (price !== null) {
        return price;
      }
    } catch (error: any) {
      console.warn(`[Fetch Error] Request to ${endpoint.label} (${endpoint.url}) failed:`, error.message || error);
    }
  }

  console.warn(`[API Fallback Triggered] All price endpoints failed or rate-limited for ${symbol}. Returning default fallback: ${fallbackValue}`);
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
