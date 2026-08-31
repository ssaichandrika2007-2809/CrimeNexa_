import React, { useEffect, useState } from 'react';
import { fetchGraph, fetchPeople, fetchCases, fetchReports } from '../api';

export default function Dashboard() {
  const [graph, setGraph] = useState({ nodes: [], edges: [] });
  const [people, setPeople] = useState([]);
  const [cases, setCases] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetchGraph(), fetchPeople(), fetchCases(), fetchReports()])
      .then(([g, p, c, r]) => {
        setGraph(g);
        setPeople(p);
        setCases(c);
        setReports(r);
      })
      .catch(() => setError('Could not reach the backend. Is it running?'))
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    people: graph.nodes.filter((n) => n.group === 'person').length,
    locations: graph.nodes.filter((n) => n.group === 'location').length,
    organizations: graph.nodes.filter((n) => n.group === 'organization').length,
    relationships: graph.edges.length,
    cases: cases.length
  };

  const topInfluencers = people.slice(0, 5);
  const flaggedReports = reports.filter((r) => r.riskFlags && r.riskFlags.length > 0).slice(0, 5);

  if (loading) return <div className="page-loading">Loading command center…</div>;
  if (error) return <div className="page-error">{error}</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Command Center</h1>
        <p className="page-subtitle">A live snapshot of everything CrimeGraph has extracted so far.</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-value">{counts.people}</span>
          <span className="stat-label">People</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{counts.locations}</span>
          <span className="stat-label">Locations</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{counts.organizations}</span>
          <span className="stat-label">Organizations</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{counts.relationships}</span>
          <span className="stat-label">Relationships</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{counts.cases}</span>
          <span className="stat-label">Cases</span>
        </div>
      </div>

      <div className="panel-grid">
        <section className="panel">
          <h2>Key Influencers</h2>
          {topInfluencers.length === 0 ? (
            <p className="empty-state">No people extracted yet. Analyze a report to get started.</p>
          ) : (
            <ul className="ranked-list">
              {topInfluencers.map((p, i) => (
                <li key={p.id} className="ranked-item">
                  <span className="ranked-index">{i + 1}</span>
                  <div className="ranked-body">
                    <span className="ranked-name">{p.name}</span>
                    <span className="ranked-meta">{p.role || 'role unknown'}</span>
                  </div>
                  <span className="badge badge-accent">{p.connectionCount} links</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel">
          <h2>Risk Flags</h2>
          {flaggedReports.length === 0 ? (
            <p className="empty-state">No risk flags raised yet.</p>
          ) : (
            <ul className="flag-list">
              {flaggedReports.map((r) => (
                <li key={r.id} className="flag-item">
                  <div className="flag-item-header">
                    <span className="badge badge-source">{r.sourceType}</span>
                    <span className="flag-item-date">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="flag-item-summary">{r.summary}</p>
                  <div className="flag-tags">
                    {r.riskFlags.map((f, idx) => (
                      <span key={idx} className="tag tag-risk">
                        {f}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
