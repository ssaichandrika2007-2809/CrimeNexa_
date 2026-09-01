import React, { useCallback, useEffect, useState } from 'react';
import { fetchGraph, fetchPeople, fetchCases, fetchReports } from '../api';

export default function Dashboard() {
  const [graph, setGraph] = useState({ nodes: [], edges: [] });
  const [people, setPeople] = useState([]);
  const [cases, setCases] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [locationQuery, setLocationQuery] = useState('Old Town Warehouse, Mumbai');
  const [geoState, setGeoState] = useState({
    lat: 19.076,
    lon: 72.8777,
    label: 'Mumbai',
    loading: false,
    error: ''
  });

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

  const geocodeLocation = useCallback(async (query) => {
    if (!query.trim()) {
      return;
    }

    setGeoState((current) => ({ ...current, loading: true, error: '' }));

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}`
      );
      const results = await response.json();
      const match = results?.[0];

      if (!match) {
        setGeoState((current) => ({ ...current, loading: false, error: 'No map match found for that location.' }));
        return;
      }

      setGeoState({
        lat: Number(match.lat),
        lon: Number(match.lon),
        label: match.display_name || query,
        loading: false,
        error: ''
      });
    } catch {
      setGeoState((current) => ({ ...current, loading: false, error: 'Map lookup failed. Please try a different location.' }));
    }
  }, []);

  useEffect(() => {
    geocodeLocation(locationQuery);
  }, [geocodeLocation, locationQuery]);

  const counts = {
    people: graph.nodes.filter((n) => n.group === 'person').length,
    locations: graph.nodes.filter((n) => n.group === 'location').length,
    organizations: graph.nodes.filter((n) => n.group === 'organization').length,
    relationships: graph.edges.length,
    cases: cases.length
  };

  const topInfluencers = people.slice(0, 5);
  const flaggedReports = reports.filter((r) => r.riskFlags && r.riskFlags.length > 0).slice(0, 5);
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${(geoState.lon - 0.04).toFixed(5)}%2C${(geoState.lat - 0.04).toFixed(5)}%2C${(geoState.lon + 0.04).toFixed(5)}%2C${(geoState.lat + 0.04).toFixed(5)}&layer=mapnik&marker=${geoState.lat}%2C${geoState.lon}`;

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

      <div className="panel geo-panel">
        <div className="geo-header">
          <div>
            <h2>Location geocoder</h2>
            <p className="page-subtitle">Map a suspect, warehouse, or incident location to a coordinate.</p>
          </div>
          <div className="geo-search">
            <input
              className="input geo-input"
              value={locationQuery}
              onChange={(event) => setLocationQuery(event.target.value)}
              placeholder="Search a location"
            />
            <button className="btn btn-accent" onClick={() => geocodeLocation(locationQuery)}>
              {geoState.loading ? 'Locating…' : 'Locate'}
            </button>
          </div>
        </div>

        {geoState.error && <p className="page-error">{geoState.error}</p>}

        <div className="geo-meta">
          <strong>{geoState.label}</strong>
          <span>
            {geoState.lat.toFixed(5)}, {geoState.lon.toFixed(5)}
          </span>
        </div>

        <iframe
          title="CrimeGraph location map"
          className="geo-map"
          src={mapUrl}
          loading="lazy"
        />
      </div>
    </div>
  );
}
