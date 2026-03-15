import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, AreaSeries } from 'lightweight-charts';
import useStore from '../store/useStore';
import { fetchHistoricalPrices } from '../api/historical';
import { Calendar } from 'lucide-react';

export default function Chart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const { historicalPrices, setHistoricalPrices, selectedTimeframe, setSelectedTimeframe } = useStore();
  const [loading, setLoading] = useState(false);
  const [customRange, setCustomRange] = useState({
    start: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchHistoricalPrices(
        selectedTimeframe, 
        selectedTimeframe === 'CUSTOM' ? customRange : undefined
      );
      setHistoricalPrices(data);
      setLoading(false);
    };
    loadData();
  }, [selectedTimeframe, customRange, setHistoricalPrices]);

  useEffect(() => {
    if (!chartContainerRef.current || !historicalPrices.length) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#8E8E8E',
        fontFamily: 'Inter, sans-serif',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.03)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.03)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        borderVisible: false,
      },
      rightPriceScale: {
        borderVisible: false,
      },
      handleScroll: true,
      handleScale: true,
    });

    const lineSeries = chart.addSeries(AreaSeries, {
      lineColor: '#F59E0B',
      topColor: 'rgba(245, 158, 11, 0.2)',
      bottomColor: 'rgba(245, 158, 11, 0.0)',
      lineWidth: 3,
      priceLineVisible: false,
      crosshairMarkerVisible: true,
    });

    lineSeries.setData(historicalPrices);
    chart.timeScale().fitContent();
    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [historicalPrices]);

  return (
    <div className="glass p-8 rounded-3xl border-white/5 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full -ml-32 -mt-32 blur-3xl" />
      
      {loading && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-md z-20 flex items-center justify-center rounded-3xl">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 animate-pulse">Syncing Market...</span>
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 relative z-10">
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 mb-3">Market Performance</h3>
          <div className="flex items-baseline gap-4">
            <span className="text-4xl font-black text-white tracking-tighter text-shadow-glow">${historicalPrices[historicalPrices.length - 1]?.value.toLocaleString()}</span>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[11px] font-black">
              <span>+12.45</span>
              <span className="opacity-60">(0.52%)</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-4">
          <div className="flex items-center gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/5 overflow-x-auto max-w-full backdrop-blur-xl">
            {['1D', '1W', '1M', '1Y', 'ALL', 'CUSTOM'].map(t => (
              <button 
                key={t} 
                onClick={() => setSelectedTimeframe(t)}
                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedTimeframe === t ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
              >
                {t}
              </button>
            ))}
          </div>

          {selectedTimeframe === 'CUSTOM' && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2 shadow-2xl backdrop-blur-xl">
                <Calendar size={14} className="text-amber-500" />
                <input 
                  type="date" 
                  value={customRange.start}
                  onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                  className="text-[10px] font-bold text-white outline-none bg-transparent [color-scheme:dark]"
                />
                <span className="text-zinc-600 text-[10px] font-black uppercase">to</span>
                <input 
                  type="date" 
                  value={customRange.end}
                  onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                  className="text-[10px] font-bold text-white outline-none bg-transparent [color-scheme:dark]"
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full relative z-10" />
    </div>
  );
}
