import { useLang } from '../context/LangContext';

export default function DocsPage({ onClose }: { onClose: () => void }) {
  const { t } = useLang();

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'var(--bg-primary)',
      overflow: 'auto',
    }}>
      <div style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: '40px 24px 80px',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-sans)',
        lineHeight: 1.7,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.03em' }}>
            <span style={{ color: 'var(--accent)' }}>ws</span>-tester {t('docs.title')}
          </h1>
          <button onClick={onClose} style={{ fontSize: 13 }}>{t('docs.back')}</button>
        </div>

        <Section title={t('docs.whatIsWs.title')}>
          <p dangerouslySetInnerHTML={{ __html: t('docs.whatIsWs.p1') }} />
          <Callout>{t('docs.whatIsWs.callout')}</Callout>
          <p><strong>{t('docs.whatIsWs.useCases')}</strong></p>
          <ul>
            <li>{t('docs.whatIsWs.case1')}</li>
            <li>{t('docs.whatIsWs.case2')}</li>
            <li>{t('docs.whatIsWs.case3')}</li>
            <li>{t('docs.whatIsWs.case4')}</li>
            <li>{t('docs.whatIsWs.case5')}</li>
          </ul>
        </Section>

        <Section title={t('docs.whyTest.title')}>
          <p>{t('docs.whyTest.p1')}</p>
          <table className="results-table" style={{ marginBottom: 16 }}>
            <tbody>
              <Tr label={t('docs.whyTest.drops')} value={t('docs.whyTest.dropsDesc')} />
              <Tr label={t('docs.whyTest.format')} value={t('docs.whyTest.formatDesc')} />
              <Tr label={t('docs.whyTest.latency')} value={t('docs.whyTest.latencyDesc')} />
              <Tr label={t('docs.whyTest.scale')} value={t('docs.whyTest.scaleDesc')} />
              <Tr label={t('docs.whyTest.order')} value={t('docs.whyTest.orderDesc')} />
              <Tr label={t('docs.whyTest.reconnect')} value={t('docs.whyTest.reconnectDesc')} />
            </tbody>
          </table>
        </Section>

        <Section title={t('docs.start.title')}>
          <Step n={1} title={t('docs.step1.title')}>
            <p dangerouslySetInnerHTML={{ __html: t('docs.step1.p1') }} />
            <Example>
              ws://localhost:8085<br/>
              wss://api.example.com/ws<br/>
              wss://stream.binance.com:9443/ws
            </Example>
            <p dangerouslySetInnerHTML={{ __html: t('docs.step1.p2') }} />
          </Step>

          <Step n={2} title={t('docs.step2.title')}>
            <p dangerouslySetInnerHTML={{ __html: t('docs.step2.p1') }} />
            <Callout>
              {t('docs.step2.callout')}<br/>
              <Code>{`{"type": "subscribe", "channel": "updates"}`}</Code>
            </Callout>
          </Step>

          <Step n={3} title={t('docs.step3.title')}>
            <p dangerouslySetInnerHTML={{ __html: t('docs.step3.p1') }} />
            <Example>
              Schema: {`{"type":"object","properties":{"type":{"type":"string"}},"required":["type"]}`}<br/>
              Data: {`{"type":"event"}`} → Valid<br/>
              Data: {`{"wrong":"key"}`} → Invalid
            </Example>
          </Step>

          <Step n={4} title={t('docs.step4.title')}>
            <p dangerouslySetInnerHTML={{ __html: t('docs.step4.p1') }} />
            <p dangerouslySetInnerHTML={{ __html: t('docs.step4.p2') }} />
            <Callout dangerouslySetInnerHTML={{ __html: t('docs.step4.callout') }} />
          </Step>

          <Step n={5} title={t('docs.step5.title')}>
            <p dangerouslySetInnerHTML={{ __html: t('docs.step5.p1') }} />
            <ul>
              <li dangerouslySetInnerHTML={{ __html: t('docs.step5.connections') }} />
              <li dangerouslySetInnerHTML={{ __html: t('docs.step5.duration') }} />
              <li dangerouslySetInnerHTML={{ __html: t('docs.step5.message') }} />
            </ul>
            <p dangerouslySetInnerHTML={{ __html: t('docs.step5.p2') }} />
          </Step>
        </Section>

        <Section title={t('docs.checklist.title')}>
          <Checklist items={[
            t('docs.checklist.1'),
            t('docs.checklist.2'),
            t('docs.checklist.3'),
            t('docs.checklist.4'),
            t('docs.checklist.5'),
            t('docs.checklist.6'),
            t('docs.checklist.7'),
            t('docs.checklist.8'),
            t('docs.checklist.9'),
            t('docs.checklist.10'),
          ]} />
        </Section>

        <Section title={t('docs.glossary.title')}>
          <table className="results-table">
            <tbody>
              <Tr label="WebSocket" value={t('docs.glossary.ws')} />
              <Tr label="ws://" value={t('docs.glossary.wsUrl')} />
              <Tr label="wss://" value={t('docs.glossary.wssUrl')} />
              <Tr label="Connection" value={t('docs.glossary.connection')} />
              <Tr label="Frame" value={t('docs.glossary.frame')} />
              <Tr label="Handshake" value={t('docs.glossary.handshake')} />
              <Tr label="Close code" value={t('docs.glossary.closeCode')} />
              <Tr label="JSON Schema" value={t('docs.glossary.jsonSchema')} />
              <Tr label="Latency" value={t('docs.glossary.latency')} />
              <Tr label="Throughput" value={t('docs.glossary.throughput')} />
            </tbody>
          </table>
        </Section>

        <Section title={t('docs.cli.title')}>
          <p>{t('docs.cli.p1')}</p>
          <Pre>{`# Interactive connection
ws-tester connect ws://localhost:8085

# Send a message
ws-tester send ws://localhost:8085 -m '{"type":"ping"}'

# Record a session
ws-tester record ws://localhost:8085 -o session.json

# Replay a session
ws-tester replay ws://localhost:8085 -i session.json

# Load test (100 connections, 30 seconds)
ws-tester loadtest ws://localhost:8085 -c 100 -d 30

# Validate message against schema
ws-tester validate -s schema.json -d message.json

# Start web dashboard
ws-tester web --port 3456`}</Pre>
        </Section>

        <div style={{ marginTop: 40, padding: '16px 0', borderTop: '1px solid var(--border-primary)', color: 'var(--text-quaternary)', fontSize: 12 }}>
          ws-tester v1.0.0
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 36 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 12, color: 'var(--text-primary)' }}>
        {title}
      </h2>
      <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{children}</div>
    </section>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24, paddingLeft: 20, borderLeft: '2px solid var(--border-primary)' }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>
        <span style={{ color: 'var(--accent)', marginRight: 8, fontVariantNumeric: 'tabular-nums' }}>{n}.</span>
        {title}
      </h3>
      <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{children}</div>
    </div>
  );
}

function Callout({ children, dangerouslySetInnerHTML }: { children?: React.ReactNode; dangerouslySetInnerHTML?: { __html: string } }) {
  return (
    <div style={{
      margin: '12px 0',
      padding: '10px 14px',
      background: 'var(--accent-dimmed)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid rgba(129, 140, 248, 0.15)',
      color: 'var(--text-secondary)',
      fontSize: 13,
      lineHeight: 1.6,
    }}
      {...(dangerouslySetInnerHTML ? { dangerouslySetInnerHTML } : {})}
    >
      {dangerouslySetInnerHTML ? undefined : children}
    </div>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code style={{
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      padding: '1px 6px',
      background: 'var(--bg-tertiary)',
      borderRadius: 4,
      color: 'var(--accent-hover)',
    }}>
      {children}
    </code>
  );
}

function Pre({ children }: { children: React.ReactNode }) {
  return (
    <pre style={{
      margin: '12px 0',
      padding: '14px 16px',
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border-primary)',
      borderRadius: 'var(--radius-md)',
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      lineHeight: 1.7,
      overflowX: 'auto',
      color: 'var(--text-secondary)',
    }}>
      {children}
    </pre>
  );
}

function Example({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      margin: '10px 0',
      padding: '10px 14px',
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border-secondary)',
      borderRadius: 'var(--radius-sm)',
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      lineHeight: 1.7,
      color: 'var(--text-secondary)',
    }}>
      {children}
    </div>
  );
}

function Checklist({ items }: { items: string[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {items.map((item, i) => (
        <label key={i} style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
          fontSize: 13,
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          padding: '4px 0',
        }}>
          <input type="checkbox" style={{ marginTop: 3, accentColor: 'var(--accent)' }} />
          <span>{item}</span>
        </label>
      ))}
    </div>
  );
}

function Tr({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td>{label}</td>
      <td>{value}</td>
    </tr>
  );
}
