
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { CampaignProvider } from './context/CampaignContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import EmailFlow from './components/EmailFlow';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import './App.css';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { authState } = React.useContext(AuthContext);
  
  if (authState.loading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <CampaignProvider>
        <Router>
          <div className="app">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/email-flow" 
                  element={
                    <ProtectedRoute>
                      <EmailFlow />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/email-flow/:id" 
                  element={
                    <ProtectedRoute>
                      <EmailFlow />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CampaignProvider>
    </AuthProvider>
  );
};

export default App;
