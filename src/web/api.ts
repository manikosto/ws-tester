import { Router, type Request, type Response } from 'express';
import { WebSocketManager } from '../core/connection.js';
import { SessionReplayer } from '../core/replayer.js';
import { LoadTester } from '../core/load-tester.js';
import { SchemaValidator } from '../core/schema-validator.js';
import { SessionManager } from './session-manager.js';
import type {
  WsEnvelope,
  ConnectRequest,
  SendRequest,
  LoadTestRequest,
  ValidateRequest,
  RecordRequest,
  ReplayRequest,
} from './protocol.js';

export function createApiRouter(
  sessionManager: SessionManager,
  broadcast: (envelope: WsEnvelope) => void,
  serverPort?: number
): Router {
  const router = Router();

  /** Rewrite own echo endpoint to localhost to avoid hairpin NAT issues in containers */
  function rewriteEchoUrl(url: string, req: Request): string {
    try {
      const parsed = new URL(url);
      if (parsed.pathname === '/api/echo' || parsed.pathname === '/api/echo/') {
        const host = req.get('host') ?? '';
        const isSelf = parsed.host === host
          || parsed.hostname === 'localhost'
          || parsed.hostname === '127.0.0.1';
        if (isSelf) {
          const port = serverPort ?? parseInt(host.split(':')[1] || '3456', 10);
          return `ws://127.0.0.1:${port}/api/echo`;
        }
      }
    } catch { /* invalid URL — let caller handle it */ }
    return url;
  }

  // --- Connect ---
  router.post('/connect', async (req: Request, res: Response) => {
    const body = req.body as ConnectRequest;
    if (!body.url) {
      res.status(400).json({ error: 'url is required' });
      return;
    }

    const connectUrl = rewriteEchoUrl(body.url, req);

    try {
      const manager = new WebSocketManager({
        url: connectUrl,
        headers: body.headers,
        timeout: body.timeout ?? 10000,
        reconnect: body.reconnect ?? false,
        pingInterval: body.pingInterval,
      });

      await manager.connect();
      const session = sessionManager.createSession(manager, body.url);

      // Wire up real-time relay to browser
      manager.onMessage((data) => {
        broadcast({
          type: 'message',
          sessionId: session.id,
          payload: data,
          timestamp: Date.now(),
        });
      });

      manager.on('sent', (data: string) => {
        broadcast({
          type: 'sent',
          sessionId: session.id,
          payload: data,
          timestamp: Date.now(),
        });
      });

      manager.onError((err) => {
        broadcast({
          type: 'error',
          sessionId: session.id,
          payload: err.message,
          timestamp: Date.now(),
        });
      });

      manager.onClose((code, reason) => {
        broadcast({
          type: 'close',
          sessionId: session.id,
          payload: { code, reason },
          timestamp: Date.now(),
        });
      });

      res.json({ sessionId: session.id, status: 'connected', url: body.url });
    } catch (err: unknown) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // --- Disconnect ---
  router.post('/disconnect', async (req: Request, res: Response) => {
    const { sessionId } = req.body as { sessionId: string };
    const session = sessionManager.getSession(sessionId);
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    try {
      await session.manager.disconnect();
      sessionManager.destroySession(sessionId);
      res.json({ status: 'disconnected' });
    } catch (err: unknown) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // --- Send ---
  router.post('/send', (req: Request, res: Response) => {
    const body = req.body as SendRequest;
    const session = sessionManager.getSession(body.sessionId);
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    try {
      session.manager.send(body.message);
      res.json({ status: 'sent' });
    } catch (err: unknown) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // --- Load Test ---
  router.post('/loadtest', async (req: Request, res: Response) => {
    const body = req.body as LoadTestRequest;
    if (!body.url || !body.connections || !body.duration) {
      res.status(400).json({ error: 'url, connections, and duration are required' });
      return;
    }

    const loadTestUrl = rewriteEchoUrl(body.url, req);

    const tester = new LoadTester({
      url: loadTestUrl,
      connections: body.connections,
      duration: body.duration,
      message: body.message,
      messageInterval: body.messageInterval,
      headers: body.headers,
    });

    tester.on('phase', (phase: string) => {
      broadcast({
        type: 'loadtest_progress',
        payload: { phase },
        timestamp: Date.now(),
      });
    });

    tester.on('connections_progress', (p: unknown) => {
      broadcast({
        type: 'loadtest_progress',
        payload: { event: 'connections_progress', ...p as object },
        timestamp: Date.now(),
      });
    });

    tester.on('send_progress', (p: unknown) => {
      broadcast({
        type: 'loadtest_progress',
        payload: { event: 'send_progress', ...p as object },
        timestamp: Date.now(),
      });
    });

    try {
      const metrics = await tester.run();
      broadcast({
        type: 'loadtest_done',
        payload: metrics,
        timestamp: Date.now(),
      });
      res.json(metrics);
    } catch (err: unknown) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // --- Validate ---
  router.post('/validate', (req: Request, res: Response) => {
    const body = req.body as ValidateRequest;
    if (!body.schema || body.data === undefined) {
      res.status(400).json({ error: 'schema and data are required' });
      return;
    }

    const validator = new SchemaValidator();
    const result = validator.validateString(body.schema, body.data);
    res.json(result);
  });

  // --- Record Start ---
  router.post('/record/start', (req: Request, res: Response) => {
    const body = req.body as RecordRequest;
    const session = sessionManager.getSession(body.sessionId);
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const recorder = sessionManager.startRecording(body.sessionId);
    if (!recorder) {
      res.status(500).json({ error: 'Failed to start recording' });
      return;
    }

    res.json({ status: 'recording' });
  });

  // --- Record Stop ---
  router.post('/record/stop', (req: Request, res: Response) => {
    const body = req.body as RecordRequest;
    const recording = sessionManager.stopRecording(body.sessionId);
    if (!recording) {
      res.status(404).json({ error: 'No active recording' });
      return;
    }

    res.json(recording);
  });

  // --- Replay ---
  router.post('/replay', async (req: Request, res: Response) => {
    const body = req.body as ReplayRequest;
    const session = sessionManager.getSession(body.sessionId);
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const replayer = new SessionReplayer(session.manager);
    try {
      const result = await replayer.replay(body.recording);
      res.json(result);
    } catch (err: unknown) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // --- List Sessions ---
  router.get('/sessions', (_req: Request, res: Response) => {
    res.json(sessionManager.listSessions());
  });

  return router;
}
