import { useEffect, useState } from 'react';
import { generateMarketNews, summarizeTopStories } from '../services/geminiService';
import { Newspaper, Clock, ExternalLink, Sparkles } from 'lucide-react';

interface NewsItem {
  title: string;
  summary: string;
  source: string;
  time: string;
  impact: 'high' | 'medium' | 'low';
}

export default function NewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [briefing, setBriefing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [summarizing, setSummarizing] = useState(false);

  useEffect(() => {
    async function fetchNews() {
      try {
        setLoading(true);
        const text = await generateMarketNews();
        const data = JSON.parse(text);
        setNews(data);
        
        // Generate briefing for top 3
        if (data.length >= 3) {
          setSummarizing(true);
          try {
            const topHeadlines = data.slice(0, 3).map((item: any) => item.title);
            const summary = await summarizeTopStories(topHeadlines);
            setBriefing(summary);
          } catch (err) {
            console.error("Failed to generate briefing:", err);
          } finally {
            setSummarizing(false);
          }
        }
      } catch (error) {
        console.error("Failed to fetch news:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
    const interval = setInterval(fetchNews, 600000); // Update every 10 mins
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass p-8 rounded-3xl border-white/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-amber-500/10 transition-colors" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/5 text-zinc-400 rounded-xl border border-white/10">
            <Newspaper size={18} />
          </div>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">Market Intelligence</h3>
        </div>
        <button className="text-[10px] font-black text-amber-500 uppercase tracking-widest hover:text-amber-400 transition-colors">View All</button>
      </div>

      {/* AI Market Briefing */}
      {(briefing || summarizing) && (
        <div className="mb-10 p-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Sparkles size={40} className="text-amber-500" />
          </div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={12} className="text-amber-500" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-500">AI Market Briefing</span>
          </div>
          {summarizing ? (
            <div className="space-y-3">
              <div className="h-1.5 bg-amber-500/10 rounded-full w-full animate-pulse" />
              <div className="h-1.5 bg-amber-500/10 rounded-full w-2/3 animate-pulse" />
            </div>
          ) : (
            <p className="text-[12px] text-zinc-300 leading-relaxed font-medium italic">
              "{briefing}"
            </p>
          )}
        </div>
      )}

      <div className="space-y-8 relative z-10">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="animate-pulse space-y-3">
              <div className="h-3 bg-white/5 rounded-full w-3/4" />
              <div className="h-2 bg-white/5 rounded-full w-full" />
            </div>
          ))
        ) : (
          news.map((item, i) => (
            <div key={i} className="group cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <span className={`w-2 h-2 rounded-full shadow-[0_0_10px_currentColor] ${
                  item.impact === 'high' ? 'text-rose-500 bg-rose-500' : 
                  item.impact === 'medium' ? 'text-amber-500 bg-amber-500' : 'text-emerald-500 bg-emerald-500'
                }`} />
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{item.source} • {item.time}</span>
              </div>
              <h4 className="text-[13px] font-bold text-white leading-snug group-hover:text-amber-500 transition-colors mb-2 tracking-tight">
                {item.title}
              </h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2 font-medium">
                {item.summary}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
