export interface ConnectionOptions {
  url: string;
  headers?: Record<string, string>;
  timeout?: number;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export interface RecordedMessage {
  direction: 'sent' | 'received';
  data: string;
  timestamp: number;
  deltaMs: number;
}

export interface SessionRecording {
  url: string;
  startedAt: string;
  endedAt: string;
  messages: RecordedMessage[];
  metadata?: Record<string, unknown>;
}

export interface LoadTestOptions {
  url: string;
  connections: number;
  duration: number;
  messageInterval?: number;
  message?: string;
  headers?: Record<string, string>;
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

export interface SchemaValidationResult {
  valid: boolean;
  errors: SchemaError[];
}

export interface SchemaError {
  path: string;
  message: string;
  keyword: string;
}

export type MessageHandler = (data: string) => void;
export type ErrorHandler = (error: Error) => void;
export type CloseHandler = (code: number, reason: string) => void;
