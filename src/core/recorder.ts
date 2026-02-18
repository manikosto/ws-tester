import { writeFile } from 'fs/promises';
import type { RecordedMessage, SessionRecording } from './types.js';
import { WebSocketManager } from './connection.js';

export class SessionRecorder {
  private messages: RecordedMessage[] = [];
  private startTime = 0;
  private lastTimestamp = 0;
  private recording = false;
  private manager: WebSocketManager;
  private url: string;

  constructor(manager: WebSocketManager, url: string) {
    this.manager = manager;
    this.url = url;
  }

  start(): void {
    if (this.recording) return;
    this.recording = true;
    this.startTime = Date.now();
    this.lastTimestamp = this.startTime;
    this.messages = [];

    this.manager.on('message', this.onMessage);
    this.manager.on('sent', this.onSent);
  }

  stop(): SessionRecording {
    this.recording = false;
    this.manager.off('message', this.onMessage);
    this.manager.off('sent', this.onSent);

    return {
      url: this.url,
      startedAt: new Date(this.startTime).toISOString(),
      endedAt: new Date().toISOString(),
      messages: this.messages,
    };
  }

  async save(filePath: string): Promise<SessionRecording> {
    const recording = this.stop();
    await writeFile(filePath, JSON.stringify(recording, null, 2), 'utf-8');
    return recording;
  }

  get isRecording(): boolean {
    return this.recording;
  }

  get messageCount(): number {
    return this.messages.length;
  }

  private onMessage = (data: string): void => {
    this.addMessage('received', data);
  };

  private onSent = (data: string): void => {
    this.addMessage('sent', data);
  };

  private addMessage(direction: 'sent' | 'received', data: string): void {
    const now = Date.now();
    this.messages.push({
      direction,
      data,
      timestamp: now,
      deltaMs: now - this.lastTimestamp,
    });
    this.lastTimestamp = now;
  }
}
