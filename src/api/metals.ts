export async function fetchSilverPrice() {
  try {
    const res = await fetch('/api/proxy/metals/XAG');
    if (res.ok) {
      const data = await res.json();
      if (data && data.price) return data.price;
    }
  } catch (error) {
    console.error('API fetch for silver failed, trying cached server AI fallback:', error);
  }

  try {
    const res = await fetch('/api/proxy/ai-price/silver');
    if (res.ok) {
      const data = await res.json();
      const price = parseFloat(data.price);
      if (!isNaN(price)) return price;
    }
  } catch (aiError) {
    console.error('AI check for silver failed:', aiError);
  }
  
  return 23.5; 
}

export async function fetchGoldPriceFallback() {
  try {
    const res = await fetch('/api/proxy/metals/XAU');
    if (res.ok) {
      const data = await res.json();
      if (data && data.price) return data.price;
    }
  } catch (error) {
    console.error('API fetch for gold failed, trying cached server AI fallback:', error);
  }

  try {
    const res = await fetch('/api/proxy/ai-price/gold');
    if (res.ok) {
      const data = await res.json();
      const price = parseFloat(data.price);
      if (!isNaN(price)) return price;
    }
  } catch (aiError) {
    console.error('AI check for gold failed:', aiError);
  }

  return 2000;
}
