import { useEffect, useState } from 'react';
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
import { Sparkles, MessageSquare, Menu, LogOut, User as UserIcon } from 'lucide-react';
import Logo from './components/Logo';
import FeedbackModal from './components/FeedbackModal';
import SignInModal from './components/SignInModal';
import MainMenu from './components/MainMenu';
import { auth, db, logout, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';

import Ticker from './components/Ticker';
import TerminalStatus from './components/TerminalStatus';

const FINNHUB_KEY = process.env.FINNHUB_API_KEY || "ct07799r01qj876g83qgct07799r01qj876g83r0";

export default function App() {
  const { user, setUser, setSpotGold, setSilver, setExchangeRates, setAlerts } = useStore();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Sync user profile to Firestore
        try {
          await setDoc(doc(db, 'users', firebaseUser.uid), {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            createdAt: serverTimestamp()
          }, { merge: true });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `users/${firebaseUser.uid}`);
        }
      }
    });

    return () => unsubscribe();
  }, [setUser]);

  useEffect(() => {
    if (!user) {
      setAlerts([]);
      return;
    }

    const q = query(collection(db, 'alerts'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const alertsData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as any;
      setAlerts(alertsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'alerts');
    });

    return () => unsubscribe();
  }, [user, setAlerts]);

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

  const renderContent = () => {
    switch (activeSection) {
      case 'charts':
        return (
          <div className="space-y-6">
            <div className="glass rounded-3xl p-8 border-black/5">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Sparkles className="text-amber-500" size={20} />
                Advanced Market Charts
              </h2>
              <Chart />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TechnicalAnalysis />
              <PredictionCard />
            </div>
          </div>
        );
      case 'news':
        return (
          <div className="max-w-4xl mx-auto">
            <NewsFeed />
          </div>
        );
      case 'analysis':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TechnicalAnalysis />
            <div className="space-y-6">
              <PredictionCard />
              <div className="glass p-8 rounded-3xl border-black/5">
                <h3 className="text-lg font-bold mb-4 text-amber-500">Market Intelligence Report</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Our AI models are currently detecting a strong bullish divergence in the 4H timeframe. 
                  Central bank accumulation remains at record highs, providing a solid floor for gold prices.
                </p>
              </div>
            </div>
          </div>
        );
      case 'calculator':
        return (
          <div className="max-w-2xl mx-auto">
            <Calculator />
          </div>
        );
      case 'alerts':
        return (
          <div className="max-w-2xl mx-auto">
            <AlertsPanel />
          </div>
        );
      default:
        return (
          <div className="grid grid-cols-12 gap-6">
            {/* Main Content Area */}
            <div className="col-span-12 space-y-8">
              {/* Top Row: Price Cards (Landscape) */}
              <PriceCards />

              <div className="space-y-8">
                {/* Full Width Chart */}
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-indigo-500/20 blur-xl opacity-50" />
                  <Chart />
                </div>
                
                {/* Landscape Market Intelligence */}
                <NewsFeed />
                
                {/* Landscape Price Sentinels */}
                <AlertsPanel />
              </div>

              {/* Technical Indicators (Landscape) */}
              <TechnicalAnalysis />

              {/* Middle Row: Valuation Tool (Landscape) */}
              <Calculator />
              
              {/* Landscape Intelligence Section */}
              <div className="space-y-6">
                <div className="glass rounded-[2.5rem] p-12 relative overflow-hidden group border-black/5 shadow-2xl">
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full -mr-64 -mt-64 blur-[120px] opacity-40 group-hover:opacity-60 transition-opacity duration-1000" />
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full -ml-40 -mb-40 blur-[100px] opacity-30" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/20 shadow-inner">
                        <Sparkles size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black uppercase tracking-[0.4em] text-amber-500/80">Market Intelligence Briefing</span>
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Neural Network Analysis • v2.5</span>
                      </div>
                    </div>
                    <div className="flex flex-col lg:flex-row gap-12 items-start">
                      <div className="flex-1">
                        <h2 className="text-5xl font-bold mb-8 leading-[1.1] text-zinc-900 font-serif italic tracking-tight">
                          Gold Prices Surge as Central Banks <br />
                          <span className="gold-text-gradient drop-shadow-2xl">Increase Global Reserves</span>
                        </h2>
                        <p className="text-zinc-600 text-lg leading-relaxed mb-10 font-medium opacity-90">
                          Our proprietary AI models analyze over 50 global data points including treasury yields, 
                          central bank reserves, and regional physical demand to provide real-time sentiment analysis.
                        </p>
                        <div className="flex items-center gap-8">
                          <button className="px-12 py-5 gold-gradient rounded-full font-black text-[11px] uppercase tracking-[0.2em] text-black hover:scale-105 hover:shadow-[0_0_50px_rgba(245,158,11,0.4)] transition-all duration-500 cursor-pointer active:scale-95">
                            Read Full Analysis
                          </button>
                          <div className="flex items-center gap-3 px-4 py-2 bg-black/5 rounded-xl border border-black/5">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Live Feed Active</span>
                          </div>
                        </div>
                      </div>
                      <div className="lg:w-1/3 w-full space-y-6">
                        <div className="p-6 bg-black/5 rounded-3xl border border-black/5">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-4">Key Insight</h4>
                          <p className="text-sm text-zinc-600 leading-relaxed italic">
                            "The current breakout above $2,150 suggests a structural shift in precious metal demand, driven by geopolitical hedging."
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                            <div className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Buy Signal</div>
                            <div className="text-lg font-black text-emerald-700">Strong</div>
                          </div>
                          <div className="p-4 bg-rose-500/5 rounded-2xl border border-rose-500/10">
                            <div className="text-[9px] font-bold text-rose-600 uppercase tracking-widest mb-1">Risk Level</div>
                            <div className="text-lg font-black text-rose-700">Low</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-12 lg:col-span-5">
                    <PredictionCard />
                  </div>
                  <div className="col-span-12 lg:col-span-7">
                    <AIChatbot />
                  </div>
                </div>
              </div>

              <PriceBreakdown />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen selection:bg-amber-500/30 relative overflow-hidden bg-[#F8F9FA] text-zinc-900">
      {/* Immersive Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Animated Colorful Blobs - Adjusted for Light Mode */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-amber-200/40 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-200/40 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '-2s' }} />
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-rose-200/30 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '-4s' }} />
        <div className="absolute bottom-[20%] left-[10%] w-[35%] h-[35%] bg-emerald-200/30 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '-6s' }} />
        
        {/* Background Logo (Atmospheric) - Adjusted for Light Mode */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <div className="opacity-[0.03] blur-[1px] scale-150 transform-gpu animate-float">
            <Logo size={1200} />
          </div>
        </div>
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-multiply" />
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
        className="fixed bottom-8 right-8 z-[60] w-14 h-14 bg-amber-500 hover:bg-amber-600 text-black rounded-full shadow-[0_0_30px_rgba(245,158,11,0.4)] flex items-center justify-center transition-all hover:scale-110 active:scale-95 group"
      >
        <MessageSquare size={24} className="group-hover:rotate-12 transition-transform" />
        <div className="absolute right-full mr-4 px-3 py-1.5 bg-white text-black text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
          Feedback & Support
        </div>
      </button>

      {/* Header */}
      <header className="bg-white/70 backdrop-blur-2xl border-b border-black/5 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="p-3 hover:bg-black/5 rounded-xl transition-all text-zinc-500 hover:text-zinc-900 group"
            >
              <Menu size={24} className="group-hover:scale-110 transition-transform" />
            </button>
            <div className="h-8 w-[1px] bg-black/10" />
            <div className="relative group">
              <div className="absolute inset-0 gold-gradient blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
              <Logo size={44} className="relative z-10" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <h1 className="text-2xl font-black tracking-tighter text-zinc-900 leading-none flex items-center gap-1">
                  GOLDPULSE
                  <span className="text-amber-600 italic font-serif">PRO</span>
                </h1>
                <div className="h-4 w-[1px] bg-black/10 mx-1" />
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-[0.2em] leading-none">Terminal</span>
              </div>
              <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-[0.1em] mt-1.5">
                Live Gold Rate Pakistan • 24K & 22K Prices • Silver Rate • Market Analysis
              </p>
            </div>
          </div>
          
          <nav className="hidden lg:flex items-center gap-10">
            {[
              { label: 'Gold', id: 'dashboard' },
              { label: 'Silver', id: 'dashboard' },
              { label: 'Platinum', id: 'dashboard' },
              { label: 'Charts', id: 'charts' },
              { label: 'News', id: 'news' },
              { label: 'Analysis', id: 'analysis' }
            ].map(item => (
              <button 
                key={item.label} 
                onClick={() => setActiveSection(item.id)}
                className={`text-[12px] font-semibold uppercase tracking-widest transition-all relative group cursor-pointer ${
                  activeSection === item.id ? 'text-amber-600' : 'text-zinc-500 hover:text-amber-600'
                }`}
              >
                {item.label}
                <span className={`absolute -bottom-1 left-0 h-[2px] bg-amber-600 transition-all ${
                  activeSection === item.id ? 'w-full' : 'w-0 group-hover:w-full'
                }`} />
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <CurrencySelector />
              <CitySelector />
            </div>
            <div className="h-6 w-[1px] bg-black/10" />
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest">{user.displayName || 'User'}</span>
                  <button 
                    onClick={() => logout()}
                    className="text-[9px] font-bold text-rose-500 uppercase tracking-widest hover:text-rose-600 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full border border-black/5" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-zinc-400 border border-black/5">
                    <UserIcon size={20} />
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => setIsSignInOpen(true)}
                className="px-6 py-2.5 bg-amber-500 text-black hover:bg-amber-600 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all shadow-xl shadow-black/5"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 py-6 relative z-10">
        <div className="mb-6">
          <TerminalStatus />
        </div>
        {renderContent()}

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-black/5 flex flex-col gap-6 relative z-10">
          <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            <div className="flex items-center gap-3">
              <Logo size={20} className="opacity-30" />
              <span>© 2026 GoldPulse Pro Terminal</span>
            </div>
            <div className="flex items-center gap-8">
              <button 
                onClick={() => setIsFeedbackOpen(true)}
                className="hover:text-amber-600 transition-colors"
              >
                Feedback
              </button>
              <a href="#" className="hover:text-amber-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-amber-600 transition-colors">Terms</a>
              <a href="#" className="hover:text-amber-600 transition-colors">Contact</a>
              <span className="flex items-center gap-2 px-3 py-1 bg-black/5 rounded-full border border-black/5">
                Powered by <Sparkles size={10} className="text-amber-600" /> <span className="text-zinc-600">Google AI</span>
              </span>
            </div>
          </div>
          <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.4em] text-center pb-8 max-w-4xl mx-auto leading-relaxed">
            Gold Rate Pakistan • Live Gold Price • 24K Gold Rate • 22K Gold Rate • Silver Price Pakistan • Gold Calculator • Market Analysis • Precious Metals Terminal
          </div>
        </footer>
      </main>
    </div>
  );
}
