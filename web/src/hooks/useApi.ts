import type { LoadTestMetrics, SchemaValidationResult, SessionRecording } from '../types';

const BASE = '/api';

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data as T;
}

export function useApi() {
  return {
    connect: (url: string, opts?: { headers?: Record<string, string>; pingInterval?: number }) =>
      post<{ sessionId: string; status: string; url: string }>('/connect', { url, ...opts }),

    disconnect: (sessionId: string) =>
      post<{ status: string }>('/disconnect', { sessionId }),

    send: (sessionId: string, message: string) =>
      post<{ status: string }>('/send', { sessionId, message }),

    loadTest: (opts: { url: string; connections: number; duration: number; message?: string; messageInterval?: number }) =>
      post<LoadTestMetrics>('/loadtest', opts),

    validate: (schema: string, data: string) =>
      post<SchemaValidationResult>('/validate', { schema: JSON.parse(schema), data }),

    startRecording: (sessionId: string) =>
      post<{ status: string }>('/record/start', { sessionId }),

    stopRecording: (sessionId: string) =>
      post<SessionRecording>('/record/stop', { sessionId }),

    replay: (sessionId: string, recording: SessionRecording) =>
      post<{ replayed: number; skipped: number }>('/replay', { sessionId, recording }),
  };
}
