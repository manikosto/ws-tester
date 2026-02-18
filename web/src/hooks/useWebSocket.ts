import { useEffect, useRef } from 'react';
import type { Dispatch } from 'react';
import type { AppAction } from '../context/AppContext';
import type { WsEnvelope } from '../types';

export function useBackendWebSocket(dispatch: Dispatch<AppAction>) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let reconnectTimer: ReturnType<typeof setTimeout>;
    let alive = true;

    function connect() {
      if (!alive) return;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/api/ws`);
      wsRef.current = ws;

      ws.onopen = () => {
        dispatch({ type: 'SET_BACKEND_CONNECTED', payload: true });
      };

      ws.onclose = () => {
        dispatch({ type: 'SET_BACKEND_CONNECTED', payload: false });
        if (alive) {
          reconnectTimer = setTimeout(connect, 2000);
        }
      };

      ws.onerror = () => {
        // onclose will fire after this
      };

      ws.onmessage = (event) => {
        try {
          const envelope = JSON.parse(event.data) as WsEnvelope;

          switch (envelope.type) {
            case 'message':
              dispatch({
                type: 'MESSAGE_RECEIVED',
                payload: { data: envelope.payload as string, timestamp: envelope.timestamp },
              });
              break;

            case 'sent':
              dispatch({
                type: 'MESSAGE_SENT',
                payload: { data: envelope.payload as string, timestamp: envelope.timestamp },
              });
              break;

            case 'error':
              dispatch({
                type: 'SYSTEM_MESSAGE',
                payload: `Error: ${envelope.payload}`,
              });
              break;

            case 'close': {
              const p = envelope.payload as { code: number; reason: string };
              dispatch({
                type: 'SYSTEM_MESSAGE',
                payload: `Connection closed (code: ${p.code}${p.reason ? ', reason: ' + p.reason : ''})`,
              });
              dispatch({ type: 'DISCONNECTED' });
              break;
            }

            case 'loadtest_progress':
              dispatch({
                type: 'LOADTEST_PROGRESS',
                payload: envelope.payload as { phase?: string; event?: string },
              });
              break;

            case 'loadtest_done':
              dispatch({
                type: 'LOADTEST_DONE',
                payload: envelope.payload as AppAction extends { type: 'LOADTEST_DONE'; payload: infer P } ? P : never,
              });
              break;
          }
        } catch {
          // ignore malformed messages
        }
      };
    }

    connect();

    return () => {
      alive = false;
      clearTimeout(reconnectTimer);
      wsRef.current?.close();
    };
  }, [dispatch]);
}
