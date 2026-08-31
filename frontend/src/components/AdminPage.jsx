import React from 'react';
import { useLocation } from 'react-router-dom';

export default function AdminPage() {
  const location = useLocation();
  const operator = location.state?.user || 'Admin';

  const stats = [
    { label: 'Connected units', value: '24' },
    { label: 'Reports ingested', value: '1,280' },
    { label: 'Linked entities', value: '4,379' },
    { label: 'Threat score avg', value: '72%' }
  ];

  const alerts = [
    { name: 'Cross-state merchant network', detail: '9 matched accounts' },
    { name: 'Warehouse surveillance sync', detail: '2 new source uploads' },
    { name: 'Watchlist review queue', detail: '11 pending approvals' }
  ];

  return (
    <div className="role-page">
      <div className="role-header">
        <div>
          <span className="hero-eyebrow">Admin command</span>
          <h1>Operations overview, {operator}</h1>
        </div>
        <span className="role-badge">National desk</span>
      </div>

      <div className="role-grid">
        {stats.map((item) => (
          <div className="role-card" key={item.label}>
            <div className="role-card-value">{item.value}</div>
            <h3>{item.label}</h3>
          </div>
        ))}
      </div>

      <div className="role-panel">
        <h3>Live operational alerts</h3>
        <ul className="list-plain">
          {alerts.map((alert) => (
            <li key={alert.name}>
              <strong>{alert.name}</strong>
              <span>{alert.detail}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
