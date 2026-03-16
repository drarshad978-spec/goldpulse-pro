import useStore from '../store/useStore';
import { MapPin, ChevronDown } from 'lucide-react';

export default function CitySelector() {
  const { selectedCity, setSelectedCity, cityPremiums } = useStore();
  
  return (
    <div className="flex items-center gap-4 glass px-6 py-3 rounded-2xl border-black/5 hover:border-black/10 transition-all group backdrop-blur-3xl shadow-2xl">
      <MapPin size={18} className="text-amber-500 group-hover:scale-125 transition-transform shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
      <div className="h-4 w-[1px] bg-black/10" />
      <div className="relative flex items-center">
        <select 
          value={selectedCity} 
          onChange={(e) => setSelectedCity(e.target.value)}
          className="appearance-none bg-transparent pr-8 text-[11px] font-black text-black uppercase tracking-[0.2em] outline-none cursor-pointer"
        >
          {Object.keys(cityPremiums).map(city => (
            <option key={city} value={city} className="bg-white">{city}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none group-hover:text-black transition-colors" size={14} />
      </div>
    </div>
  );
}
