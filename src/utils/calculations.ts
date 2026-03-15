export const GRAMS_PER_OUNCE = 31.1035;
export const TOLA_GRAMS = 11.664;
export const PREMIUM_PKR = 4800;

export interface GoldPrices {
  tola: number;
  gram: number;
  tenGram: number;
  ounce: number;
  kilogram: number;
}

export function calculatePrices(spotUSD: number, usdPkr: number): { gold24: GoldPrices; gold22: GoldPrices } {
  const gramUSD = spotUSD / GRAMS_PER_OUNCE;
  const gramPKR = gramUSD * usdPkr;
  const tolaPKR = gramPKR * TOLA_GRAMS + PREMIUM_PKR;

  const gold24: GoldPrices = {
    tola: Math.round(tolaPKR),
    gram: Math.round(gramPKR),
    tenGram: Math.round(gramPKR * 10),
    ounce: Math.round(spotUSD * usdPkr),
    kilogram: Math.round(gramPKR * 1000)
  };

  const gold22: GoldPrices = {
    tola: Math.round(gold24.tola * 0.916),
    gram: Math.round(gold24.gram * 0.916),
    tenGram: Math.round(gold24.tenGram * 0.916),
    ounce: Math.round(gold24.ounce * 0.916),
    kilogram: Math.round(gold24.kilogram * 0.916)
  };

  return { gold24, gold22 };
}
