export interface ExchangeRates {
  USD: number;
  PKR: number;
  EUR: number;
  GBP: number;
  AED: number;
  SAR: number;
  INR: number;
  CAD: number;
  AUD: number;
  JPY: number;
  CNY: number;
  TRY: number;
  QAR: number;
  KWD: number;
  OMR: number;
  BHD: number;
  MYR: number;
  SGD: number;
  [key: string]: number;
}

/**
 * Validation and logging helper for exchange rate API responses.
 * Confirms presence of a rates map and validates critical currencies for numeric goodness.
 */
function validateAndLogExchangeRates(
  label: string, 
  url: string, 
  status: number, 
  ok: boolean, 
  data: any,
  isRatesNested: boolean
): any | null {
  console.log(`[FX API Validate] ${label} response:`, {
    url,
    status,
    ok,
    type: typeof data,
    data: data ? JSON.stringify(data).slice(0, 300) : null
  });

  if (status === 429) {
    console.warn(`[FX API Rate-Limited] Rate limit (429 Too Many Requests) encountered at ${url} for ${label}`);
    return null;
  }

  if (!ok) {
    console.warn(`[FX API Response Error] HTTP error status ${status} at ${url} for ${label}`);
    return null;
  }

  if (!data || typeof data !== 'object') {
    console.warn(`[FX API Validation Error] Expected a JSON object but received ${typeof data} from ${url}`);
    return null;
  }

  const ratesObj = isRatesNested ? data.rates : data;
  if (!ratesObj || typeof ratesObj !== 'object') {
    console.warn(`[FX API Validation Error] Expected rates object but found ${typeof ratesObj} in response from ${url}`);
    return null;
  }

  // Check sample currencies to ensure we have a valid, parsed key-value pair of rates
  const testCurrencies = ['PKR', 'EUR', 'GBP'];
  let validRatesCount = 0;
  for (const currency of testCurrencies) {
    const rate = ratesObj[currency];
    if (rate !== undefined && rate !== null) {
      const val = parseFloat(rate);
      if (!isNaN(val) && isFinite(val) && val > 0) {
        validRatesCount++;
      }
    }
  }

  if (validRatesCount === 0) {
    console.warn(`[FX API Validation Error] No valid numeric rates ('PKR', 'EUR', 'GBP') found in the dataset from ${url}`);
    return null;
  }

  console.log(`[FX API Validation Success] Successfully validated ${validRatesCount} sample rates from ${label}`);
  return ratesObj;
}

export async function fetchAllExchangeRates(): Promise<ExchangeRates> {
  const hardFallback: ExchangeRates = {
    USD: 1,
    PKR: 280,
    EUR: 0.92,
    GBP: 0.78,
    AED: 3.67,
    SAR: 3.75,
    INR: 83.00,
    CAD: 1.35,
    AUD: 1.52,
    JPY: 150.00,
    CNY: 7.20,
    TRY: 31.50,
    QAR: 3.64,
    KWD: 0.31,
    OMR: 0.38,
    BHD: 0.38,
    MYR: 4.75,
    SGD: 1.34
  };

  const processAndCleanRates = (rates: any): ExchangeRates => {
    const getValidOrDefault = (val: any, fallback: number): number => {
      if (val === undefined || val === null) return fallback;
      const parsed = parseFloat(val);
      return !isNaN(parsed) && isFinite(parsed) && parsed > 0 ? parsed : fallback;
    };

    return {
      USD: 1,
      PKR: getValidOrDefault(rates.PKR, hardFallback.PKR),
      EUR: getValidOrDefault(rates.EUR, hardFallback.EUR),
      GBP: getValidOrDefault(rates.GBP, hardFallback.GBP),
      AED: getValidOrDefault(rates.AED, hardFallback.AED),
      SAR: getValidOrDefault(rates.SAR, hardFallback.SAR),
      INR: getValidOrDefault(rates.INR, hardFallback.INR),
      CAD: getValidOrDefault(rates.CAD, hardFallback.CAD),
      AUD: getValidOrDefault(rates.AUD, hardFallback.AUD),
      JPY: getValidOrDefault(rates.JPY, hardFallback.JPY),
      CNY: getValidOrDefault(rates.CNY, hardFallback.CNY),
      TRY: getValidOrDefault(rates.TRY, hardFallback.TRY),
      QAR: getValidOrDefault(rates.QAR, hardFallback.QAR),
      KWD: getValidOrDefault(rates.KWD, hardFallback.KWD),
      OMR: getValidOrDefault(rates.OMR, hardFallback.OMR),
      BHD: getValidOrDefault(rates.BHD, hardFallback.BHD),
      MYR: getValidOrDefault(rates.MYR, hardFallback.MYR),
      SGD: getValidOrDefault(rates.SGD, hardFallback.SGD)
    };
  };

  const endpoints = [
    { url: '/api/proxy/exchange', label: 'Exchange Proxy (Nested rates)', isNested: true },
    { url: 'https://open.er-api.com/v6/latest/USD', label: 'Direct Open Exchange Rates (Nested rates)', isNested: true },
    { url: '/api/proxy/ai-exchange', label: 'AI Exchange Fallback', isNested: false }
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint.url);
      let data: any = null;
      try {
        data = await res.json();
      } catch (parseErr) {
        console.warn(`[FX API Parsing Error] Failed to parse JSON response from ${endpoint.url}:`, parseErr);
      }

      const validatedRates = validateAndLogExchangeRates(
        endpoint.label,
        endpoint.url,
        res.status,
        res.ok,
        data,
        endpoint.isNested
      );

      if (validatedRates) {
        return processAndCleanRates(validatedRates);
      }
    } catch (err: any) {
      console.warn(`[FX Fetch Error] Request to ${endpoint.label} (${endpoint.url}) failed:`, err.message || err);
    }
  }

  console.warn('[FX API Fallback Triggered] All exchange rates endpoints failed or rate-limited. Returning hard fallback exchange rates.');
  return hardFallback;
}
