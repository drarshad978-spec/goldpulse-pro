import React from 'react';
import { Activity, ShieldCheck, Zap, Globe, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';

export default function TerminalStatus() {
  const stats = [
    { label: 'Market Status', value: 'OPEN', color: 'text-emerald-500', icon: Globe },
    { label: 'Volatility', value: 'LOW', color: 'text-amber-500', icon: Activity },
    { label: 'Sentiment', value: 'BULLISH', color: 'text-emerald-500', icon: BarChart3 },
    { label: 'AI Confidence', value: '94%', color: 'text-indigo-500', icon: ShieldCheck },
    { label: 'Latency', value: '12ms', color: 'text-zinc-500', icon: Zap },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className="glass px-5 py-4 rounded-2xl flex items-center justify-between border-black/5 group hover:bg-black/5 transition-all"
        >
          <div className="flex flex-col gap-1">
            <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.2em] group-hover:text-zinc-500 transition-colors">
              {stat.label}
            </div>
            <div className={`text-[11px] font-black uppercase tracking-widest ${stat.color} flex items-center gap-2`}>
              <div className={`w-1 h-1 rounded-full bg-current ${stat.label === 'Market Status' ? 'animate-pulse' : ''}`} />
              {stat.value}
            </div>
          </div>
          <stat.icon size={16} className="text-zinc-400 group-hover:text-zinc-900 transition-colors" />
        </motion.div>
      ))}
    </div>
  );
}
