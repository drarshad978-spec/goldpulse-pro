export type TrendDirection = 'up' | 'down' | 'sideways' | 'neutral';

export interface Prediction {
  direction: TrendDirection;
  confidence: number;
}

export function simplePrediction(pricesArray: number[]): Prediction {
  if (pricesArray.length < 2) return { direction: 'neutral', confidence: 50 };
  const last = pricesArray[pricesArray.length - 1];
  const prev = pricesArray[pricesArray.length - 2];
  const change = ((last - prev) / prev) * 100;
  if (change > 0.2) return { direction: 'up', confidence: 65 };
  if (change < -0.2) return { direction: 'down', confidence: 65 };
  return { direction: 'sideways', confidence: 50 };
}
