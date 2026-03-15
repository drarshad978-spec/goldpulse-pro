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
  ];

  return (
    <div className="ticker-wrap flex items-center gap-12 border-b border-white/5 bg-black/60 backdrop-blur-xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-indigo-500/5 pointer-events-none" />
      <div className="flex animate-marquee gap-16 py-1 relative z-10">
        {[...items, ...items].map((item, i) => (
          <div key={i} className="flex items-center gap-4 text-[11px] font-bold tracking-widest">
            <span className="text-zinc-500 uppercase text-[9px]">{item.label}</span>
            <span className="text-white font-mono text-shadow-glow">{item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md ${
              item.change.startsWith('+') 
                ? 'text-emerald-400 bg-emerald-500/10' 
                : 'text-rose-400 bg-rose-500/10'
            }`}>
              <span className="text-[10px]">{item.change}</span>
              <span className="text-[8px] font-black opacity-80">({item.percent})</span>
              {item.change.startsWith('+') ? (
                <TrendingUp size={10} />
              ) : (
                <TrendingDown size={10} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
