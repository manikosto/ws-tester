export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface LogEntry {
  id: string;
  direction: 'sent' | 'received' | 'system';
  data: string;
  timestamp: number;
}

export interface LoadTestMetrics {
  totalConnections: number;
  successfulConnections: number;
  failedConnections: number;
  totalMessagesSent: number;
  totalMessagesReceived: number;
  avgConnectionTimeMs: number;
  minConnectionTimeMs: number;
  maxConnectionTimeMs: number;
  avgLatencyMs: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  errorsCount: number;
  errors: string[];
  durationMs: number;
  messagesPerSecond: number;
}

export interface SessionRecording {
  url: string;
  startedAt: string;
  endedAt: string;
  messages: Array<{
    direction: 'sent' | 'received';
    data: string;
    timestamp: number;
    deltaMs: number;
  }>;
}

export interface SchemaValidationResult {
  valid: boolean;
  errors: Array<{
    path: string;
    message: string;
    keyword: string;
  }>;
}

export interface WsEnvelope {
  type: string;
  sessionId?: string;
  payload: unknown;
  timestamp: number;
}
