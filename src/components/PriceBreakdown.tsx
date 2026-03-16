import useStore from '../store/useStore';

export default function PriceBreakdown() {
  const { getGoldPrices, selectedCity, selectedCurrency } = useStore();
  const prices = getGoldPrices();

  const currencySymbols: Record<string, string> = {
    PKR: 'Rs.',
    USD: '$',
    EUR: '€',
    GBP: '£',
    AED: 'AED',
    SAR: 'SR',
    INR: '₹'
  };

  const symbol = currencySymbols[selectedCurrency] || selectedCurrency;

  const units = [
    { name: 'Tola', key: 'tola' },
    { name: '10 Gram', key: 'tenGram' },
    { name: '1 Gram', key: 'gram' },
    { name: 'Ounce', key: 'ounce' },
    { name: 'Kilogram', key: 'kilogram' },
  ];

  return (
    <div className="glass rounded-3xl overflow-hidden border-black/5 relative group">
      <div className="bg-black/5 px-8 py-5 border-b border-black/5 flex justify-between items-center backdrop-blur-2xl">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900">Regional Physical Rates ({selectedCity})</h3>
        <span className="text-[9px] font-black text-amber-600 italic tracking-[0.2em] uppercase">{selectedCurrency} Base</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black/5 bg-black/5">
              <th className="px-8 py-4 text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">Denomination</th>
              <th className="px-8 py-4 text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] text-right">24K Investment</th>
              <th className="px-8 py-4 text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] text-right">22K Jewelry</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {units.map((unit) => (
              <tr key={unit.key} className="hover:bg-black/5 transition-all group">
                <td className="px-8 py-4 text-[12px] font-bold text-zinc-600 group-hover:text-zinc-900 transition-colors">{unit.name}</td>
                <td className="px-8 py-4 text-[13px] font-black text-zinc-900 text-right tracking-tight">
                  <span className="text-amber-600 mr-1.5 text-[10px]">{symbol}</span>
                  {prices.gold24[unit.key as keyof typeof prices.gold24].toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </td>
                <td className="px-8 py-4 text-[12px] font-bold text-zinc-500 text-right tracking-tight group-hover:text-zinc-600 transition-colors">
                  <span className="mr-1.5 text-[10px]">{symbol}</span>
                  {prices.gold22[unit.key as keyof typeof prices.gold22].toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
