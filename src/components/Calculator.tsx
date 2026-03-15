import { useState } from 'react';
import useStore from '../store/useStore';
import { Calculator as CalcIcon, ChevronDown } from 'lucide-react';

export default function Calculator() {
  const { getGoldPrices, selectedCurrency } = useStore();
  const prices = getGoldPrices();
  const [weight, setWeight] = useState<number>(1);
  const [unit, setUnit] = useState<'gram' | 'tenGram' | 'tola' | 'ounce' | 'kilogram'>('tola');
  const [purity, setPurity] = useState<24 | 22>(24);

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

  const unitToGram = { gram: 1, tenGram: 10, tola: 11.664, ounce: 31.1035, kilogram: 1000 };
  const weightInGrams = weight * unitToGram[unit];
  const basePricePerGram = purity === 24 ? prices.gold24.gram : prices.gold22.gram;
  const total = weightInGrams * basePricePerGram;

  return (
    <div className="glass p-8 rounded-3xl border-white/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-amber-500/10 transition-colors" />
      
      <div className="flex items-center gap-4 mb-10 relative z-10">
        <div className="p-3.5 bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          <CalcIcon size={28} />
        </div>
        <div>
          <h3 className="text-xl font-black text-white tracking-tight">Valuation Tool</h3>
          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">Real-time Asset Calculation</p>
        </div>
      </div>

      <div className="space-y-8 relative z-10">
        <div>
          <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3">Weight</label>
          <input 
            type="number" 
            value={weight} 
            onChange={(e) => setWeight(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:ring-2 focus:ring-amber-500/50 outline-none transition-all focus:bg-white/10"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3">Unit</label>
            <div className="relative">
              <select 
                value={unit} 
                onChange={(e) => setUnit(e.target.value as any)}
                className="w-full appearance-none bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:ring-2 focus:ring-amber-500/50 outline-none transition-all focus:bg-white/10 cursor-pointer"
              >
                <option value="gram" className="bg-zinc-900">Gram</option>
                <option value="tenGram" className="bg-zinc-900">10 Gram</option>
                <option value="tola" className="bg-zinc-900">Tola</option>
                <option value="ounce" className="bg-zinc-900">Ounce</option>
                <option value="kilogram" className="bg-zinc-900">Kilogram</option>
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={18} />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3">Purity</label>
            <div className="relative">
              <select 
                value={purity} 
                onChange={(e) => setPurity(parseInt(e.target.value) as any)}
                className="w-full appearance-none bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:ring-2 focus:ring-amber-500/50 outline-none transition-all focus:bg-white/10 cursor-pointer"
              >
                <option value={24} className="bg-zinc-900">24K</option>
                <option value={22} className="bg-zinc-900">22K</option>
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={18} />
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 mt-10">
          <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-3">Market Valuation</div>
          <div className="text-5xl font-black text-white tracking-tighter text-shadow-glow">
            <span className="text-amber-500 mr-3">{symbol}</span>
            {total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>
    </div>
  );
}
