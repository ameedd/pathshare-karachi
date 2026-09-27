import 'dotenv/config';
import path from 'path';
import express from 'express';
import { app } from './api/index';

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
    console.log(\n======================================================);
    console.log(🚗 PathShare Server running on: http://localhost: + PORT);
    console.log(⚠️  Note: Use plain http:// (NOT https://) in your browser);
    console.log(======================================================\n);
  });

  server.on('clientError', (err, socket) => {
    if (err.code === 'HPE_INVALID_METHOD' || err.message?.includes('Parse Error')) {
      if (socket.writable) {
        socket.end('HTTP/1.1 400 Bad Request\r\nContent-Type: text/plain\r\nConnection: close\r\n\r\nPathShare server is running on plain HTTP. Please open: http://localhost:3000\r\n');
      }
      return;
    }
    if (socket.writable) {
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    }
  });
}

if (!process.env.VERCEL) {
  start();
}

export default app;
