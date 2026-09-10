import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

try {
  const devEnvPath = path.resolve('/app/.dev.env.json');
  if (fs.existsSync(devEnvPath)) {
    const raw = JSON.parse(fs.readFileSync(devEnvPath, 'utf8'));
    for (const [k, v] of Object.entries(raw)) {
      if (!process.env[k] && typeof v === 'string') {
        process.env[k] = v;
      }
    }
  }
} catch (_) {}

import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import app from './app.js';
import { ensureDbSchema } from './src/lib/prisma.js';

const PORT = 3000;

async function startServer() {
  await ensureDbSchema().catch((e) => {
    console.warn('[Startup] Database schema check notice:', e?.message || e);
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n============================================================`);
    console.log(`🚀 E-Commerce Server running on http://0.0.0.0:${PORT}`);
    console.log(`============================================================\n`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
