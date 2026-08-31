import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Hero from './components/Hero';
import Dashboard from './components/Dashboard';
import AnalyzeReport from './components/AnalyzeReport';
import NetworkGraph from './components/NetworkGraph';
import PeopleList from './components/PeopleList';
import CaseList from './components/CaseList';
import InvestigatorPage from './components/InvestigatorPage';
import AdminPage from './components/AdminPage';
import './App.css';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Hero />} />
      <Route
        path="/investigator"
        element={
          <Layout>
            <InvestigatorPage />
          </Layout>
        }
      />
      <Route
        path="/admin"
        element={
          <Layout>
            <AdminPage />
          </Layout>
        }
      />
      <Route
        path="/dashboard"
        element={
          <Layout>
            <Dashboard />
          </Layout>
        }
      />
      <Route
        path="/analyze"
        element={
          <Layout>
            <AnalyzeReport />
          </Layout>
        }
      />
      <Route
        path="/graph"
        element={
          <Layout>
            <NetworkGraph />
          </Layout>
        }
      />
      <Route
        path="/people"
        element={
          <Layout>
            <PeopleList />
          </Layout>
        }
      />
      <Route
        path="/cases"
        element={
          <Layout>
            <CaseList />
          </Layout>
        }
      />
    </Routes>
  );
}
