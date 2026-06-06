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

  const processRates = (rates: any): ExchangeRates => {
    return {
      USD: 1,
      PKR: rates.PKR || hardFallback.PKR,
      EUR: rates.EUR || hardFallback.EUR,
      GBP: rates.GBP || hardFallback.GBP,
      AED: rates.AED || hardFallback.AED,
      SAR: rates.SAR || hardFallback.SAR,
      INR: rates.INR || hardFallback.INR,
      CAD: rates.CAD || hardFallback.CAD,
      AUD: rates.AUD || hardFallback.AUD,
      JPY: rates.JPY || hardFallback.JPY,
      CNY: rates.CNY || hardFallback.CNY,
      TRY: rates.TRY || hardFallback.TRY,
      QAR: rates.QAR || hardFallback.QAR,
      KWD: rates.KWD || hardFallback.KWD,
      OMR: rates.OMR || hardFallback.OMR,
      BHD: rates.BHD || hardFallback.BHD,
      MYR: rates.MYR || hardFallback.MYR,
      SGD: rates.SGD || hardFallback.SGD
    };
  };

  // 1. Try server proxy
  try {
    const res = await fetch('/api/proxy/exchange');
    if (res.ok) {
      const data = await res.json();
      if (data && data.rates) {
        return processRates(data.rates);
      }
    }
  } catch (error) {
    console.warn('Error fetching exchange rates via proxy, trying direct client fetch:', error);
  }

  // 2. Try direct fetch from open exchange rate API (free, CORS-enabled, no key required)
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (res.ok) {
      const data = await res.json();
      if (data && data.rates) {
        return processRates(data.rates);
      }
    }
  } catch (error) {
    console.warn('Direct exchange rate fetch failed, trying server-side AI fallback:', error);
  }

  // 3. Try server AI fallback
  try {
    const res = await fetch('/api/proxy/ai-exchange');
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        return processRates(data);
      }
    }
  } catch (aiError) {
    console.warn('AI exchange rates fallback failed:', aiError);
  }

  return hardFallback;
}
