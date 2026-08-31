import React, { useEffect, useState } from 'react';
import { analyzeReport, fetchCases } from '../api';

const SOURCE_TYPES = [
  'FIR',
  'Call Detail Record',
  'Financial Transaction',
  'Surveillance Report',
  'Social Media Intelligence',
  'Criminal History',
  'Intelligence Report',
  'Other'
];

export default function AnalyzeReport() {
  const [text, setText] = useState('');
  const [sourceType, setSourceType] = useState(SOURCE_TYPES[0]);
  const [caseId, setCaseId] = useState('');
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchCases().then(setCases).catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await analyzeReport({ text, sourceType, caseId: caseId || undefined });
      setResult(data);
    } catch (err) {
      setError(err?.response?.data?.error || 'Analysis failed. Check the backend logs.');
    } finally {
      setLoading(false);
    }
  }

  const extracted = result?.extracted;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Analyze Report</h1>
        <p className="page-subtitle">
          Paste raw report text below. Claude extracts entities and relationships, which are
          merged straight into the network graph.
        </p>
      </div>

      <div className="analyze-layout">
        <form className="panel analyze-form" onSubmit={handleSubmit}>
          <label className="field-label" htmlFor="sourceType">
            Source type
          </label>
          <select
            id="sourceType"
            className="input"
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value)}
          >
            {SOURCE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <label className="field-label" htmlFor="caseId">
            Attach to case (optional)
          </label>
          <select id="caseId" className="input" value={caseId} onChange={(e) => setCaseId(e.target.value)}>
            <option value="">No case</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>

          <label className="field-label" htmlFor="reportText">
            Report text
          </label>
          <textarea
            id="reportText"
            className="input textarea"
            placeholder="Paste an FIR excerpt, CDR note, transaction record, or surveillance summary…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
          />

          <button className="btn btn-accent" type="submit" disabled={loading || !text.trim()}>
            {loading ? 'Analyzing…' : 'Extract with Claude'}
          </button>

          {error && <p className="form-error">{error}</p>}
        </form>

        <div className="panel analyze-results">
          <h2>Extraction Results</h2>
          {!result && !loading && (
            <p className="empty-state">Results will appear here once a report is analyzed.</p>
          )}
          {loading && <p className="empty-state">Reading the report…</p>}

          {extracted && (
            <div className="extraction-results">
              {extracted.summary && <p className="extraction-summary">{extracted.summary}</p>}

              {extracted.riskFlags?.length > 0 && (
                <div className="flag-tags">
                  {extracted.riskFlags.map((f, i) => (
                    <span key={i} className="tag tag-risk">
                      {f}
                    </span>
                  ))}
                </div>
              )}

              <EntityGroup title="People" items={extracted.entities?.people} field="name" sub="role" />
              <EntityGroup title="Locations" items={extracted.entities?.locations} field="name" />
              <EntityGroup title="Organizations" items={extracted.entities?.organizations} field="name" />
              <EntityGroup title="Vehicles" items={extracted.entities?.vehicles} field="description" />
              <EntityGroup title="Phone Numbers" items={extracted.entities?.phones} field="number" sub="owner" mono />

              {extracted.relationships?.length > 0 && (
                <div className="entity-group">
                  <h3>Relationships</h3>
                  <ul className="relationship-list">
                    {extracted.relationships.map((r, i) => (
                      <li key={i} className="relationship-item">
                        <span className="mono">{r.source}</span>
                        <span className="badge badge-accent">{r.type}</span>
                        <span className="mono">{r.target}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EntityGroup({ title, items, field, sub, mono }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="entity-group">
      <h3>{title}</h3>
      <ul className="entity-list">
        {items.map((item, i) => (
          <li key={i} className="entity-item">
            <span className={mono ? 'mono' : ''}>{item[field]}</span>
            {sub && item[sub] && <span className="entity-item-sub">{item[sub]}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
