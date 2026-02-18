import { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useLang } from '../context/LangContext';
import { useApi } from '../hooks/useApi';
import type { SessionRecording } from '../types';

export default function RecordPanel() {
  const { state, dispatch } = useApp();
  const { t } = useLang();
  const api = useApi();
  const fileRef = useRef<HTMLInputElement>(null);

  const isConnected = state.connectionStatus === 'connected' && state.sessionId;

  async function handleStartRecording() {
    if (!state.sessionId) return;
    try {
      await api.startRecording(state.sessionId);
      dispatch({ type: 'RECORDING_STARTED' });
    } catch (err: unknown) {
      dispatch({ type: 'SYSTEM_MESSAGE', payload: `Record error: ${(err as Error).message}` });
    }
  }

  async function handleStopRecording() {
    if (!state.sessionId) return;
    try {
      const recording = await api.stopRecording(state.sessionId);
      dispatch({ type: 'RECORDING_STOPPED', payload: recording });
    } catch (err: unknown) {
      dispatch({ type: 'SYSTEM_MESSAGE', payload: `Stop record error: ${(err as Error).message}` });
    }
  }

  function handleDownload() {
    if (!state.lastRecording) return;
    const blob = new Blob([JSON.stringify(state.lastRecording, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ws-session-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleReplay(recording: SessionRecording) {
    if (!state.sessionId) return;
    dispatch({ type: 'SYSTEM_MESSAGE', payload: 'Replaying session...' });
    try {
      const result = await api.replay(state.sessionId, recording);
      dispatch({ type: 'SYSTEM_MESSAGE', payload: `${t('sys.replayComplete')}: ${result.replayed} ${t('sys.sent')}, ${result.skipped} ${t('sys.skipped')}` });
    } catch (err: unknown) {
      dispatch({ type: 'SYSTEM_MESSAGE', payload: `Replay error: ${(err as Error).message}` });
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const recording = JSON.parse(ev.target?.result as string) as SessionRecording;
        handleReplay(recording);
      } catch {
        dispatch({ type: 'SYSTEM_MESSAGE', payload: 'Failed to parse recording file' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <div className="panel">
      <div className="panel-title">{t('record.title')}</div>

      <div className="btn-row" style={{ flexWrap: 'wrap' }}>
        {!state.recording.active ? (
          <button className="success" onClick={handleStartRecording} disabled={!isConnected}>
            {t('record.start')}
          </button>
        ) : (
          <button className="danger" onClick={handleStopRecording}>
            <span className="recording-indicator">
              <span className="rec-dot" />
              REC
            </span>
            &nbsp;({state.recording.messageCount})
          </button>
        )}

        {state.lastRecording && (
          <button onClick={handleDownload}>
            {t('record.download')}
          </button>
        )}

        <button onClick={() => fileRef.current?.click()} disabled={!isConnected}>
          {t('record.replay')}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />
      </div>

      {state.lastRecording && (
        <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-tertiary)' }}>
          {state.lastRecording.messages.length} {t('record.recorded')},{' '}
          {((new Date(state.lastRecording.endedAt).getTime() - new Date(state.lastRecording.startedAt).getTime()) / 1000).toFixed(1)}s
        </div>
      )}
    </div>
  );
}
