import { useEffect, useState } from 'react';
import useStore from '../store/useStore';
import { simplePrediction, Prediction } from '../utils/prediction';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { motion } from 'motion/react';

export default function PredictionCard() {
  const { historicalPrices } = useStore();
  const [prediction, setPrediction] = useState<Prediction>({ direction: 'neutral', confidence: 50 });

  useEffect(() => {
    if (historicalPrices.length) {
      const prices = historicalPrices.map(p => p.value);
      setPrediction(simplePrediction(prices));
    }
  }, [historicalPrices]);

  const config = {
    up: { icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Bullish' },
    down: { icon: TrendingDown, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', label: 'Bearish' },
    sideways: { icon: Minus, color: 'text-zinc-400', bg: 'bg-zinc-500/10', border: 'border-zinc-500/20', label: 'Sideways' },
    neutral: { icon: Info, color: 'text-zinc-400', bg: 'bg-zinc-500/10', border: 'border-zinc-500/20', label: 'Neutral' }
  };

  const { icon: Icon, color, bg, border, label } = config[prediction.direction];

  return (
    <div className="glass p-8 rounded-3xl border-white/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-amber-500/10 transition-colors" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Market Sentiment</h3>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Algorithmic Forecast • 24H</p>
        </div>
      </div>

      <div className="flex items-center gap-6 relative z-10">
        <motion.div 
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className={`p-6 rounded-2xl ${bg} ${color} ${border} border shadow-2xl`}
        >
          <Icon size={40} />
        </motion.div>
        <div>
          <div className={`text-3xl font-black tracking-tighter ${color} text-shadow-glow`}>{label}</div>
          <div className="flex flex-col gap-2 mt-3">
            <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${prediction.confidence}%` }}
                className={`h-full ${color.replace('text', 'bg')}`}
              />
            </div>
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em]">{prediction.confidence}% Confidence</span>
          </div>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/5 flex gap-3 relative z-10">
        <Info size={14} className="text-zinc-500 shrink-0 mt-0.5" />
        <p className="text-[10px] text-zinc-400 leading-relaxed font-medium italic">
          Sentiment is derived from a combination of momentum indicators and historical volatility patterns. 
          Use as a secondary signal only.
        </p>
      </div>
    </div>
  );
}
