import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';

const LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/analyze', label: 'Analyze Report' },
  { to: '/graph', label: 'Network Graph' },
  { to: '/people', label: 'People' },
  { to: '/cases', label: 'Cases' }
];

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <img src="/logo.svg" alt="CrimeGraph logo" className="navbar-mark" />
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

      {user ? (
        <div className="navbar-user">
          <div className="navbar-user-info">
            <span className="navbar-user-role">{user.label}</span>
            <strong>{user.name}</strong>
          </div>
          <button className="btn btn-ghost navbar-signout" onClick={() => {
            logout();
            navigate('/');
          }}>
            Sign out
          </button>
        </div>
      ) : (
        <button className="btn btn-accent" onClick={() => navigate('/')}>
          Sign in
        </button>
      )}
    </header>
  );
}
