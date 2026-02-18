import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react';
import type { ConnectionStatus, LogEntry, LoadTestMetrics, SchemaValidationResult, SessionRecording } from '../types';

export interface AppState {
  sessionId: string | null;
  url: string;
  connectionStatus: ConnectionStatus;
  messages: LogEntry[];
  loadTest: {
    running: boolean;
    phase: string;
    progress: string;
    metrics: LoadTestMetrics | null;
  };
  lastValidation: SchemaValidationResult | null;
  recording: {
    active: boolean;
    messageCount: number;
  };
  lastRecording: SessionRecording | null;
  backendConnected: boolean;
}

export type AppAction =
  | { type: 'SET_URL'; payload: string }
  | { type: 'CONNECTING' }
  | { type: 'CONNECTED'; payload: { sessionId: string; url: string } }
  | { type: 'DISCONNECTED' }
  | { type: 'CONNECTION_ERROR'; payload: string }
  | { type: 'MESSAGE_RECEIVED'; payload: { data: string; timestamp: number } }
  | { type: 'MESSAGE_SENT'; payload: { data: string; timestamp: number } }
  | { type: 'SYSTEM_MESSAGE'; payload: string }
  | { type: 'CLEAR_LOG' }
  | { type: 'LOADTEST_START' }
  | { type: 'LOADTEST_PROGRESS'; payload: { phase?: string; event?: string; [key: string]: unknown } }
  | { type: 'LOADTEST_DONE'; payload: LoadTestMetrics }
  | { type: 'VALIDATION_RESULT'; payload: SchemaValidationResult }
  | { type: 'RECORDING_STARTED' }
  | { type: 'RECORDING_STOPPED'; payload: SessionRecording }
  | { type: 'SET_BACKEND_CONNECTED'; payload: boolean };

const initialState: AppState = {
  sessionId: null,
  url: typeof window !== 'undefined'
    ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/api/echo`
    : 'ws://localhost:3456/api/echo',
  connectionStatus: 'disconnected',
  messages: [],
  loadTest: {
    running: false,
    phase: '',
    progress: '',
    metrics: null,
  },
  lastValidation: null,
  recording: { active: false, messageCount: 0 },
  lastRecording: null,
  backendConnected: false,
};

let msgCounter = 0;

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_URL':
      return { ...state, url: action.payload };

    case 'CONNECTING':
      return { ...state, connectionStatus: 'connecting' };

    case 'CONNECTED':
      return {
        ...state,
        connectionStatus: 'connected',
        sessionId: action.payload.sessionId,
        url: action.payload.url,
        messages: [
          ...state.messages,
          { id: String(++msgCounter), direction: 'system', data: `Connected to ${action.payload.url}`, timestamp: Date.now() },
        ],
      };

    case 'DISCONNECTED':
      return {
        ...state,
        connectionStatus: 'disconnected',
        sessionId: null,
        recording: { active: false, messageCount: 0 },
        messages: [
          ...state.messages,
          { id: String(++msgCounter), direction: 'system', data: 'Disconnected', timestamp: Date.now() },
        ],
      };

    case 'CONNECTION_ERROR':
      return {
        ...state,
        connectionStatus: 'error',
        messages: [
          ...state.messages,
          { id: String(++msgCounter), direction: 'system', data: `Error: ${action.payload}`, timestamp: Date.now() },
        ],
      };

    case 'MESSAGE_RECEIVED':
      return {
        ...state,
        messages: [
          ...state.messages,
          { id: String(++msgCounter), direction: 'received' as const, data: action.payload.data, timestamp: action.payload.timestamp },
        ].slice(-1000),
        recording: state.recording.active
          ? { ...state.recording, messageCount: state.recording.messageCount + 1 }
          : state.recording,
      };

    case 'MESSAGE_SENT':
      return {
        ...state,
        messages: [
          ...state.messages,
          { id: String(++msgCounter), direction: 'sent' as const, data: action.payload.data, timestamp: action.payload.timestamp },
        ].slice(-1000),
        recording: state.recording.active
          ? { ...state.recording, messageCount: state.recording.messageCount + 1 }
          : state.recording,
      };

    case 'SYSTEM_MESSAGE':
      return {
        ...state,
        messages: [
          ...state.messages,
          { id: String(++msgCounter), direction: 'system', data: action.payload, timestamp: Date.now() },
        ],
      };

    case 'CLEAR_LOG':
      return { ...state, messages: [] };

    case 'LOADTEST_START':
      return { ...state, loadTest: { running: true, phase: 'starting', progress: '', metrics: null } };

    case 'LOADTEST_PROGRESS': {
      const p = action.payload;
      let progress = state.loadTest.progress;
      if (p.event === 'connections_progress') {
        progress = `${(p as { current: number }).current}/${(p as { total: number }).total} connections`;
      } else if (p.event === 'send_progress') {
        const elapsed = (p as { elapsed: number }).elapsed;
        const duration = (p as { duration: number }).duration;
        progress = `${Math.round((elapsed / duration) * 100)}%`;
      }
      return {
        ...state,
        loadTest: {
          ...state.loadTest,
          phase: p.phase ?? state.loadTest.phase,
          progress,
        },
      };
    }

    case 'LOADTEST_DONE':
      return { ...state, loadTest: { running: false, phase: 'done', progress: '', metrics: action.payload } };

    case 'VALIDATION_RESULT':
      return { ...state, lastValidation: action.payload };

    case 'RECORDING_STARTED':
      return { ...state, recording: { active: true, messageCount: 0 } };

    case 'RECORDING_STOPPED':
      return { ...state, recording: { active: false, messageCount: 0 }, lastRecording: action.payload };

    case 'SET_BACKEND_CONNECTED':
      return { ...state, backendConnected: action.payload };

    default:
      return state;
  }
}

const AppContext = createContext<{ state: AppState; dispatch: Dispatch<AppAction> } | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
