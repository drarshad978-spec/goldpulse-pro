import React from 'react';
import { 
  X, 
  LayoutDashboard, 
  LineChart, 
  Calculator, 
  Sparkles, 
  Newspaper, 
  Bell, 
  BarChart3, 
  Settings,
  Globe,
  MapPin,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo';

interface MainMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection: string;
  onSectionSelect: (section: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Market Dashboard', icon: LayoutDashboard, description: 'Real-time spot rates & breakdown' },
  { id: 'charts', label: 'Historical Charts', icon: LineChart, description: 'Advanced interactive price history' },
  { id: 'analysis', label: 'Technical Analysis', icon: BarChart3, description: 'RSI, Moving Averages & Signals' },
  { id: 'calculator', label: 'Gold Calculator', icon: Calculator, description: 'Convert weights & calculate purity' },
  { id: 'ai', label: 'AI Intelligence', icon: Sparkles, description: 'Market predictions & insights' },
  { id: 'news', label: 'News Terminal', icon: Newspaper, description: 'Global & local market updates' },
  { id: 'alerts', label: 'Price Alerts', icon: Bell, description: 'Manage your custom notifications' },
];

const secondaryItems = [
  { id: 'settings', label: 'Preferences', icon: Settings },
  { id: 'localization', label: 'City & Currency', icon: Globe },
  { id: 'security', label: 'Security', icon: ShieldCheck },
];

export default function MainMenu({ isOpen, onClose, activeSection, onSectionSelect }: MainMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100]"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-full max-w-[380px] bg-zinc-950 z-[101] shadow-2xl flex flex-col border-r border-white/5"
          >
            {/* Header */}
            <div className="p-8 flex items-center justify-between border-b border-white/5 bg-black/20">
              <div className="flex items-center gap-4">
                <Logo size={32} />
                <div className="flex flex-col">
                  <span className="text-sm font-black tracking-tighter text-white">GOLDPULSE <span className="text-amber-500 italic font-serif">PRO</span></span>
                  <span className="text-[7px] font-bold text-zinc-500 uppercase tracking-widest leading-tight">
                    Live Gold Rates • AI Analysis • Pakistan Bullion
                  </span>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Main Navigation */}
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 bg-gradient-to-b from-zinc-950 to-black">
              <div className="px-4 mb-4">
                <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em]">Core Features</span>
              </div>
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSectionSelect(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${
                    activeSection === item.id 
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                      : 'hover:bg-white/5 text-zinc-400 hover:text-white border border-transparent'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl transition-all ${
                    activeSection === item.id 
                      ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]' 
                      : 'bg-zinc-900 text-zinc-500 group-hover:bg-zinc-800 group-hover:text-zinc-300'
                  }`}>
                    <item.icon size={18} />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-xs font-bold tracking-tight">{item.label}</span>
                    <span className="text-[10px] text-zinc-600 font-medium group-hover:text-zinc-500">{item.description}</span>
                  </div>
                  {activeSection === item.id && (
                    <motion.div 
                      layoutId="active-indicator"
                      className="ml-auto w-1.5 h-1.5 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]" 
                    />
                  )}
                </button>
              ))}

              <div className="px-4 mt-8 mb-4">
                <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em]">System</span>
              </div>
              {secondaryItems.map((item) => (
                <button
                  key={item.id}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 text-zinc-500 hover:text-white transition-all group"
                >
                  <div className="p-2.5 bg-zinc-900 text-zinc-600 rounded-xl group-hover:bg-zinc-800 transition-colors">
                    <item.icon size={18} />
                  </div>
                  <span className="text-xs font-bold tracking-tight">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-white/5 bg-black/40">
              <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 text-white relative overflow-hidden group cursor-pointer backdrop-blur-xl">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-amber-500/20 transition-colors" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap size={14} className="text-amber-400 fill-amber-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Pro Status</span>
                  </div>
                  <p className="text-[11px] font-medium text-zinc-400 leading-relaxed mb-4">
                    You are currently using the Professional Terminal with real-time AI insights.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white">Active Session</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                      <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Live</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                <span>v2.5.0-stable</span>
                <span>GoldPulse Pro</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
