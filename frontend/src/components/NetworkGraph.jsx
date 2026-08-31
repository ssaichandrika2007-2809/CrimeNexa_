import React, { useEffect, useRef, useState } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { fetchGraph } from '../api';

const GROUP_COLORS = {
  person: '#8a6fdf',
  location: '#55b0b9',
  organization: '#e2b25b',
  vehicle: '#7f9ce2',
  phone: '#c98fd0'
};

const LEGEND = [
  { group: 'person', label: 'Person' },
  { group: 'location', label: 'Location' },
  { group: 'organization', label: 'Organization' },
  { group: 'vehicle', label: 'Vehicle' },
  { group: 'phone', label: 'Phone Number' }
];

export default function NetworkGraph() {
  const containerRef = useRef(null);
  const networkRef = useRef(null);
  const [isEmpty, setIsEmpty] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let network;

    fetchGraph()
      .then(({ nodes, edges }) => {
        if (!nodes.length) {
          setIsEmpty(true);
          return;
        }

        const styledNodes = nodes.map((n) => ({
          ...n,
          color: {
            background: GROUP_COLORS[n.group] || '#8b8fa3',
            border: '#12141a',
            highlight: { background: GROUP_COLORS[n.group] || '#8b8fa3', border: '#e8e9ee' }
          },
          font: { color: '#e8e9ee', face: 'IBM Plex Sans', size: 14 },
          shape: 'dot',
          size: 16
        }));

        const data = {
          nodes: new DataSet(styledNodes),
          edges: new DataSet(
            edges.map((e) => ({
              ...e,
              color: { color: '#3a3f4f', highlight: '#8a6fdf' },
              font: { color: '#8b8fa3', size: 11, strokeWidth: 0 },
              smooth: { type: 'continuous' }
            }))
          )
        };

        const options = {
          physics: { stabilization: true, barnesHut: { gravitationalConstant: -6000, springLength: 140 } },
          interaction: { hover: true, tooltipDelay: 120 },
          edges: { arrows: { to: { enabled: false } }, width: 1.5 },
          nodes: { borderWidth: 2 }
        };

        network = new Network(containerRef.current, data, options);
        networkRef.current = network;
      })
      .catch(() => setError('Could not reach the backend. Is it running?'));

    return () => {
      if (network) network.destroy();
    };
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Network Graph</h1>
        <p className="page-subtitle">Every entity and relationship extracted so far, visualized.</p>
      </div>

      <div className="panel graph-panel">
        <div className="legend">
          {LEGEND.map((l) => (
            <div className="legend-item" key={l.group}>
              <span className="legend-dot" style={{ background: GROUP_COLORS[l.group] }} />
              {l.label}
            </div>
          ))}
        </div>

        {error && <p className="page-error">{error}</p>}
        {isEmpty && !error && (
          <p className="empty-state">No graph data yet — analyze a report first.</p>
        )}
        <div ref={containerRef} className="graph-canvas" />
      </div>
    </div>
  );
}
