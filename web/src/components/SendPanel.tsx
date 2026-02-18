import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLang } from '../context/LangContext';
import { useApi } from '../hooks/useApi';

export default function SendPanel() {
  const { state, dispatch } = useApp();
  const { t } = useLang();
  const api = useApi();
  const [message, setMessage] = useState('');

  const canSend = state.connectionStatus === 'connected' && state.sessionId && message.trim();

  async function handleSend() {
    if (!canSend || !state.sessionId) return;
    try {
      await api.send(state.sessionId, message);
      setMessage('');
    } catch (err: unknown) {
      dispatch({ type: 'SYSTEM_MESSAGE', payload: `Send error: ${(err as Error).message}` });
    }
  }

  return (
    <div className="panel">
      <div className="panel-title">{t('send.title')}</div>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={state.connectionStatus === 'connected' ? t('send.placeholder') : t('send.placeholderDisconnected')}
        disabled={state.connectionStatus !== 'connected'}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
      />

      <div className="btn-row">
        <button className="primary" onClick={handleSend} disabled={!canSend}>
          {t('send.button')}
        </button>
      </div>
    </div>
  );
}
