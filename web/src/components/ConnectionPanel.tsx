import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLang } from '../context/LangContext';
import { useApi } from '../hooks/useApi';

export default function ConnectionPanel() {
  const { state, dispatch } = useApp();
  const { t } = useLang();
  const api = useApi();
  const [url, setUrl] = useState(state.url);
  const [pingInterval, setPingInterval] = useState('');

  const isConnected = state.connectionStatus === 'connected';
  const isConnecting = state.connectionStatus === 'connecting';

  async function handleConnect() {
    dispatch({ type: 'CONNECTING' });
    try {
      const ping = parseInt(pingInterval, 10);
      const result = await api.connect(url, {
        pingInterval: ping > 0 ? ping * 1000 : undefined,
      });
      dispatch({ type: 'CONNECTED', payload: { sessionId: result.sessionId, url } });
    } catch (err: unknown) {
      dispatch({ type: 'CONNECTION_ERROR', payload: (err as Error).message });
    }
  }

  async function handleDisconnect() {
    if (!state.sessionId) return;
    try {
      await api.disconnect(state.sessionId);
      dispatch({ type: 'DISCONNECTED' });
    } catch (err: unknown) {
      dispatch({ type: 'SYSTEM_MESSAGE', payload: `Disconnect error: ${(err as Error).message}` });
    }
  }

  const statusLabel =
    state.connectionStatus === 'connected' ? t('connection.connected')
    : state.connectionStatus === 'error' ? t('connection.error')
    : t('connection.disconnected');

  return (
    <div className="panel">
      <div className="panel-title">{t('connection.title')}</div>

      <div className="form-group">
        <label>{t('connection.url')}</label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={t('connection.placeholder')}
          disabled={isConnected || isConnecting}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isConnected && !isConnecting) handleConnect();
          }}
        />
      </div>

      <div className="form-group">
        <label>{t('connection.pingInterval')}</label>
        <input
          type="number"
          value={pingInterval}
          onChange={(e) => setPingInterval(e.target.value)}
          placeholder="0"
          min="0"
          style={{ width: 80 }}
          disabled={isConnected || isConnecting}
        />
      </div>

      <div className="btn-row">
        {!isConnected ? (
          <button className="primary" onClick={handleConnect} disabled={isConnecting || !url.trim()}>
            {isConnecting ? t('connection.connecting') : t('connection.connect')}
          </button>
        ) : (
          <button className="danger" onClick={handleDisconnect}>
            {t('connection.disconnect')}
          </button>
        )}
      </div>

      <div style={{ marginTop: 12 }}>
        <span className={`status-badge ${state.connectionStatus}`}>
          <span
            style={{
              width: 6, height: 6, borderRadius: '50%',
              background: state.connectionStatus === 'connected' ? 'var(--green)'
                : state.connectionStatus === 'error' ? 'var(--red)' : 'var(--text-tertiary)',
            }}
          />
          {statusLabel}
        </span>
        {state.sessionId && (
          <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--text-tertiary)' }}>
            ID: {state.sessionId}
          </span>
        )}
      </div>
    </div>
  );
}
