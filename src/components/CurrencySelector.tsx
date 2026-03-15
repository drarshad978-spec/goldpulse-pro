import useStore from '../store/useStore';
import { Globe, ChevronDown } from 'lucide-react';

export default function CurrencySelector() {
  const { selectedCurrency, setSelectedCurrency, exchangeRates } = useStore();
  
  return (
    <div className="flex items-center gap-4 glass px-6 py-3 rounded-2xl border-white/5 hover:border-white/20 transition-all group backdrop-blur-3xl shadow-2xl">
      <Globe size={18} className="text-emerald-400 group-hover:scale-125 transition-transform shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
      <div className="h-4 w-[1px] bg-white/10" />
      <div className="relative flex items-center">
        <select 
          value={selectedCurrency} 
          onChange={(e) => setSelectedCurrency(e.target.value)}
          className="appearance-none bg-transparent pr-8 text-[11px] font-black text-white uppercase tracking-[0.2em] outline-none cursor-pointer"
        >
          {Object.keys(exchangeRates).map(curr => (
            <option key={curr} value={curr} className="bg-zinc-900">{curr}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none group-hover:text-white transition-colors" size={14} />
      </div>
    </div>
  );
}
