import { create } from 'zustand';
import { calculatePrices, GoldPrices } from '../utils/calculations';
import { HistoricalData } from '../api/historical';
import { User } from 'firebase/auth';

export interface Alert {
  id: string;
  targetPrice: number;
  direction: 'above' | 'below';
  triggered: boolean;
  createdAt?: any;
}

interface GoldPulseState {
  user: User | null;
  spotGold: number;
  silver: number;
  usdPkr: number;
  historicalPrices: HistoricalData[];
  alerts: Alert[];
  selectedCity: string;
  selectedCurrency: string;
  selectedTimeframe: string;
  exchangeRates: Record<string, number>;
  cityPremiums: Record<string, number>;
  
  setUser: (user: User | null) => void;
  setSpotGold: (price: number) => void;
  setSilver: (price: number) => void;
  setUsdPkr: (rate: number) => void;
  setExchangeRates: (rates: Record<string, number>) => void;
  setHistoricalPrices: (data: HistoricalData[]) => void;
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Omit<Alert, 'id' | 'triggered'>) => void;
  removeAlert: (id: string) => void;
  triggerAlert: (id: string) => void;
  setSelectedCity: (city: string) => void;
  setSelectedCurrency: (currency: string) => void;
  setSelectedTimeframe: (timeframe: string) => void;
  getGoldPrices: () => { gold24: GoldPrices; gold22: GoldPrices };
}

const useStore = create<GoldPulseState>((set, get) => ({
  user: null,
  spotGold: 2000,
  silver: 23.5,
  usdPkr: 280,
  historicalPrices: [],
  alerts: [],
  selectedCity: 'Karachi',
  selectedCurrency: 'PKR',
  selectedTimeframe: '1M',
  exchangeRates: {
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
  },
  cityPremiums: { Karachi: 0, Lahore: 200, Islamabad: 150 },

  setUser: (user) => set({ user }),
  setSpotGold: (price) => set({ spotGold: price }),
  setSilver: (price) => set({ silver: price }),
  setUsdPkr: (rate) => set((state) => ({ 
    usdPkr: rate,
    exchangeRates: { ...state.exchangeRates, PKR: rate }
  })),
  setExchangeRates: (rates) => set((state) => ({
    exchangeRates: { ...state.exchangeRates, ...rates },
    usdPkr: rates.PKR || state.usdPkr
  })),
  setHistoricalPrices: (data) => set({ historicalPrices: data }),
  setAlerts: (alerts) => set({ alerts }),
  addAlert: (alert) => set((state) => ({ 
    alerts: [...state.alerts, { ...alert, id: String(Date.now()), triggered: false }] 
  })),
  removeAlert: (id) => set((state) => ({ 
    alerts: state.alerts.filter(a => a.id !== id) 
  })),
  triggerAlert: (id) => set((state) => ({
    alerts: state.alerts.map(a => a.id === id ? { ...a, triggered: true } : a)
  })),
  setSelectedCity: (city) => set({ selectedCity: city }),
  setSelectedCurrency: (currency) => set({ selectedCurrency: currency }),
  setSelectedTimeframe: (timeframe) => set({ selectedTimeframe: timeframe }),

  getGoldPrices: () => {
    const { spotGold, usdPkr, selectedCity, cityPremiums, selectedCurrency, exchangeRates } = get();
    const base = calculatePrices(spotGold, usdPkr);
    const premium = cityPremiums[selectedCity] || 0;
    
    // Conversion factor from PKR to selected currency
    const pkrToSelected = exchangeRates[selectedCurrency] / exchangeRates['PKR'];

    const adjust = (val: number, factor: number = 1) => {
      const pkrVal = val + (premium * factor);
      return pkrVal * pkrToSelected;
    };

    return {
      gold24: {
        tola: adjust(base.gold24.tola),
        gram: adjust(base.gold24.gram, 1 / 11.664),
        tenGram: adjust(base.gold24.tenGram, 10 / 11.664),
        ounce: adjust(base.gold24.ounce, 31.1035 / 11.664),
        kilogram: adjust(base.gold24.kilogram, 1000 / 11.664)
      },
      gold22: {
        tola: adjust(base.gold22.tola),
        gram: adjust(base.gold22.gram, 1 / 11.664),
        tenGram: adjust(base.gold22.tenGram, 10 / 11.664),
        ounce: adjust(base.gold22.ounce, 31.1035 / 11.664),
        kilogram: adjust(base.gold22.kilogram, 1000 / 11.664)
      }
    };
  }
}));

export default useStore;
