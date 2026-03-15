import React, { useState, useEffect, useRef } from 'react';
import { Send, Image as ImageIcon, Brain, Loader2, User, Bot } from 'lucide-react';
import { getChatResponse, analyzeGoldImage, getComplexAnalysis } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  role: 'user' | 'bot';
  text: string;
  type?: 'text' | 'analysis' | 'thinking';
}

export default function AIChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: 'Hello! I am GoldPulse AI. How can I help you with gold markets today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await getChatResponse(userMsg);
      setMessages(prev => [...prev, { role: 'bot', text: response || 'Sorry, I could not process that.' }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'bot', text: 'Error connecting to AI service.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleThinkingAnalysis = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsThinking(true);
    setIsLoading(true);

    try {
      const response = await getComplexAnalysis(userMsg);
      setMessages(prev => [...prev, { role: 'bot', text: response || 'Analysis failed.', type: 'thinking' }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'bot', text: 'Deep analysis error.' }]);
    } finally {
      setIsThinking(false);
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', text: 'Analyzing uploaded image...' }]);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const response = await analyzeGoldImage(base64, file.type);
        setMessages(prev => [...prev, { role: 'bot', text: response || 'Image analysis failed.', type: 'analysis' }]);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'bot', text: 'Image processing error.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[650px] glass rounded-3xl overflow-hidden border-white/5 relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-500 z-20" />
      
      <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-2xl relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 vibrant-gradient rounded-2xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(245,158,11,0.3)] border border-white/20">
            <Bot size={32} />
          </div>
          <div>
            <h3 className="font-black text-white text-lg tracking-tight">Market Oracle</h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">AI Intelligence Active</p>
            </div>
          </div>
        </div>
        {isThinking && (
          <div className="flex items-center gap-2 text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] animate-pulse bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
            <Brain size={14}/> Deep Analysis
          </div>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 bg-black/20 relative z-10 scrollbar-hide">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] p-6 rounded-3xl flex gap-4 relative group ${
                msg.role === 'user' 
                  ? 'bg-amber-500 text-black rounded-tr-none font-bold shadow-[0_10px_30px_rgba(245,158,11,0.2)]' 
                  : 'glass-dark border-white/10 text-white rounded-tl-none shadow-2xl'
              }`}>
                <div className="text-[13px] leading-relaxed">
                  {msg.text}
                </div>
                {msg.role === 'bot' && (
                  <div className="absolute -left-10 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-500">
                      <Bot size={14} />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && !isThinking && (
          <div className="flex justify-start">
            <div className="glass-dark border-white/10 px-8 py-4 rounded-full flex items-center gap-4 shadow-2xl">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce shadow-[0_0_8px_rgba(245,158,11,0.5)]" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce shadow-[0_0_8px_rgba(245,158,11,0.5)]" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce shadow-[0_0_8px_rgba(245,158,11,0.5)]" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-8 border-t border-white/5 bg-white/5 backdrop-blur-2xl relative z-10">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Inquire about market trends..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-[13px] text-white focus:ring-2 focus:ring-amber-500/50 outline-none transition-all placeholder:text-zinc-600 focus:bg-white/10"
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-4">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-zinc-500 hover:text-amber-500 transition-all hover:scale-110"
                title="Analyze Image"
              >
                <ImageIcon size={20} />
              </button>
              <button 
                onClick={handleThinkingAnalysis}
                className={`p-2 transition-all hover:scale-110 ${input.trim() ? 'text-amber-500' : 'text-zinc-500'}`}
                title="Deep Analysis"
              >
                <Brain size={20} />
              </button>
            </div>
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-16 h-16 bg-white text-black rounded-2xl flex items-center justify-center hover:bg-amber-500 hover:scale-105 disabled:opacity-20 transition-all shadow-2xl active:scale-95"
          >
            <Send size={28} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleImageUpload}
          />
        </div>
      </div>
    </div>
  );
}
