import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import PrincipalDashboard from './pages/dashboard/PrincipalDashboard'
import VicePrincipalDashboard from './pages/dashboard/VicePrincipalDashboard'
import FacultyDashboard from './pages/dashboard/FacultyDashboard'
import HodDashboard from './pages/dashboard/HodDashboard'
import StudentDashboard from './pages/dashboard/StudentDashboard'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard/principal" element={<PrincipalDashboard />} />
        <Route path="/dashboard/vice-principal" element={<VicePrincipalDashboard />} />
        <Route path="/dashboard/faculty" element={<FacultyDashboard />} />
        <Route path="/dashboard/hod" element={<HodDashboard />} />
        <Route path="/dashboard/student" element={<StudentDashboard />} />
      </Routes>
    </Router>
  )
}

export default App
