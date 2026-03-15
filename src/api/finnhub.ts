const WEBSOCKET_URL = 'wss://ws.finnhub.io?token=';

export function connectGoldWebSocket(apiKey: string, onPriceUpdate: (price: number) => void) {
  const socket = new WebSocket(WEBSOCKET_URL + apiKey);

  socket.onopen = () => {
    socket.send(JSON.stringify({ type: 'subscribe', symbol: 'OANDA:XAU_USD' }));
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'trade' && data.data && data.data.length > 0) {
      const price = data.data[0].p;
      onPriceUpdate(price);
    }
  };

  socket.onerror = (err) => {
    console.error('WebSocket error', err);
  };

  return socket;
}
