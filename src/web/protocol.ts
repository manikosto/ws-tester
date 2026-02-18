import type { WebSocketManager } from '../core/connection.js';
import type { SessionRecorder } from '../core/recorder.js';

export interface WsEnvelope {
  type:
    | 'message'
    | 'sent'
    | 'error'
    | 'close'
    | 'connected'
    | 'disconnected'
    | 'loadtest_progress'
    | 'loadtest_done'
    | 'recording_message'
    | 'sessions_list';
  sessionId?: string;
  payload: unknown;
  timestamp: number;
}

export interface SessionState {
  id: string;
  manager: WebSocketManager;
  recorder: SessionRecorder | null;
  url: string;
  connectedAt: number;
}

export interface ConnectRequest {
  url: string;
  headers?: Record<string, string>;
  timeout?: number;
  reconnect?: boolean;
}

export interface SendRequest {
  sessionId: string;
  message: string;
}

export interface LoadTestRequest {
  url: string;
  connections: number;
  duration: number;
  message?: string;
  messageInterval?: number;
  headers?: Record<string, string>;
}

export interface ValidateRequest {
  schema: object;
  data: string;
}

export interface RecordRequest {
  sessionId: string;
}

export interface ReplayRequest {
  sessionId: string;
  recording: {
    url: string;
    startedAt: string;
    endedAt: string;
    messages: Array<{
      direction: 'sent' | 'received';
      data: string;
      timestamp: number;
      deltaMs: number;
    }>;
  };
}
