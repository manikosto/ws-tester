import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLang } from '../context/LangContext';
import { useApi } from '../hooks/useApi';

export default function ValidatePanel() {
  const { state, dispatch } = useApp();
  const { t } = useLang();
  const api = useApi();
  const [schema, setSchema] = useState(`{
  "type": "object",
  "properties": {
    "type": { "type": "string" },
    "payload": { "type": "object" }
  },
  "required": ["type", "payload"]
}`);
  const [data, setData] = useState('{"type": "event", "payload": {"key": "value"}}');

  async function handleValidate() {
    try {
      const result = await api.validate(schema, data);
      dispatch({ type: 'VALIDATION_RESULT', payload: result });
    } catch (err: unknown) {
      dispatch({ type: 'SYSTEM_MESSAGE', payload: `Validation error: ${(err as Error).message}` });
    }
  }

  const result = state.lastValidation;

  return (
    <div className="panel">
      <div className="form-group">
        <label>{t('validate.schema')}</label>
        <textarea value={schema} onChange={(e) => setSchema(e.target.value)} rows={5} />
      </div>

      <div className="form-group">
        <label>{t('validate.data')}</label>
        <textarea value={data} onChange={(e) => setData(e.target.value)} rows={3} />
      </div>

      <div className="btn-row">
        <button className="primary" onClick={handleValidate}>
          {t('validate.button')}
        </button>
      </div>

      {result && (
        <div className={`validation-result ${result.valid ? 'valid' : 'invalid'}`}>
          {result.valid ? (
            <span>{t('validate.valid')}</span>
          ) : (
            <div>
              <div style={{ marginBottom: 4 }}>{t('validate.invalid')} — {result.errors.length} {t('validate.errors')}</div>
              {result.errors.map((err, i) => (
                <div key={i} style={{ fontSize: 11, opacity: 0.85 }}>
                  {err.path}: {err.message} [{err.keyword}]
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
