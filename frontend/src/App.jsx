import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import PrincipalDashboard from './pages/dashboard/PrincipalDashboard'
import VicePrincipalDashboard from './pages/dashboard/VicePrincipalDashboard'
import FacultyDashboard from './pages/dashboard/FacultyDashboard'
import HodDashboard from './pages/dashboard/HodDashboard'
import StudentDashboard from './pages/dashboard/StudentDashboard'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

import ErrorBoundary from './components/ErrorBoundary'
import ProgressBar from './components/ProgressBar'

function App() {
  return (
    <Router>
      <ProgressBar />

      <Routes>
        <Route path="/" element={<Landing />} />
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
    </Router>
  )
}

export default App
