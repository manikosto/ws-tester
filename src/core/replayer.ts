import { readFile } from 'fs/promises';
import type { SessionRecording, RecordedMessage } from './types.js';
import { WebSocketManager } from './connection.js';

export class SessionReplayer {
  private manager: WebSocketManager;
  private aborted = false;

  constructor(manager: WebSocketManager) {
    this.manager = manager;
  }

  async loadRecording(filePath: string): Promise<SessionRecording> {
    const content = await readFile(filePath, 'utf-8');
    return JSON.parse(content) as SessionRecording;
  }

  async replay(
    recording: SessionRecording,
    onMessage?: (msg: RecordedMessage, index: number) => void
  ): Promise<{ replayed: number; skipped: number }> {
    this.aborted = false;
    let replayed = 0;
    let skipped = 0;

    for (let i = 0; i < recording.messages.length; i++) {
      if (this.aborted) break;

      const msg = recording.messages[i];

      if (msg.deltaMs > 0) {
        await this.delay(msg.deltaMs);
      }

      if (this.aborted) break;

      if (msg.direction === 'sent') {
        try {
          this.manager.send(msg.data);
          replayed++;
          onMessage?.(msg, i);
        } catch {
          skipped++;
        }
      } else {
        skipped++;
        onMessage?.(msg, i);
      }
    }

    return { replayed, skipped };
  }

  abort(): void {
    this.aborted = true;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
