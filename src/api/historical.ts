export interface HistoricalData {
  time: string;
  value: number;
}

export async function fetchHistoricalPrices(
  timeframe: string = '1M', 
  customRange?: { start: string; end: string }
): Promise<HistoricalData[]> {
  try {
    let url = `/api/proxy/historical?timeframe=${encodeURIComponent(timeframe)}`;
    if (customRange) {
      url += `&start=${encodeURIComponent(customRange.start)}&end=${encodeURIComponent(customRange.end)}`;
    }
    const res = await fetch(url);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error("Failed to fetch historical prices from cached backend route:", err);
  }

  // Client-side fallback generator
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
