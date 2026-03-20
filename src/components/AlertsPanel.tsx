import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { Bell, X, Plus } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export default function AlertsPanel() {
  const { user, spotGold, alerts, triggerAlert } = useStore();
  const [targetPrice, setTargetPrice] = useState('');
  const [direction, setDirection] = useState<'above' | 'below'>('above');

  const handleAddAlert = async () => {
    if (!targetPrice) return;
    const price = parseFloat(targetPrice);
    
    if (user) {
      try {
        await addDoc(collection(db, 'alerts'), {
          userId: user.uid,
          targetPrice: price,
          direction,
          triggered: false,
          createdAt: serverTimestamp()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'alerts');
      }
    } else {
      // Local only for guests
      // Note: In this version we assume user should sign in for alerts
      alert("Please sign in to set price sentinels.");
    }
    setTargetPrice('');
  };

  const handleRemoveAlert = async (id: string) => {
    if (user) {
      try {
        await deleteDoc(doc(db, 'alerts', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `alerts/${id}`);
      }
    }
  };

  useEffect(() => {
    alerts.forEach(async (alertItem) => {
      if (!alertItem.triggered) {
        const condition = alertItem.direction === 'above'
          ? spotGold >= alertItem.targetPrice
          : spotGold <= alertItem.targetPrice;
        
        if (condition) {
          if (user) {
            try {
              await updateDoc(doc(db, 'alerts', alertItem.id), {
                triggered: true
              });
            } catch (error) {
              handleFirestoreError(error, OperationType.UPDATE, `alerts/${alertItem.id}`);
            }
          }
          
          if (Notification.permission === 'granted') {
            new Notification('GoldPulse Alert', {
              body: `Gold has reached your target of $${alertItem.targetPrice}`,
              icon: '/vite.svg'
            });
          }
        }
      }
    });
  }, [spotGold, alerts, user]);

  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="glass p-8 rounded-3xl border-black/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-rose-500/10 transition-colors" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
            <Bell size={28} />
          </div>
          <div>
            <h3 className="text-xl font-black text-black tracking-tight">Price Sentinels</h3>
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">Automated Market Monitoring</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Sentinels Active</span>
        </div>
      </div>

      <div className="space-y-8 relative z-10">
        <div className="flex gap-4">
          <input
            type="number"
            placeholder="Target ($)"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            className="flex-1 bg-black/5 border border-black/10 rounded-2xl px-6 py-4 text-[13px] text-black font-bold focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-zinc-600 focus:bg-black/10"
          />
          <select 
            value={direction} 
            onChange={(e) => setDirection(e.target.value as any)}
            className="bg-black/5 border border-black/10 rounded-2xl px-4 py-4 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] outline-none cursor-pointer hover:bg-black/10 transition-all"
          >
            <option value="above" className="bg-white">Above</option>
            <option value="below" className="bg-white">Below</option>
          </select>
          <button 
            onClick={handleAddAlert}
            className="w-14 h-14 vibrant-gradient text-black rounded-2xl flex items-center justify-center hover:scale-105 transition-all shadow-2xl active:scale-95 border border-black/10"
          >
            <Plus size={28} />
          </button>
        </div>

        <div className="max-h-[400px] overflow-y-auto pr-3 scrollbar-hide">
          {alerts.length === 0 ? (
            <div className="text-center py-12 text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em] italic bg-black/5 rounded-3xl border border-dashed border-black/10">
              No active sentinels
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {alerts.map(alert => (
                <div 
                  key={alert.id} 
                  className={`flex items-center justify-between p-6 rounded-2xl border transition-all ${
                    alert.triggered 
                      ? 'bg-black/5 border-black/5 opacity-30 grayscale' 
                      : 'glass border-black/5 hover:border-black/10 shadow-2xl group/item'
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-3 h-3 rounded-full shadow-[0_0_15px_currentColor] ${alert.direction === 'above' ? 'text-emerald-500 bg-emerald-500' : 'text-rose-500 bg-rose-500'}`} />
                    <div>
                      <div className="text-[15px] font-black text-black tracking-tight">${alert.targetPrice.toLocaleString()}</div>
                      <div className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mt-1">
                        {alert.direction} Target {alert.triggered && '• Triggered'}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRemoveAlert(alert.id)}
                    className="text-zinc-600 hover:text-rose-500 transition-all p-2 hover:scale-125"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
