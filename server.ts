import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API Proxy Routes to avoid CORS
  app.get("/api/proxy/metals/:symbol", async (req, res) => {
    const { symbol } = req.params;
    try {
      const response = await fetch(`https://api.gold-api.com/price/${symbol}`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error(`Proxy error for ${symbol}:`, error);
      res.status(500).json({ error: "Failed to fetch from upstream" });
    }
  });

  app.get("/api/proxy/exchange", async (req, res) => {
    try {
      const response = await fetch('https://open.er-api.com/v6/latest/USD');
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Proxy error for exchange rates:", error);
      res.status(500).json({ error: "Failed to fetch from upstream" });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
