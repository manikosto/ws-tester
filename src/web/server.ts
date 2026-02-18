import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import { SessionManager } from './session-manager.js';
import { createApiRouter } from './api.js';
import type { WsEnvelope } from './protocol.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function startServer(port: number): http.Server {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  const sessionManager = new SessionManager();
  const browserClients = new Set<WebSocket>();

  function broadcast(envelope: WsEnvelope) {
    const data = JSON.stringify(envelope);
    for (const client of browserClients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    }
  }

  // Mount API routes
  const apiRouter = createApiRouter(sessionManager, broadcast);
  app.use('/api', apiRouter);

  // Serve frontend in production
  const webDist = path.resolve(__dirname, '../../web/dist');
  app.use(express.static(webDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(webDist, 'index.html'));
  });

  const server = http.createServer(app);

  // WebSocket servers (noServer mode for path-based routing)
  const wss = new WebSocketServer({ noServer: true });
  const echoWss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const url = request.url ?? '';
    if (url === '/api/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else if (url === '/api/echo') {
      echoWss.handleUpgrade(request, socket, head, (ws) => {
        echoWss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  // Browser relay WebSocket
  wss.on('connection', (ws) => {
    browserClients.add(ws);

    // Send current sessions on connect
    const sessions = sessionManager.listSessions();
    ws.send(
      JSON.stringify({
        type: 'sessions_list',
        payload: sessions,
        timestamp: Date.now(),
      } satisfies WsEnvelope)
    );

    ws.on('close', () => {
      browserClients.delete(ws);
    });
  });

  // Built-in echo server for demo/testing
  echoWss.on('connection', (ws) => {
    ws.on('message', (data) => {
      const msg = data.toString();
      try {
        const parsed = JSON.parse(msg);
        ws.send(JSON.stringify({ echo: true, original: parsed, timestamp: Date.now() }));
      } catch {
        ws.send(`echo: ${msg}`);
      }
    });
  });

  server.listen(port, () => {
    console.log(`\n  ws-tester web dashboard`);
    console.log(`  http://localhost:${port}\n`);
  });

  return server;
}
