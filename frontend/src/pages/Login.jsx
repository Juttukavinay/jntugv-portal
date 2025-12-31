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
            principal: { email: 'principal@jntugv.edu', password: '9701458518' },
            vice_principal: { email: 'viceprincipal@jntugv.edu', password: '9701458518' },
            hod: { email: 'chbindumadhuri@jntugv.edu', password: '9701458518' },
            faculty: { email: 'btirimularao@jntugv.edu', password: '9701458518' },
            student: { email: '23vv5a1270', password: 'password' }
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
                        Welcome to <br />
                        <span className="gradient-text">Digital Campus</span>
                    </h1>
                    <p className="hero-subtitle">
                        Seamlessly manage academics, timetables, and university resources in one unified platform.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="login-form-section">
                <div className="login-form-wrapper">
                    <div className="brand-header">
                        <img src="/jntugv-logo.png" alt="JNTU-GV Logo" className="brand-logo" />
                        <div className="brand-text">
                            <h1>JNTU-GV</h1>
                            <p>Vizianagaram</p>
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <h2 className="form-title">Sign In</h2>
                        <p className="form-subtitle">Please enter your credentials to continue.</p>
                    </div>

                    <form onSubmit={handleLogin}>
                        {error && (
                            <div className="error-banner">
                                <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                                {error}
                            </div>
                        )}

                        <div className="input-group">
                            <label className="input-label">Email Address / ID</label>
                            <input
                                type="text"
                                name="email"
                                className="modern-input"
                                placeholder="e.g. 21131A0501"
                                value={credentials.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="input-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <label className="input-label" style={{ marginBottom: 0 }}>Password</label>
                                <a href="#" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '500' }}>Forgot Password?</a>
                            </div>
                            <input
                                type="password"
                                name="password"
                                className="modern-input"
                                placeholder="••••••••"
                                value={credentials.password}
                                onChange={handleChange}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                        >
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="demo-login-section">
                        <div className="divider">
                            <div className="divider-line"></div>
                            <span>Quick Demo Login</span>
                            <div className="divider-line"></div>
                        </div>
                        <div className="demo-grid">
                            <button onClick={() => fillDemo('principal')} className="demo-btn">Principal</button>
                            <button onClick={() => fillDemo('vice_principal')} className="demo-btn">Vice Principal</button>
                            <button onClick={() => fillDemo('hod')} className="demo-btn">HOD (IT)</button>
                            <button onClick={() => fillDemo('faculty')} className="demo-btn">Faculty</button>
                            <button onClick={() => fillDemo('student')} className="demo-btn">Student</button>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        © 2024 JNTU-GV. All rights reserved.
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
