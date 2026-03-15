import useStore from '../store/useStore';
import { Activity, Gauge } from 'lucide-react';

export default function TechnicalAnalysis() {
  const { spotGold } = useStore();
  
  // Mock technical indicators based on price
  const indicators = [
    { name: 'RSI (14)', value: '62.4', status: 'Neutral', color: 'text-zinc-500' },
    { name: 'MACD', value: '12.5', status: 'Bullish', color: 'text-emerald-600' },
    { name: 'MA (50)', value: (spotGold * 0.98).toFixed(2), status: 'Support', color: 'text-emerald-600' },
    { name: 'MA (200)', value: (spotGold * 0.92).toFixed(2), status: 'Strong Support', color: 'text-emerald-600' },
  ];

  return (
    <div className="glass p-8 rounded-3xl border-white/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
      
      <div className="flex items-center gap-3 mb-8 relative z-10">
        <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
          <Activity size={18} />
        </div>
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">Technical Indicators</h3>
      </div>

      <div className="space-y-5 relative z-10">
        {indicators.map(ind => (
          <div key={ind.name} className="flex justify-between items-center border-b border-white/5 pb-3">
            <div>
              <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{ind.name}</div>
              <div className="text-[12px] font-black text-white tracking-tight">{ind.value}</div>
            </div>
            <div className={`text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-md ${
              ind.color === 'text-emerald-600' ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-400 bg-white/5'
            }`}>
              {ind.status}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-white/5 relative z-10">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Overall Signal</span>
          <span className="px-4 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            Strong Buy
          </span>
        </div>
      </div>
    </div>
  );
}
