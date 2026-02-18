import { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useLang } from '../context/LangContext';

export default function MessageLog() {
  const { state, dispatch } = useApp();
  const { t } = useLang();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages.length]);

  function formatTime(ts: number): string {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  function formatData(data: string): string {
    try {
      const parsed = JSON.parse(data);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return data;
    }
  }

  const arrowMap = {
    sent: { symbol: '\u2192', cls: 'sent' },
    received: { symbol: '\u2190', cls: 'received' },
    system: { symbol: '\u2022', cls: 'system' },
  } as const;

  return (
    <div className="panel message-log" style={{ padding: '14px 16px' }}>
      <div className="panel-header">
        <span className="panel-title" style={{ margin: 0 }}>{t('log.title')}</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="count">{state.messages.length}</span>
          <button
            style={{ padding: '2px 10px', fontSize: 11 }}
            onClick={() => dispatch({ type: 'CLEAR_LOG' })}
          >
            {t('log.clear')}
          </button>
        </div>
      </div>

      <div className="log-entries">
        {state.messages.length === 0 && (
          <div className="empty-state">
            <div className="icon">~</div>
            <div>{t('log.empty')}</div>
            <div style={{ fontSize: 12 }}>{t('log.emptyHint')}</div>
          </div>
        )}
        {state.messages.map((msg) => {
          const arrow = arrowMap[msg.direction];
          return (
            <div key={msg.id} className="log-entry">
              <span className="time">{formatTime(msg.timestamp)}</span>
              <span className={`arrow ${arrow.cls}`}>{arrow.symbol}</span>
              <span className="content">{formatData(msg.data)}</span>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
    </div>
  );
}
