import WebSocket from 'ws';
import { EventEmitter } from 'events';
import type { LoadTestOptions, LoadTestMetrics } from './types.js';

interface ConnectionState {
  ws: WebSocket;
  connectTime: number;
  messagesSent: number;
  messagesReceived: number;
  latencies: number[];
  lastSentAt: number;
}

export class LoadTester extends EventEmitter {
  private options: LoadTestOptions;
  private connections: ConnectionState[] = [];
  private errors: string[] = [];
  private running = false;

  constructor(options: LoadTestOptions) {
    super();
    this.options = {
      messageInterval: 1000,
      message: '{"type":"ping","timestamp":${Date.now()}}',
      ...options,
    };
  }

  async run(): Promise<LoadTestMetrics> {
    this.running = true;
    this.connections = [];
    this.errors = [];

    const startTime = Date.now();
    let successfulConnections = 0;
    let failedConnections = 0;
    const connectionTimes: number[] = [];

    this.emit('phase', 'connecting');

    // Spawn connections in batches of 50
    const batchSize = 50;
    for (let i = 0; i < this.options.connections; i += batchSize) {
      if (!this.running) break;

      const batch = Math.min(batchSize, this.options.connections - i);
      const promises = Array.from({ length: batch }, (_, j) =>
        this.createConnection(i + j)
      );

      const results = await Promise.allSettled(promises);

      for (const result of results) {
        if (result.status === 'fulfilled') {
          successfulConnections++;
          connectionTimes.push(result.value.connectTime);
          this.connections.push(result.value);
        } else {
          failedConnections++;
          this.errors.push(result.reason?.message ?? 'Connection failed');
        }
      }

      this.emit('connections_progress', {
        current: Math.min(i + batch, this.options.connections),
        total: this.options.connections,
        successful: successfulConnections,
        failed: failedConnections,
      });
    }

    this.emit('phase', 'sending');

    // Send messages for the specified duration
    const sendInterval = this.options.messageInterval!;
    const endTime = startTime + this.options.duration * 1000;

    while (this.running && Date.now() < endTime) {
      for (const conn of this.connections) {
        if (conn.ws.readyState === WebSocket.OPEN) {
          try {
            const msg = this.options.message!.replace(
              '${Date.now()}',
              Date.now().toString()
            );
            conn.lastSentAt = Date.now();
            conn.ws.send(msg);
            conn.messagesSent++;
          } catch (err: unknown) {
            this.errors.push((err as Error).message);
          }
        }
      }

      this.emit('send_progress', {
        elapsed: Date.now() - startTime,
        duration: this.options.duration * 1000,
        activeConnections: this.connections.filter(
          (c) => c.ws.readyState === WebSocket.OPEN
        ).length,
      });

      await new Promise((r) => setTimeout(r, sendInterval));
    }

    this.emit('phase', 'closing');

    // Close all connections
    await Promise.allSettled(
      this.connections.map(
        (conn) =>
          new Promise<void>((resolve) => {
            if (conn.ws.readyState === WebSocket.OPEN) {
              conn.ws.on('close', () => resolve());
              conn.ws.close(1000);
            } else {
              resolve();
            }
          })
      )
    );

    const durationMs = Date.now() - startTime;
    const allLatencies = this.connections.flatMap((c) => c.latencies);
    const totalSent = this.connections.reduce((s, c) => s + c.messagesSent, 0);
    const totalReceived = this.connections.reduce(
      (s, c) => s + c.messagesReceived,
      0
    );

    const metrics: LoadTestMetrics = {
      totalConnections: this.options.connections,
      successfulConnections,
      failedConnections,
      totalMessagesSent: totalSent,
      totalMessagesReceived: totalReceived,
      avgConnectionTimeMs: avg(connectionTimes),
      minConnectionTimeMs: connectionTimes.length ? Math.min(...connectionTimes) : 0,
      maxConnectionTimeMs: connectionTimes.length ? Math.max(...connectionTimes) : 0,
      avgLatencyMs: avg(allLatencies),
      minLatencyMs: allLatencies.length ? Math.min(...allLatencies) : 0,
      maxLatencyMs: allLatencies.length ? Math.max(...allLatencies) : 0,
      errorsCount: this.errors.length,
      errors: [...new Set(this.errors)].slice(0, 20),
      durationMs,
      messagesPerSecond: totalSent / (durationMs / 1000),
    };

    this.running = false;
    this.emit('done', metrics);
    return metrics;
  }

  stop(): void {
    this.running = false;
    for (const conn of this.connections) {
      try {
        conn.ws.terminate();
      } catch {
        // ignore
      }
    }
  }

  private createConnection(index: number): Promise<ConnectionState> {
    return new Promise((resolve, reject) => {
      const start = Date.now();

      const ws = new WebSocket(this.options.url, {
        headers: this.options.headers,
        handshakeTimeout: 10000,
      });

      const state: ConnectionState = {
        ws,
        connectTime: 0,
        messagesSent: 0,
        messagesReceived: 0,
        latencies: [],
        lastSentAt: 0,
      };

      const timeout = setTimeout(() => {
        ws.terminate();
        reject(new Error(`Connection ${index} timed out`));
      }, 10000);

      ws.on('open', () => {
        clearTimeout(timeout);
        state.connectTime = Date.now() - start;
        resolve(state);
      });

      ws.on('message', () => {
        state.messagesReceived++;
        if (state.lastSentAt > 0) {
          state.latencies.push(Date.now() - state.lastSentAt);
        }
      });

      ws.on('error', (err) => {
        clearTimeout(timeout);
        if (ws.readyState === WebSocket.CONNECTING) {
          reject(err);
        } else {
          this.errors.push(err.message);
        }
      });
    });
  }
}

function avg(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
