import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Hero from './components/Hero';
import Dashboard from './components/Dashboard';
import AnalyzeReport from './components/AnalyzeReport';
import NetworkGraph from './components/NetworkGraph';
import PeopleList from './components/PeopleList';
import CaseList from './components/CaseList';
import InvestigatorPage from './components/InvestigatorPage';
import AdminPage from './components/AdminPage';
import ProfilePage from './components/ProfilePage';
import './App.css';

const AUTH_KEY = 'crimegraph-user';
const demoAccounts = {
  investigator: { username: 'investigator@crimegraph.in', password: 'investigator123', label: 'Investigator' },
  admin: { username: 'admin@crimegraph.in', password: 'admin123', label: 'Administrator' }
};

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('Auth context is not available');
  }
  return context;
}

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      demoAccounts,
      login: ({ role, username, password }) => {
        const account = demoAccounts[role];
        if (!account) {
          return { ok: false, message: 'Select a valid role.' };
        }

        if (username.trim() !== account.username || password !== account.password) {
          return { ok: false, message: 'Invalid username or password for the selected role.' };
        }

        const nextUser = {
          role,
          username: account.username,
          name: role === 'admin' ? 'Administrator' : 'Inspector Verma',
          label: account.label
        };

        setUser(nextUser);
        return { ok: true, user: nextUser };
      },
      logout: () => setUser(null)
    }),
    [user]
  );

  return (
    <AuthContext.Provider value={value}>
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route
          path="/investigator"
          element={
            <ProtectedRoute allowedRoles={['investigator']}>
              <Layout>
                <InvestigatorPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <AdminPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['investigator', 'admin']}>
              <Layout>
                <ProfilePage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['investigator', 'admin']}>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analyze"
          element={
            <ProtectedRoute allowedRoles={['investigator', 'admin']}>
              <Layout>
                <AnalyzeReport />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/graph"
          element={
            <ProtectedRoute allowedRoles={['investigator', 'admin']}>
              <Layout>
                <NetworkGraph />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/people"
          element={
            <ProtectedRoute allowedRoles={['investigator', 'admin']}>
              <Layout>
                <PeopleList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cases"
          element={
            <ProtectedRoute allowedRoles={['investigator', 'admin']}>
              <Layout>
                <CaseList />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthContext.Provider>
  );
}
