import crypto from 'crypto';
import { WebSocketManager } from '../core/connection.js';
import { SessionRecorder } from '../core/recorder.js';
import type { SessionState } from './protocol.js';

export class SessionManager {
  private sessions = new Map<string, SessionState>();

  createSession(manager: WebSocketManager, url: string): SessionState {
    const id = crypto.randomUUID().slice(0, 8);
    const session: SessionState = {
      id,
      manager,
      recorder: null,
      url,
      connectedAt: Date.now(),
    };
    this.sessions.set(id, session);
    return session;
  }

  getSession(id: string): SessionState | undefined {
    return this.sessions.get(id);
  }

  destroySession(id: string): boolean {
    const session = this.sessions.get(id);
    if (!session) return false;
    if (session.recorder?.isRecording) {
      session.recorder.stop();
    }
    session.manager.removeAllListeners();
    this.sessions.delete(id);
    return true;
  }

  listSessions(): Array<{ id: string; url: string; connected: boolean; connectedAt: number }> {
    return Array.from(this.sessions.values()).map((s) => ({
      id: s.id,
      url: s.url,
      connected: s.manager.connected,
      connectedAt: s.connectedAt,
    }));
  }

  startRecording(id: string): SessionRecorder | null {
    const session = this.sessions.get(id);
    if (!session) return null;
    const recorder = new SessionRecorder(session.manager, session.url);
    session.recorder = recorder;
    recorder.start();
    return recorder;
  }

  stopRecording(id: string) {
    const session = this.sessions.get(id);
    if (!session?.recorder?.isRecording) return null;
    const recording = session.recorder.stop();
    session.recorder = null;
    return recording;
  }

  get size(): number {
    return this.sessions.size;
  }
}
