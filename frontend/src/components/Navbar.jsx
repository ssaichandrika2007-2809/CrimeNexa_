import React from 'react';
import { NavLink } from 'react-router-dom';

const LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/analyze', label: 'Analyze Report' },
  { to: '/graph', label: 'Network Graph' },
  { to: '/people', label: 'People' },
  { to: '/cases', label: 'Cases' }
];

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span className="navbar-mark">CG</span>
        <span className="navbar-title">CrimeGraph</span>
      </div>
      <nav className="navbar-links">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => 'navbar-link' + (isActive ? ' navbar-link-active' : '')}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
