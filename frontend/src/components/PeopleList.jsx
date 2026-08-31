import React, { useEffect, useState } from 'react';
import { fetchPeople } from '../api';

export default function PeopleList() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPeople()
      .then(setPeople)
      .catch(() => setError('Could not reach the backend. Is it running?'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1>People</h1>
        <p className="page-subtitle">Every individual extracted, ranked by number of connections.</p>
      </div>

      <div className="panel">
        {loading && <p className="empty-state">Loading…</p>}
        {error && <p className="page-error">{error}</p>}
        {!loading && !error && people.length === 0 && (
          <p className="empty-state">No people extracted yet. Analyze a report to get started.</p>
        )}

        {people.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Connections</th>
                <th>Mentions</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {people.map((p) => (
                <tr key={p.id}>
                  <td className="table-name">{p.name}</td>
                  <td>{p.role || <span className="text-faint">—</span>}</td>
                  <td>
                    <span className="badge badge-accent">{p.connectionCount}</span>
                  </td>
                  <td className="mono">{p.mentions}</td>
                  <td className="table-notes">{p.notes || <span className="text-faint">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
