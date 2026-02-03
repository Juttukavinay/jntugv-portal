import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API_BASE_URL from '../config'
import '../App.css'

function Login() {
    const navigate = useNavigate()
    const [credentials, setCredentials] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleChange = (e) => {
        setCredentials(prev => ({ ...prev, [e.target.name]: e.target.value }))
        setError('')
    }

    const handleLogin = async (e) => {
        e.preventDefault()

        if (!credentials.email.trim() || !credentials.password.trim()) {
            setError('Please enter both Email/Student ID and Password.')
            return
        }

        setLoading(true)
        setError('')

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Login Failed')
                setLoading(false)
                return;
            }

            finalizeLogin(data);

        } catch (err) {
            console.error(err);
            setError('Unable to connect to server')
            setLoading(false)
        }
    }

    const finalizeLogin = (data) => {
        const { role, name, email: userEmail, semester } = data;
        const user = { email: userEmail, role, name, semester };
        localStorage.setItem('user', JSON.stringify(user));

        const cleanRole = role ? role.trim().toLowerCase() : '';
        const routes = {
            'admin': '/dashboard/admin',
            'principal': '/dashboard/principal',
            'vice_principal': '/dashboard/vice-principal',
            'hod': '/dashboard/hod',
            'faculty': '/dashboard/faculty',
            'student': '/dashboard/student'
        }

        if (routes[cleanRole]) {
            navigate(routes[cleanRole])
        } else {
            setError(`Unknown Role: ${role}`)
            setLoading(false)
        }
    }

    const fillDemo = (role) => {
        const demos = {
            admin: { email: 'admin@jntugv.edu', password: 'Admin@JNTUGV#2026!Secured' },
            principal: { email: 'principal@jntugv.edu', password: 'Jntugv@2024' },
            vice_principal: { email: 'viceprincipal@jntugv.edu', password: 'Jntugv@2024' },
            hod: { email: 'drch1@jntugv.edu.in', password: '9876543201' },
            faculty: { email: 'mranilwurity5@jntugv.edu.in', password: '9876543205' },
            student: { email: '23vv5a1201@jntugv.edu', password: 'password' }
        }
        if (demos[role]) setCredentials(demos[role])
    }

    return (
        <div className="login-container">
            {/* Left Side - Image (Hidden on Mobile) */}
            <div className="login-hero-section">
                <div className="login-hero-overlay"></div>
                <div className="hero-content">
                    <h1 className="hero-title">
                        Jawaharlal Nehru <br />
                        <span className="gradient-text">Technological University</span>
                    </h1>
                    <p className="hero-subtitle">
                        Vizianagaram Campus - Smart Academic Management Portal
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="login-form-section">
                <div className="login-form-wrapper">
                    <div className="brand-header">
                        <img src="/jntugv-logo.png" alt="JNTU-GV Logo" className="brand-logo" />
                        <div className="brand-text">
                            <h1 style={{ letterSpacing: '2px' }}>JNTU-G V</h1>
                            <p style={{ textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 'bold' }}>Excellence in Technology</p>
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <h2 className="form-title">Secure Login</h2>
                        <p className="form-subtitle">Access your academic and administrative dashboard.</p>
                    </div>

                    <form onSubmit={handleLogin}>
                        {error && (
                            <div className="error-banner" style={{ marginBottom: '1.5rem' }}>
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="input-group">
                            <label className="input-label">Username / Roll No</label>
                            <input
                                type="text"
                                name="email"
                                className="modern-input"
                                placeholder="Enter your ID"
                                value={credentials.email}
                                onChange={handleChange}
                                style={{ background: 'rgba(255,255,255,0.5)' }}
                            />
                        </div>

                        <div className="input-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <label className="input-label" style={{ marginBottom: 0 }}>Authentication Secret</label>
                            </div>
                            <input
                                type="password"
                                name="password"
                                className="modern-input"
                                placeholder="••••••••"
                                value={credentials.password}
                                onChange={handleChange}
                                style={{ background: 'rgba(255,255,255,0.5)' }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                            style={{ padding: '1.2rem', fontSize: '1.1rem', marginTop: '1.5rem' }}
                        >
                            {loading ? 'Verifying...' : 'Authorize Access'}
                        </button>
                    </form>

                    <div className="demo-login-section">
                        <div className="divider" style={{ marginBottom: '1.5rem' }}>
                            <div className="divider-line" style={{ background: 'rgba(0,0,0,0.1)' }}></div>
                            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', color: '#64748b' }}>Quick Access Protocols</span>
                            <div className="divider-line" style={{ background: 'rgba(0,0,0,0.1)' }}></div>
                        </div>
                        <div className="demo-grid">
                            <button onClick={() => fillDemo('admin')} className="demo-btn" style={{ background: '#0f172a', color: 'white', border: 'none' }}>Admin System</button>
                            <button onClick={() => fillDemo('principal')} className="demo-btn">Principal</button>
                            <button onClick={() => fillDemo('hod')} className="demo-btn">HOD Office</button>
                            <button onClick={() => fillDemo('faculty')} className="demo-btn">Faculty Portal</button>
                            <button onClick={() => fillDemo('student')} className="demo-btn">Student Desk</button>
                        </div>
                    </div>

                    <div style={{ marginTop: '3rem', textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '1.5rem' }}>
                        &copy; {new Date().getFullYear()} Jawaharlal Nehru Technological University Gurajada Vizianagaram. All rights secured.
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
