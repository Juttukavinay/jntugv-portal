import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Landing from './pages/Landing'
import Login from './pages/Login'
import PrincipalDashboard from './pages/dashboard/PrincipalDashboard'
import VicePrincipalDashboard from './pages/dashboard/VicePrincipalDashboard'
import FacultyDashboard from './pages/dashboard/FacultyDashboard'
import HodDashboard from './pages/dashboard/HodDashboard'
import StudentDashboard from './pages/dashboard/StudentDashboard'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import Departments from './pages/Departments'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

import ErrorBoundary from './components/ErrorBoundary'
import ProgressBar from './components/ProgressBar'
import ChatBot from './components/ChatBot'
import { ToastContainer } from './components/ToastContainer'
import useSSE from './components/useSSE'

function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved && saved !== "undefined" ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  // Initialize SSE for real-time notifications globally
  useSSE(user);

  // Listen for login/logout across the app
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('user');
        setUser(saved && saved !== "undefined" ? JSON.parse(saved) : null);
      } catch { setUser(null); }
    };

    window.addEventListener('storage', handleStorageChange);
    // Custom event for same-window updates (since 'storage' only fires on other windows)
    window.addEventListener('auth-change', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleStorageChange);
    }
  }, []);

  const getDashboardRoute = (role) => {
    const r = role?.toLowerCase().trim();
    if (r === 'admin') return '/dashboard/admin';
    if (r === 'principal') return '/dashboard/principal';
    if (r === 'vice_principal' || r === 'vice-principal') return '/dashboard/vice-principal';
    if (r === 'hod') return '/dashboard/hod';
    if (r === 'faculty') return '/dashboard/faculty';
    if (r === 'student') return '/dashboard/student';
    return '/login';
  };

  return (
    <Router>
      <ProgressBar />
      <ToastContainer />
      <ChatBot />

      <ErrorBoundary>
        <Routes key={user ? 'auth-true' : 'auth-false'}>
          <Route path="/" element={<Landing user={user} />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/login" element={<Login />} />

          <Route path="/dashboard/admin" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/principal" element={
            <ProtectedRoute>
              <PrincipalDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/vice-principal" element={
            <ProtectedRoute>
              <VicePrincipalDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/vice_principal" element={
            <ProtectedRoute>
              <VicePrincipalDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/faculty" element={
            <ProtectedRoute>
              <FacultyDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/hod" element={
            <ProtectedRoute>
              <HodDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/student" element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </ErrorBoundary>
    </Router>
  );
}

export default App
