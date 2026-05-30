import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.FINNHUB_API_KEY': JSON.stringify(env.FINNHUB_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        '/api/proxy/metals': {
          target: 'https://api.gold-api.com/price',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/proxy\/metals/, ''),
        },
        '/api/proxy/exchange': {
          target: 'https://open.er-api.com/v6/latest/USD',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/proxy\/exchange/, ''),
        },
      },
    },
  };
});
