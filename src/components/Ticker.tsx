import useStore from '../store/useStore';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'motion/react';

export default function Ticker() {
  const { spotGold, silver, usdPkr, selectedCurrency, exchangeRates } = useStore();

  const rate = exchangeRates[selectedCurrency] || 1;

  const items = [
    { label: `GOLD (${selectedCurrency})`, value: spotGold * rate, change: '+12.45', percent: '+0.52%' },
    { label: `SILVER (${selectedCurrency})`, value: silver * rate, change: '-0.12', percent: '-0.38%' },
    { 
      label: selectedCurrency === 'USD' ? 'PKR/USD' : `USD/${selectedCurrency}`, 
      value: selectedCurrency === 'USD' ? usdPkr : rate, 
      change: '+0.05', 
      percent: '+0.02%' 
    },
    { label: 'PLATINUM', value: 984.20 * rate, change: '+5.30', percent: '+0.54%' },
    { label: 'PALLADIUM', value: 1042.15 * rate, change: '-12.40', percent: '-1.18%' },
    { label: 'BITCOIN', value: 68420.50 * rate, change: '+1240.20', percent: '+1.85%' },
    { label: 'VOLATILITY (VIX)', value: 14.25, change: '-0.45', percent: '-3.12%' },
    { label: 'DXY INDEX', value: 103.42, change: '+0.12', percent: '+0.11%' },
    { label: 'US 10Y YIELD', value: 4.12, change: '+0.02', percent: '+0.48%' },
  ];

  return (
    <div className="ticker-wrap flex items-center gap-12 border-b border-black/5 bg-white/80 backdrop-blur-2xl relative overflow-hidden h-10">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-indigo-500/5 pointer-events-none" />
      <div className="flex animate-marquee gap-20 py-1 relative z-10">
        {[...items, ...items].map((item, i) => (
          <div key={i} className="flex items-center gap-5 text-[11px] font-bold tracking-widest">
            <span className="text-zinc-500 uppercase text-[8px] tracking-[0.3em]">{item.label}</span>
            <span className="text-black font-mono text-[12px] font-black">{item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <div className={`flex items-center gap-2 px-2.5 py-0.5 rounded-full ${
              item.change.startsWith('+') 
                ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' 
                : 'text-rose-700 bg-rose-50 border border-rose-200'
            }`}>
              <span className="text-[10px] font-black">{item.change}</span>
              <span className="text-[8px] font-bold opacity-60">({item.percent})</span>
              {item.change.startsWith('+') ? (
                <TrendingUp size={10} className="stroke-[3px]" />
              ) : (
                <TrendingDown size={10} className="stroke-[3px]" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
