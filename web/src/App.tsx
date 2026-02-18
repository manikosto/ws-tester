import { useState, useRef } from 'react';
import { useApp } from './context/AppContext';
import { useLang } from './context/LangContext';
import { useTheme } from './context/ThemeContext';
import { useBackendWebSocket } from './hooks/useWebSocket';
import ConnectionPanel from './components/ConnectionPanel';
import SendPanel from './components/SendPanel';
import RecordPanel from './components/RecordPanel';
import MessageLog from './components/MessageLog';
import LoadTestPanel from './components/LoadTestPanel';
import ValidatePanel from './components/ValidatePanel';
import DocsPage from './components/DocsPage';
import LandingPage from './components/LandingPage';

const isRemote = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

function DemoWelcomeModal({ onClose, onDocs }: { onClose: () => void; onDocs: () => void }) {
  const { t } = useLang();
  const dontShowRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    if (dontShowRef.current?.checked) {
      localStorage.setItem('ws-tester-demo-dismissed', '1');
    }
    onClose();
  };

  return (
    <div className="demo-overlay" onClick={handleClose}>
      <div className="demo-modal" onClick={e => e.stopPropagation()}>
        <div className="demo-modal-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2>{t('demo.title')}</h2>
        <p dangerouslySetInnerHTML={{ __html: t('demo.description') }} />
        <p dangerouslySetInnerHTML={{ __html: t('demo.selfHostHint') }} />
        <div className="demo-modal-code">
          docker run -p 3456:3456 ghcr.io/manikosto/ws-tester
        </div>
        <div className="demo-modal-actions">
          <button className="primary" onClick={handleClose}>{t('demo.gotIt')}</button>
          <div className="demo-modal-secondary-row">
            <label className="demo-modal-check">
              <input type="checkbox" ref={dontShowRef} />
              {t('demo.dontShow')}
            </label>
            <button onClick={() => { handleClose(); onDocs(); }}>{t('demo.docsLink')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { state, dispatch } = useApp();
  const { lang, setLang, t } = useLang();
  const { theme, toggleTheme } = useTheme();
  const [page, setPage] = useState<'landing' | 'dashboard' | 'docs'>('landing');
  const [rightTab, setRightTab] = useState<'loadtest' | 'validate'>('loadtest');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showDemoModal, setShowDemoModal] = useState(false);

  useBackendWebSocket(dispatch);

  const openDashboard = () => {
    setPage('dashboard');
    if (isRemote && localStorage.getItem('ws-tester-demo-dismissed') !== '1') {
      setShowDemoModal(true);
    }
  };

  if (page === 'landing') {
    return <LandingPage onOpenDashboard={openDashboard} onOpenDocs={() => setPage('docs')} />;
  }

  if (page === 'docs') {
    return <DocsPage onClose={() => setPage('dashboard')} />;
  }

  return (
    <div className="app">
      {showDemoModal && (
        <DemoWelcomeModal
          onClose={() => setShowDemoModal(false)}
          onDocs={() => { setShowDemoModal(false); setPage('docs'); }}
        />
      )}
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="2" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <line x1="6" y1="2" x2="6" y2="14" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
          <h1 style={{ cursor: 'pointer' }} onClick={() => setPage('landing')}>
            <span>ws</span>-tester
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => setPage('landing')}
            style={{ padding: '3px 10px', fontSize: 12 }}
          >
            Landing
          </button>
          <button
            onClick={() => setPage('docs')}
            style={{ padding: '3px 10px', fontSize: 12 }}
          >
            {t('header.docs')}
          </button>

          <div className="lang-switcher">
            <button
              className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
              onClick={() => setLang('en')}
            >
              EN
            </button>
            <button
              className={`lang-btn ${lang === 'ru' ? 'active' : ''}`}
              onClick={() => setLang('ru')}
            >
              RU
            </button>
          </div>

          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 1.5v1M8 13.5v1M1.5 8h1M13.5 8h1M3.4 3.4l.7.7M11.9 11.9l.7.7M12.6 3.4l-.7.7M4.1 11.9l-.7.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M13.5 9.2A5.5 5.5 0 016.8 2.5 6 6 0 1013.5 9.2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            )}
          </button>

          <div className="backend-status">
            <div className={`dot ${state.backendConnected ? 'connected' : ''}`} />
            {state.backendConnected ? t('header.backendConnected') : t('header.backendDisconnected')}
          </div>
        </div>
      </header>

      <main className={`dashboard ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
        <div className={`left-column ${sidebarOpen ? '' : 'collapsed'}`}>
          <ConnectionPanel />
          <SendPanel />
          <RecordPanel />
        </div>
        <div className="right-column">
          <MessageLog />
          <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="tabs">
              <button
                className={`tab ${rightTab === 'loadtest' ? 'active' : ''}`}
                onClick={() => setRightTab('loadtest')}
              >
                {t('tab.loadtest')}
              </button>
              <button
                className={`tab ${rightTab === 'validate' ? 'active' : ''}`}
                onClick={() => setRightTab('validate')}
              >
                {t('tab.validate')}
              </button>
            </div>
            <div style={{ flex: 1, overflow: 'auto' }}>
              {rightTab === 'loadtest' ? <LoadTestPanel /> : <ValidatePanel />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
