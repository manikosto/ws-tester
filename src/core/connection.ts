import WebSocket from 'ws';
import { EventEmitter } from 'events';
import type { ConnectionOptions, MessageHandler, ErrorHandler, CloseHandler } from './types.js';

export class WebSocketManager extends EventEmitter {
  private ws: WebSocket | null = null;
  private options: ConnectionOptions;
  private reconnectAttempts = 0;
  private isClosedManually = false;

  constructor(options: ConnectionOptions) {
    super();
    this.options = {
      timeout: 10000,
      reconnect: false,
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      ...options,
    };
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.isClosedManually = false;
      const startTime = Date.now();

      this.ws = new WebSocket(this.options.url, {
        headers: this.options.headers,
        handshakeTimeout: this.options.timeout,
      });

      const timeoutId = setTimeout(() => {
        if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
          this.ws.terminate();
          reject(new Error(`Connection timeout after ${this.options.timeout}ms`));
        }
      }, this.options.timeout!);

      this.ws.on('open', () => {
        clearTimeout(timeoutId);
        this.reconnectAttempts = 0;
        const connectionTime = Date.now() - startTime;
        this.emit('connected', { connectionTime });
        resolve();
      });

      this.ws.on('message', (data: WebSocket.RawData) => {
        const message = data.toString();
        this.emit('message', message);
      });

      this.ws.on('error', (error: Error) => {
        clearTimeout(timeoutId);
        this.emit('error', error);
        if (this.ws?.readyState === WebSocket.CONNECTING) {
          reject(error);
        }
      });

      this.ws.on('close', (code: number, reason: Buffer) => {
        clearTimeout(timeoutId);
        this.emit('close', code, reason.toString());
        if (!this.isClosedManually && this.options.reconnect) {
          this.attemptReconnect();
        }
      });
    });
  }

  send(data: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }
    this.ws.send(data);
    this.emit('sent', data);
  }

  async disconnect(): Promise<void> {
    this.isClosedManually = true;
    return new Promise((resolve) => {
      if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
        resolve();
        return;
      }
      this.ws.on('close', () => resolve());
      this.ws.close(1000, 'Client disconnect');
    });
  }

  get connected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  get readyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }

  onMessage(handler: MessageHandler): void {
    this.on('message', handler);
  }

  onError(handler: ErrorHandler): void {
    this.on('error', handler);
  }

  onClose(handler: CloseHandler): void {
    this.on('close', handler);
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= (this.options.maxReconnectAttempts ?? 5)) {
      this.emit('reconnect_failed');
      return;
    }
    this.reconnectAttempts++;
    this.emit('reconnecting', this.reconnectAttempts);
    setTimeout(() => {
      this.connect().catch((err) => {
        this.emit('error', err);
      });
    }, this.options.reconnectInterval);
  }
}
