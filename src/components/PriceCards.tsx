import { useState } from 'react';
import useStore from '../store/useStore';
import { Coins, DollarSign, TrendingUp, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';

export default function PriceCards() {
  const { spotGold, silver, usdPkr, selectedCurrency, exchangeRates } = useStore();
  const [unit, setUnit] = useState<'ounce' | 'tola' | 'tenGram' | 'gram' | 'kilogram'>('ounce');

  const currencySymbols: Record<string, string> = {
    PKR: 'Rs.',
    USD: '$',
    EUR: '€',
    GBP: '£',
    AED: 'AED',
    SAR: 'SR',
    INR: '₹'
  };

  const symbol = currencySymbols[selectedCurrency] || selectedCurrency;
  const rate = exchangeRates[selectedCurrency] || 1;

  const unitFactors = {
    ounce: 1,
    tola: 11.664 / 31.1035,
    tenGram: 10 / 31.1035,
    gram: 1 / 31.1035,
    kilogram: 1000 / 31.1035
  };

  const unitLabels = {
    ounce: 'oz',
    tola: 'tola',
    tenGram: '10g',
    gram: 'g',
    kilogram: 'kg'
  };

  const convertedGold = spotGold * rate * unitFactors[unit];
  const convertedSilver = silver * rate * unitFactors[unit];

  const cards = [
    { 
      label: `Spot Gold (${unitLabels[unit]})`, 
      value: `${symbol}${convertedGold.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, 
      change: '+12.45', 
      icon: TrendingUp, 
      color: 'text-emerald-600',
      isPrice: true
    },
    { 
      label: `Spot Silver (${unitLabels[unit]})`, 
      value: `${symbol}${convertedSilver.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, 
      change: '-0.12', 
      icon: Coins, 
      color: 'text-rose-600',
      isPrice: true
    },
    { 
      label: 'Platinum', 
      value: `${symbol}${(984.20 * rate).toLocaleString(undefined, { maximumFractionDigits: 2 })}`, 
      change: '+5.30', 
      icon: TrendingUp, 
      color: 'text-emerald-600',
      isPrice: true
    },
    { 
      label: 'Palladium', 
      value: `${symbol}${(1042.15 * rate).toLocaleString(undefined, { maximumFractionDigits: 2 })}`, 
      change: '-12.40', 
      icon: TrendingUp, 
      color: 'text-rose-600',
      isPrice: true
    },
    { 
      label: 'Bitcoin', 
      value: `${symbol}${(68420.50 * rate).toLocaleString(undefined, { maximumFractionDigits: 2 })}`, 
      change: '+1240.20', 
      icon: TrendingUp, 
      color: 'text-emerald-600',
      isPrice: true
    },
    { 
      label: selectedCurrency === 'USD' ? 'PKR / USD' : `USD / ${selectedCurrency}`, 
      value: selectedCurrency === 'USD' ? `Rs. ${usdPkr.toFixed(2)}` : `${symbol}${rate.toFixed(2)}`, 
      change: '+0.05', 
      icon: DollarSign, 
      color: 'text-emerald-600',
      isPrice: false
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-900">Live Spot Rates</h3>
        <div className="relative inline-block">
          <select 
            value={unit}
            onChange={(e) => setUnit(e.target.value as any)}
            className="appearance-none bg-black/5 border border-black/10 rounded-full px-5 py-2 pr-10 text-[10px] font-bold uppercase tracking-widest text-zinc-500 outline-none cursor-pointer hover:bg-black/10 transition-all focus:border-amber-500/50"
          >
            <option value="ounce" className="bg-white text-zinc-900">Ounce</option>
            <option value="tola" className="bg-white text-zinc-900">Tola</option>
            <option value="tenGram" className="bg-white text-zinc-900">10 Gram</option>
            <option value="gram" className="bg-white text-zinc-900">Gram</option>
            <option value="kilogram" className="bg-white text-zinc-900">Kilogram</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={14} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`glass p-6 rounded-3xl flex items-center justify-between hover:scale-[1.03] transition-all cursor-pointer group border-black/5 ${
              i === 0 ? 'ring-2 ring-amber-500/20 bg-amber-500/5' : ''
            }`}
          >
            <div className={`flex items-center gap-5`}>
              <div className={`p-3.5 rounded-2xl ${
                i === 0 
                  ? 'bg-amber-500/20 text-amber-600 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                  : card.color === 'text-emerald-600' 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                    : 'bg-rose-50 text-rose-600 border border-rose-200'
              } shadow-lg group-hover:scale-110 transition-transform`}>
                <card.icon size={22} />
              </div>
              <div>
                <div className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5 ${
                  i === 0 ? 'text-amber-600' : 'text-zinc-500'
                }`}>{card.label}</div>
                <div className={`text-xl font-black tracking-tighter ${
                  i === 0 ? 'text-zinc-900 scale-105 origin-left' : 'text-zinc-900'
                }`}>{card.value}</div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <div className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${
                card.color === 'text-emerald-600' 
                  ? 'bg-emerald-50 text-emerald-600' 
                  : 'bg-rose-50 text-rose-600'
              } border border-black/5`}>
                {card.change}
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping" />
                <div className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Live</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
