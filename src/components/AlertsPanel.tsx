import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { Bell, X, Plus } from 'lucide-react';

export default function AlertsPanel() {
  const { spotGold, alerts, addAlert, removeAlert, triggerAlert } = useStore();
  const [targetPrice, setTargetPrice] = useState('');
  const [direction, setDirection] = useState<'above' | 'below'>('above');

  const handleAddAlert = () => {
    if (!targetPrice) return;
    addAlert({ targetPrice: parseFloat(targetPrice), direction });
    setTargetPrice('');
  };

  useEffect(() => {
    alerts.forEach(alert => {
      if (!alert.triggered) {
        const condition = alert.direction === 'above'
          ? spotGold >= alert.targetPrice
          : spotGold <= alert.targetPrice;
        
        if (condition) {
          triggerAlert(alert.id);
          if (Notification.permission === 'granted') {
            new Notification('GoldPulse Alert', {
              body: `Gold has reached your target of $${alert.targetPrice}`,
              icon: '/vite.svg'
            });
          }
        }
      }
    });
  }, [spotGold, alerts, triggerAlert]);

  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="glass p-8 rounded-3xl border-white/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-rose-500/10 transition-colors" />
      
      <div className="flex items-center gap-4 mb-10 relative z-10">
        <div className="p-3.5 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
          <Bell size={28} />
        </div>
        <div>
          <h3 className="text-xl font-black text-white tracking-tight">Price Sentinels</h3>
          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">Automated Market Monitoring</p>
        </div>
      </div>

      <div className="space-y-8 relative z-10">
        <div className="flex gap-4">
          <input
            type="number"
            placeholder="Target ($)"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-[13px] text-white font-bold focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-zinc-600 focus:bg-white/10"
          />
          <select 
            value={direction} 
            onChange={(e) => setDirection(e.target.value as any)}
            className="bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] outline-none cursor-pointer hover:bg-white/10 transition-all"
          >
            <option value="above" className="bg-zinc-900">Above</option>
            <option value="below" className="bg-zinc-900">Below</option>
          </select>
          <button 
            onClick={handleAddAlert}
            className="w-14 h-14 vibrant-gradient text-white rounded-2xl flex items-center justify-center hover:scale-105 transition-all shadow-2xl active:scale-95 border border-white/20"
          >
            <Plus size={28} />
          </button>
        </div>

        <div className="max-h-[300px] overflow-y-auto space-y-4 pr-3 scrollbar-hide">
          {alerts.length === 0 && (
            <div className="text-center py-12 text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em] italic bg-white/5 rounded-3xl border border-dashed border-white/10">
              No active sentinels
            </div>
          )}
          {alerts.map(alert => (
            <div 
              key={alert.id} 
              className={`flex items-center justify-between p-6 rounded-2xl border transition-all ${
                alert.triggered 
                  ? 'bg-white/5 border-white/5 opacity-30 grayscale' 
                  : 'glass-dark border-white/10 hover:border-white/20 shadow-2xl group/item'
              }`}
            >
              <div className="flex items-center gap-5">
                <div className={`w-3 h-3 rounded-full shadow-[0_0_15px_currentColor] ${alert.direction === 'above' ? 'text-emerald-500 bg-emerald-500' : 'text-rose-500 bg-rose-500'}`} />
                <div>
                  <div className="text-[15px] font-black text-white tracking-tight">${alert.targetPrice.toLocaleString()}</div>
                  <div className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mt-1">
                    {alert.direction} Target {alert.triggered && '• Triggered'}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => removeAlert(alert.id)}
                className="text-zinc-600 hover:text-rose-500 transition-all p-2 hover:scale-125"
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
