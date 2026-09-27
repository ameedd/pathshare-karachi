import 'dotenv/config';
import path from 'path';
import express from 'express';
import app from './api/index';

const PORT = Number(process.env.PORT) || 3000;

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vitePackage = 'vite';
    const { createServer: createViteServer } = await import(/* @vite-ignore */ vitePackage);
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('PathShare Server running on http://localhost:' + PORT);
  });
}

if (!process.env.VERCEL) {
  start();
}

export default app;
