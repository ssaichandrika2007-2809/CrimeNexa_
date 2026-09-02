import React, { useEffect, useRef, useState } from 'react';
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = (user?.name || user?.label || 'User')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'U';

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
        <div className="navbar-user" ref={menuRef}>
          <button
            type="button"
            className="account-trigger"
            onClick={() => setMenuOpen((current) => !current)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <span className="account-avatar">{initials}</span>
            <span className="account-name">{user.name}</span>
            <span className="account-caret">▾</span>
          </button>

          {menuOpen && (
            <div className="account-menu" role="menu" aria-label="Account menu">
              <button type="button" className="account-menu-item" onClick={() => {
                setMenuOpen(false);
                navigate('/profile');
              }}>
                Profile
              </button>
              <button type="button" className="account-menu-item" onClick={() => {
                setMenuOpen(false);
                navigate('/dashboard');
              }}>
                Account Settings
              </button>
              <button type="button" className="account-menu-item" onClick={() => {
                setMenuOpen(false);
                navigate('/dashboard');
              }}>
                Activity / Recent Activity
              </button>
              <button type="button" className="account-menu-item danger" onClick={() => {
                setMenuOpen(false);
                logout();
                navigate('/');
              }}>
                Sign Out
              </button>
            </div>
          )}
        </div>
      ) : (
        <button className="btn btn-accent" onClick={() => navigate('/')}>
          Sign in
        </button>
      )}
    </header>
  );
}
