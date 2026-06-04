export interface ExchangeRates {
  USD: number;
  PKR: number;
  EUR: number;
  GBP: number;
  AED: number;
  SAR: number;
  INR: number;
  [key: string]: number;
}

export async function fetchAllExchangeRates(): Promise<ExchangeRates> {
  try {
    const res = await fetch('/api/proxy/exchange');
    if (res.ok) {
      const data = await res.json();
      if (data && data.rates) {
        return {
          USD: 1,
          PKR: data.rates.PKR,
          EUR: data.rates.EUR,
          GBP: data.rates.GBP,
          AED: data.rates.AED,
          SAR: data.rates.SAR,
          INR: data.rates.INR,
        };
      }
    }
  } catch (error) {
    console.error('Error fetching exchange rates via API, trying server-side AI fallback:', error);
  }

  try {
    const res = await fetch('/api/proxy/ai-exchange');
    if (res.ok) {
      const rates = await res.json();
      return rates;
    }
  } catch (aiError) {
    console.error('AI exchange rates fallback also failed:', aiError);
  }

  // Hard fallback
  return {
    USD: 1,
    PKR: 280,
    EUR: 0.92,
    GBP: 0.78,
    AED: 3.67,
    SAR: 3.75,
    INR: 83.00
  };
}
