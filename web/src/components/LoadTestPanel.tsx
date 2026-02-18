import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLang } from '../context/LangContext';
import { useApi } from '../hooks/useApi';

export default function LoadTestPanel() {
  const { state, dispatch } = useApp();
  const { t } = useLang();
  const api = useApi();
  const [url, setUrl] = useState(state.url);
  const [connections, setConnections] = useState(10);
  const [duration, setDuration] = useState(5);
  const [message, setMessage] = useState('{"type":"ping"}');

  async function handleRun() {
    dispatch({ type: 'LOADTEST_START' });
    try {
      await api.loadTest({ url, connections, duration, message: message || undefined });
    } catch (err: unknown) {
      dispatch({ type: 'SYSTEM_MESSAGE', payload: `Load test error: ${(err as Error).message}` });
    }
  }

  const metrics = state.loadTest.metrics;

  return (
    <div className="panel">
      <div className="form-group">
        <label>{t('loadtest.targetUrl')}</label>
        <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="ws://localhost:8085" />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>{t('loadtest.connections')}</label>
          <input type="number" value={connections} onChange={(e) => setConnections(+e.target.value)} min={1} max={1000} />
        </div>
        <div className="form-group">
          <label>{t('loadtest.duration')}</label>
          <input type="number" value={duration} onChange={(e) => setDuration(+e.target.value)} min={1} max={300} />
        </div>
      </div>

      <div className="form-group">
        <label>{t('loadtest.message')}</label>
        <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder='{"type":"ping"}' />
      </div>

      <div className="btn-row">
        <button className="primary" onClick={handleRun} disabled={state.loadTest.running || !url.trim()}>
          {state.loadTest.running ? `${t('loadtest.running')} ${state.loadTest.progress}` : t('loadtest.run')}
        </button>
      </div>

      {metrics && (
        <div style={{ marginTop: 12 }}>
          <table className="results-table">
            <tbody>
              <tr><td>{t('loadtest.result.connections')}</td><td>{metrics.successfulConnections}/{metrics.totalConnections}</td></tr>
              <tr><td>{t('loadtest.result.failed')}</td><td style={{ color: metrics.failedConnections > 0 ? 'var(--red)' : undefined }}>{metrics.failedConnections}</td></tr>
              <tr><td>{t('loadtest.result.avgConnect')}</td><td>{metrics.avgConnectionTimeMs.toFixed(1)}ms</td></tr>
              <tr><td>{t('loadtest.result.sent')}</td><td>{metrics.totalMessagesSent}</td></tr>
              <tr><td>{t('loadtest.result.received')}</td><td>{metrics.totalMessagesReceived}</td></tr>
              <tr><td>{t('loadtest.result.mps')}</td><td>{metrics.messagesPerSecond.toFixed(1)}</td></tr>
              <tr><td>{t('loadtest.result.avgLatency')}</td><td>{metrics.avgLatencyMs.toFixed(1)}ms</td></tr>
              <tr><td>{t('loadtest.result.minMaxLatency')}</td><td>{metrics.minLatencyMs.toFixed(1)} / {metrics.maxLatencyMs.toFixed(1)}ms</td></tr>
              <tr><td>{t('loadtest.result.duration')}</td><td>{(metrics.durationMs / 1000).toFixed(1)}s</td></tr>
              <tr><td>{t('loadtest.result.errors')}</td><td style={{ color: metrics.errorsCount > 0 ? 'var(--red)' : undefined }}>{metrics.errorsCount}</td></tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
