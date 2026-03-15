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
      label: selectedCurrency === 'USD' ? 'PKR / USD' : `USD / ${selectedCurrency}`, 
      value: selectedCurrency === 'USD' ? `Rs. ${usdPkr.toFixed(2)}` : `${symbol}${rate.toFixed(2)}`, 
      change: '+0.05', 
      icon: DollarSign, 
      color: 'text-emerald-600',
      isPrice: false
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-2">
        <div className="relative inline-block">
          <select 
            value={unit}
            onChange={(e) => setUnit(e.target.value as any)}
            className="appearance-none bg-white/5 border border-white/10 rounded-full px-5 py-2 pr-10 text-[10px] font-bold uppercase tracking-widest text-zinc-400 outline-none cursor-pointer hover:bg-white/10 transition-all focus:border-amber-500/50"
          >
            <option value="ounce" className="bg-zinc-900">Ounce</option>
            <option value="tola" className="bg-zinc-900">Tola</option>
            <option value="tenGram" className="bg-zinc-900">10 Gram</option>
            <option value="gram" className="bg-zinc-900">Gram</option>
            <option value="kilogram" className="bg-zinc-900">Kilogram</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={14} />
        </div>
      </div>
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass p-6 rounded-3xl flex items-center justify-between hover:scale-[1.03] transition-all cursor-pointer group border-white/5"
        >
          <div className="flex items-center gap-5">
            <div className={`p-3.5 rounded-2xl ${
              card.color === 'text-emerald-600' 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            } shadow-lg group-hover:scale-110 transition-transform`}>
              <card.icon size={22} />
            </div>
            <div>
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-1.5">{card.label}</div>
              <div className="text-2xl font-black text-white tracking-tighter">{card.value}</div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <div className={`text-[11px] font-black px-3 py-1 rounded-lg ${
              card.color === 'text-emerald-600' 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : 'bg-rose-500/20 text-rose-400'
            } border border-white/5`}>
              {card.change}
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping" />
              <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Live</div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
