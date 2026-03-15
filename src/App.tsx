import { useEffect } from 'react';
import useStore from './store/useStore';
import { connectGoldWebSocket } from './api/finnhub';
import { fetchAllExchangeRates } from './api/exchange';
import { fetchSilverPrice, fetchGoldPriceFallback } from './api/metals';
import { fetchHistoricalPrices } from './api/historical';
import PriceCards from './components/PriceCards';
import PriceBreakdown from './components/PriceBreakdown';
import CitySelector from './components/CitySelector';
import CurrencySelector from './components/CurrencySelector';
import Chart from './components/Chart';
import PredictionCard from './components/PredictionCard';
import Calculator from './components/Calculator';
import AlertsPanel from './components/AlertsPanel';
import AIChatbot from './components/AIChatbot';
import NewsFeed from './components/NewsFeed';
import TechnicalAnalysis from './components/TechnicalAnalysis';
import { Sparkles, MessageSquare, Menu } from 'lucide-react';
import Logo from './components/Logo';
import FeedbackModal from './components/FeedbackModal';
import SignInModal from './components/SignInModal';
import MainMenu from './components/MainMenu';
import { useState } from 'react';

import Ticker from './components/Ticker';

const FINNHUB_KEY = process.env.FINNHUB_API_KEY || "ct07799r01qj876g83qgct07799r01qj876g83r0";

export default function App() {
  const { setSpotGold, setSilver, setExchangeRates } = useStore();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    // Initial data
    fetchSilverPrice().then(setSilver);
    fetchAllExchangeRates().then(setExchangeRates);
    fetchGoldPriceFallback().then(setSpotGold);

    // WebSocket for real-time gold
    // Note: In real app, this key should be in .env
    const socket = connectGoldWebSocket(FINNHUB_KEY, (price) => {
      setSpotGold(price);
    });

    // Refresh exchange rates every 5 minutes
    const fxInterval = setInterval(() => {
      fetchAllExchangeRates().then(setExchangeRates);
    }, 300000);

    // Refresh Silver every 10 minutes
    const silverInterval = setInterval(() => {
      fetchSilverPrice().then(setSilver);
    }, 600000);

    return () => {
      socket.close();
      clearInterval(fxInterval);
      clearInterval(silverInterval);
    };
  }, [setSpotGold, setSilver, setExchangeRates]);

  return (
    <div className="min-h-screen selection:bg-amber-500/30 relative overflow-hidden bg-[#08080c] text-white">
      {/* Immersive Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Animated Colorful Blobs - Increased Opacity and Vibrancy */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-amber-500/30 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/30 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '-2s' }} />
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-rose-500/25 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '-4s' }} />
        <div className="absolute bottom-[20%] left-[10%] w-[35%] h-[35%] bg-emerald-500/20 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '-6s' }} />
        
        {/* Background Logo (Atmospheric) - Increased Visibility */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <div className="opacity-[0.06] blur-[2px] scale-150 transform-gpu animate-float">
            <Logo size={1200} />
          </div>
        </div>
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay" />
      </div>

      <Ticker />
      
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
      <SignInModal isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />
      <MainMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        activeSection={activeSection}
        onSectionSelect={setActiveSection}
      />

      {/* Floating Feedback Button */}
      <button 
        onClick={() => setIsFeedbackOpen(true)}
        className="fixed bottom-8 right-8 z-[60] w-14 h-14 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-[0_0_30px_rgba(245,158,11,0.4)] flex items-center justify-center transition-all hover:scale-110 active:scale-95 group"
      >
        <MessageSquare size={24} className="group-hover:rotate-12 transition-transform" />
        <div className="absolute right-full mr-4 px-3 py-1.5 bg-white text-black text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
          Feedback & Support
        </div>
      </button>

      {/* Header */}
      <header className="bg-black/40 backdrop-blur-2xl border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="p-3 hover:bg-white/5 rounded-xl transition-all text-zinc-400 hover:text-white group"
            >
              <Menu size={24} className="group-hover:scale-110 transition-transform" />
            </button>
            <div className="h-8 w-[1px] bg-white/10" />
            <div className="relative group">
              <div className="absolute inset-0 gold-gradient blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
              <Logo size={44} className="relative z-10" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <h1 className="text-2xl font-black tracking-tighter text-white leading-none flex items-center gap-1">
                  GOLDPULSE
                  <span className="text-amber-500 italic font-serif text-shadow-glow">PRO</span>
                </h1>
                <div className="h-4 w-[1px] bg-white/10 mx-1" />
                <span className="text-[10px] font-bold text-amber-500/80 uppercase tracking-[0.2em] leading-none">Terminal</span>
              </div>
              <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-[0.1em] mt-1.5">
                Live Gold Rate Pakistan • 24K & 22K Prices • Silver Rate • Market Analysis
              </p>
            </div>
          </div>
          
          <nav className="hidden lg:flex items-center gap-10">
            {['Gold', 'Silver', 'Platinum', 'Charts', 'News', 'Analysis'].map(item => (
              <a key={item} href="#" className="text-[12px] font-semibold uppercase tracking-widest text-zinc-400 hover:text-amber-500 transition-all relative group">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-amber-500 transition-all group-hover:w-full" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <CurrencySelector />
              <CitySelector />
            </div>
            <div className="h-6 w-[1px] bg-white/10" />
            <button 
              onClick={() => setIsSignInOpen(true)}
              className="px-6 py-2.5 bg-white text-black hover:bg-amber-500 hover:text-white rounded-full text-[11px] font-bold uppercase tracking-widest transition-all shadow-xl shadow-white/5"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 py-6 relative z-10">
        <div className="grid grid-cols-12 gap-6">
          
          {/* Left Sidebar: Market Stats */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            <PriceCards />
            <PredictionCard />
            <TechnicalAnalysis />
          </div>

          {/* Center: Main Chart & Analysis */}
          <div className="col-span-12 lg:col-span-6 space-y-6">
            <Chart />
            
            <div className="glass rounded-3xl p-10 relative overflow-hidden group border-white/10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full -mr-48 -mt-48 blur-[100px] opacity-50 group-hover:opacity-80 transition-opacity" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full -ml-32 -mb-32 blur-[80px] opacity-30" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
                    <Sparkles size={18} />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-amber-500">Market Intelligence</span>
                </div>
                <h2 className="text-4xl font-bold mb-6 leading-tight text-white font-serif italic tracking-tight">
                  Gold Prices Surge as Central Banks <br />
                  <span className="gold-text-gradient">Increase Global Reserves</span>
                </h2>
                <p className="text-zinc-400 text-base leading-relaxed mb-8 max-w-2xl font-medium">
                  Our proprietary AI models analyze over 50 global data points including treasury yields, 
                  central bank reserves, and regional physical demand to provide real-time sentiment analysis.
                </p>
                <div className="flex items-center gap-6">
                  <button className="px-10 py-4 gold-gradient rounded-full font-bold text-[11px] uppercase tracking-widest text-white hover:scale-105 transition-all shadow-[0_0_40px_rgba(245,158,11,0.3)]">
                    Read Full Analysis
                  </button>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Updated 5m ago</span>
                  </div>
                </div>
              </div>
            </div>

            <PriceBreakdown />
          </div>

          {/* Right Sidebar: Tools & Chat */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            <Calculator />
            <NewsFeed />
            <AlertsPanel />
            <AIChatbot />
          </div>

        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-white/5 flex flex-col gap-6 relative z-10">
          <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            <div className="flex items-center gap-3">
              <Logo size={20} className="opacity-50" />
              <span>© 2026 GoldPulse Pro Terminal</span>
            </div>
            <div className="flex items-center gap-8">
              <button 
                onClick={() => setIsFeedbackOpen(true)}
                className="hover:text-amber-500 transition-colors"
              >
                Feedback
              </button>
              <a href="#" className="hover:text-amber-500 transition-colors">Privacy</a>
              <a href="#" className="hover:text-amber-500 transition-colors">Terms</a>
              <a href="#" className="hover:text-amber-500 transition-colors">Contact</a>
              <span className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                Powered by <Sparkles size={10} className="text-amber-500" /> <span className="text-zinc-300">Google AI</span>
              </span>
            </div>
          </div>
          <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.4em] text-center pb-8 max-w-4xl mx-auto leading-relaxed">
            Gold Rate Pakistan • Live Gold Price • 24K Gold Rate • 22K Gold Rate • Silver Price Pakistan • Gold Calculator • Market Analysis • Precious Metals Terminal
          </div>
        </footer>
      </main>
    </div>
  );
}
