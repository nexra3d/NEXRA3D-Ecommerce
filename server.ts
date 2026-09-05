import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import app from './app.js';
import { runStartupSecurityAudit } from './src/lib/securityAudit.js';

const PORT = 3000;

async function startServer() {
  // Trust proxy for secure headers, HTTPS detection, and client IP extraction behind reverse proxies
  app.set('trust proxy', 1);

  // Run startup deployment security checks
  runStartupSecurityAudit();

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
    console.log(`🚀 Secure E-Commerce Server running on http://0.0.0.0:${PORT}`);
    console.log(`🔒 HTTPS enforcement, Security Headers & Threat Monitoring active`);
    console.log(`============================================================\n`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
