import { useEffect, useRef } from 'react';
import { useLang } from '../context/LangContext';
import { useTheme } from '../context/ThemeContext';
import type { TranslationKey } from '../i18n';
import '../landing.css';

interface LandingPageProps {
  onOpenDashboard: () => void;
  onOpenDocs: () => void;
}

export default function LandingPage({ onOpenDashboard, onOpenDocs }: LandingPageProps) {
  const { lang, setLang, t } = useLang();
  const { theme, toggleTheme } = useTheme();
  const landingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = landingRef.current;
    if (!el) return;
    const sections = el.querySelectorAll('.landing-section');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing" ref={landingRef}>
      {/* Header */}
      <header className="landing-header">
        <div className="landing-logo"><span>ws</span>-tester</div>
        <nav className="landing-nav">
          <button onClick={onOpenDashboard} style={{ padding: '3px 10px', fontSize: 12 }}>
            Dashboard
          </button>
          <button onClick={onOpenDocs} style={{ padding: '3px 10px', fontSize: 12 }}>
            {t('header.docs')}
          </button>
          <div className="lang-switcher">
            <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>EN</button>
            <button className={`lang-btn ${lang === 'ru' ? 'active' : ''}`} onClick={() => setLang('ru')}>RU</button>
          </div>
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
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
        </nav>
      </header>

      {/* Hero */}
      <section className="landing-hero landing-section">
        <div className="landing-hero-glow" />
        <div className="landing-hero-content">
          <h1>
            {t('landing.hero.title.pre')}{' '}
            <span className="gradient-text">{t('landing.hero.title.gradient')}</span>
          </h1>
          <p className="subtitle">{t('landing.hero.subtitle')}</p>
          <div className="landing-hero-buttons">
            <button className="btn-landing-primary" onClick={onOpenDashboard}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M6 2v12M2 6h12" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              {t('landing.hero.openDashboard')}
            </button>
            <button className="btn-landing-secondary" onClick={onOpenDocs}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 2h8a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M5 6h6M5 8.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {t('header.docs')}
            </button>
          </div>
        </div>
      </section>

      <hr className="landing-divider" />

      {/* Features */}
      <section className="landing-features landing-section">
        <div className="landing-section-header">
          <h2>{t('landing.features.title')}</h2>
          <p>{t('landing.features.subtitle')}</p>
        </div>
        <div className="landing-features-grid">
          {FEATURES.map((f) => (
            <div className="landing-feature-card" key={f.key}>
              <div className={`landing-feature-icon ${f.iconClass}`}>
                {f.icon}
              </div>
              <h3>{t(f.titleKey)}</h3>
              <p>{t(f.descKey)}</p>
            </div>
          ))}
        </div>
      </section>

      <hr className="landing-divider" />

      {/* Comparison */}
      <section className="landing-compare landing-section">
        <div className="landing-section-header">
          <h2>{t('landing.compare.title')}</h2>
          <p>{t('landing.compare.subtitle')}</p>
        </div>
        <ComparisonTable />
      </section>

      <hr className="landing-divider" />

      {/* Demo Preview */}
      <section className="landing-demo landing-section">
        <div className="landing-section-header">
          <h2>{t('landing.demo.title')}</h2>
          <p>{t('landing.demo.subtitle')}</p>
        </div>
        <DemoPreview />
      </section>

      <hr className="landing-divider" />

      {/* How It Works */}
      <section className="landing-steps landing-section">
        <div className="landing-section-header">
          <h2>{t('landing.howItWorks.title')}</h2>
        </div>
        <div className="landing-steps-list">
          {STEPS.map((s) => (
            <div className="landing-step" key={s.n}>
              <div className="landing-step-number">{s.n}</div>
              <div className="landing-step-content">
                <h3>{t(s.titleKey)}</h3>
                <p>{t(s.descKey)}</p>
                <div className="landing-step-code">
                  <span className="token-prompt">$</span> {s.code}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <hr className="landing-divider" />

      {/* Terminal */}
      <section className="landing-terminal landing-section">
        <div className="landing-section-header">
          <h2>{t('landing.terminal.title')}</h2>
        </div>
        <TerminalBlock />
      </section>

      <hr className="landing-divider" />

      {/* Self-Hosted */}
      <section className="landing-self-hosted landing-section">
        <h2>{t('landing.selfHosted.title')}</h2>
        <p>{t('landing.selfHosted.desc')}</p>
        <div className="landing-deploy-blocks">
          <div className="landing-deploy-block">
            <div className="label">{t('landing.selfHosted.docker')}</div>
            <code>docker run -p 3456:3456 ws-tester</code>
          </div>
          <div className="landing-deploy-block">
            <div className="label">{t('landing.selfHosted.npm')}</div>
            <code>npx ws-tester web --port 3456</code>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <span>{t('landing.footer.builtWith')}</span>
        <span style={{ color: 'var(--text-quaternary)' }}>v1.0.0</span>
      </footer>
    </div>
  );
}

/* ========= Data ========= */

const FEATURES: {
  key: string;
  iconClass: string;
  icon: React.ReactNode;
  titleKey: TranslationKey;
  descKey: TranslationKey;
}[] = [
  {
    key: 'realtime',
    iconClass: 'realtime',
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M11 1l-1 8h5l-6 10 1-8H5l6-10z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
    titleKey: 'landing.feature.realtime.title',
    descKey: 'landing.feature.realtime.desc',
  },
  {
    key: 'send',
    iconClass: 'send',
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10h12M12 6l4 4-4 4M16 10H4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 14l-4-4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    titleKey: 'landing.feature.sendreceive.title',
    descKey: 'landing.feature.sendreceive.desc',
  },
  {
    key: 'record',
    iconClass: 'record',
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/><circle cx="10" cy="10" r="3" fill="currentColor"/></svg>,
    titleKey: 'landing.feature.record.title',
    descKey: 'landing.feature.record.desc',
  },
  {
    key: 'loadtest',
    iconClass: 'loadtest',
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 16V9M7 16V7M11 16V4M15 16V10M19 16V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    titleKey: 'landing.feature.loadtest.title',
    descKey: 'landing.feature.loadtest.desc',
  },
  {
    key: 'validate',
    iconClass: 'validate',
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2L3 6v5c0 4.4 3 7.5 7 9 4-1.5 7-4.6 7-9V6l-7-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    titleKey: 'landing.feature.validate.title',
    descKey: 'landing.feature.validate.desc',
  },
  {
    key: 'cli',
    iconClass: 'cli',
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="3" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M5 8l3 2.5L5 13M10 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    titleKey: 'landing.feature.cli.title',
    descKey: 'landing.feature.cli.desc',
  },
];

const STEPS: {
  n: number;
  titleKey: TranslationKey;
  descKey: TranslationKey;
  code: string;
}[] = [
  { n: 1, titleKey: 'landing.step1.title', descKey: 'landing.step1.desc', code: 'npm install -g ws-tester' },
  { n: 2, titleKey: 'landing.step2.title', descKey: 'landing.step2.desc', code: 'ws-tester connect ws://localhost:8085' },
  { n: 3, titleKey: 'landing.step3.title', descKey: 'landing.step3.desc', code: 'ws-tester loadtest ws://localhost:8085 -c 100 -d 30' },
];

/* ========= Sub-components ========= */

function DemoPreview() {
  const entries = [
    { time: '14:32:01', dir: 'system', content: 'Connected to ws://api.example.com/ws' },
    { time: '14:32:01', dir: 'sent', content: '{"type":"subscribe","channel":"updates"}' },
    { time: '14:32:01', dir: 'received', content: '{"status":"ok","subscribed":"updates"}' },
    { time: '14:32:03', dir: 'received', content: '{"type":"update","data":{"price":142.50}}' },
    { time: '14:32:05', dir: 'sent', content: '{"type":"ping"}' },
    { time: '14:32:05', dir: 'received', content: '{"type":"pong","latency":"2ms"}' },
    { time: '14:32:08', dir: 'received', content: '{"type":"update","data":{"price":142.75}}' },
    { time: '14:32:10', dir: 'sent', content: '{"type":"unsubscribe","channel":"updates"}' },
    { time: '14:32:10', dir: 'received', content: '{"status":"ok","unsubscribed":"updates"}' },
  ];

  const arrows: Record<string, string> = { sent: '\u2191', received: '\u2193', system: '\u2022' };

  return (
    <div className="landing-demo-window">
      <div className="landing-demo-titlebar">
        <span className="landing-demo-dot red" />
        <span className="landing-demo-dot yellow" />
        <span className="landing-demo-dot green" />
        <span className="landing-demo-url">ws-tester — Dashboard</span>
      </div>
      <div className="landing-demo-body">
        <div className="landing-demo-sidebar">
          <div className="landing-demo-sidebar-item active-item">Connection</div>
          <div className="landing-demo-sidebar-item">Send Message</div>
          <div className="landing-demo-sidebar-item">Record / Replay</div>
        </div>
        <div className="landing-demo-log">
          {entries.map((e, i) => (
            <div className="landing-demo-log-entry" key={i}>
              <span className="time">{e.time}</span>
              <span className={`arrow ${e.dir}`}>{arrows[e.dir]}</span>
              <span className={`msg-content ${e.dir}`}>{e.content}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ComparisonTable() {
  const { t } = useLang();

  const features: { key: TranslationKey; ws: string; postman: string; wscat: string; k6: string; insomnia: string }[] = [
    { key: 'landing.compare.connect',    ws: 'check', postman: 'check',   wscat: 'check',   k6: 'cross',     insomnia: 'check' },
    { key: 'landing.compare.webui',      ws: 'check', postman: 'check',   wscat: 'cross',    k6: 'cross',     insomnia: 'check' },
    { key: 'landing.compare.record',     ws: 'check', postman: 'cross',    wscat: 'cross',    k6: 'cross',     insomnia: 'cross' },
    { key: 'landing.compare.loadtest',   ws: 'check', postman: 'cross',    wscat: 'cross',    k6: 'check',    insomnia: 'cross' },
    { key: 'landing.compare.schema',     ws: 'check', postman: 'partial', wscat: 'cross',    k6: 'cross',     insomnia: 'cross' },
    { key: 'landing.compare.cli',        ws: 'check', postman: 'partial', wscat: 'check',   k6: 'check',    insomnia: 'cross' },
    { key: 'landing.compare.i18n',       ws: 'check', postman: 'check',   wscat: 'cross',    k6: 'cross',     insomnia: 'check' },
    { key: 'landing.compare.selfhosted', ws: 'check', postman: 'cross',    wscat: 'check',   k6: 'check',    insomnia: 'cross' },
    { key: 'landing.compare.free',       ws: 'check', postman: 'partial', wscat: 'check',   k6: 'partial',  insomnia: 'partial' },
    { key: 'landing.compare.noConfig',   ws: 'check', postman: 'cross',    wscat: 'check',   k6: 'cross',     insomnia: 'cross' },
  ];

  const icon = (type: string) => {
    if (type === 'check') return <span className="check">{'\u2713'}</span>;
    if (type === 'partial') return <span className="partial">~</span>;
    return <span className="cross">{'\u2014'}</span>;
  };

  return (
    <table className="landing-compare-table">
      <thead>
        <tr>
          <th>{t('landing.compare.feature')}</th>
          <th className="highlight">ws-tester</th>
          <th>Postman</th>
          <th>wscat</th>
          <th>k6</th>
          <th>Insomnia</th>
        </tr>
      </thead>
      <tbody>
        {features.map((f) => (
          <tr key={f.key}>
            <td>{t(f.key)}</td>
            <td className="highlight">{icon(f.ws)}</td>
            <td>{icon(f.postman)}</td>
            <td>{icon(f.wscat)}</td>
            <td>{icon(f.k6)}</td>
            <td>{icon(f.insomnia)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TerminalBlock() {
  return (
    <div className="landing-code-window">
      <div className="landing-code-titlebar">
        <span className="landing-demo-dot red" />
        <span className="landing-demo-dot yellow" />
        <span className="landing-demo-dot green" />
        <span style={{ marginLeft: 8 }}>Terminal</span>
      </div>
      <div className="landing-code-body">
        <div><span className="token-comment"># Connect to a WebSocket server</span></div>
        <div><span className="token-prompt">$ </span><span className="token-cmd">ws-tester connect</span> <span className="token-url">ws://localhost:8085</span></div>
        <div style={{ height: 8 }} />
        <div><span className="token-comment"># Send a JSON message</span></div>
        <div><span className="token-prompt">$ </span><span className="token-cmd">ws-tester send</span> <span className="token-url">ws://localhost:8085</span> <span className="token-flag">-m</span> <span className="token-string">{'\'{"type":"ping"}\''}</span></div>
        <div style={{ height: 8 }} />
        <div><span className="token-comment"># Record a session to file</span></div>
        <div><span className="token-prompt">$ </span><span className="token-cmd">ws-tester record</span> <span className="token-url">ws://localhost:8085</span> <span className="token-flag">-o</span> <span className="token-file">session.json</span></div>
        <div style={{ height: 8 }} />
        <div><span className="token-comment"># Load test: 100 connections for 30 seconds</span></div>
        <div><span className="token-prompt">$ </span><span className="token-cmd">ws-tester loadtest</span> <span className="token-url">ws://localhost:8085</span> <span className="token-flag">-c</span> 100 <span className="token-flag">-d</span> 30</div>
        <div style={{ height: 8 }} />
        <div><span className="token-comment"># Validate message against schema</span></div>
        <div><span className="token-prompt">$ </span><span className="token-cmd">ws-tester validate</span> <span className="token-flag">-s</span> <span className="token-file">schema.json</span> <span className="token-flag">-d</span> <span className="token-file">data.json</span></div>
        <div style={{ height: 8 }} />
        <div><span className="token-comment"># Start the web dashboard</span></div>
        <div><span className="token-prompt">$ </span><span className="token-cmd">ws-tester web</span> <span className="token-flag">--port</span> 3456</div>
      </div>
    </div>
  );
}
