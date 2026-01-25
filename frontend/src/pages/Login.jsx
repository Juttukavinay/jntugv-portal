import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
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

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setLoading(true);
                setError('');
                const res = await fetch(`${API_BASE_URL}/api/auth/google-login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: tokenResponse.access_token }),
                });
                const data = await res.json();

                if (!res.ok) {
                    setError(data.message || 'Google Login Failed');
                    setLoading(false);
                    return;
                }

                finalizeLogin(data);
            } catch (err) {
                console.error(err);
                setError('Google Login Error');
                setLoading(false);
            }
        },
        onError: () => {
            setError('Google Login Failed');
            setLoading(false);
        },
    });

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
                            <label className="input-label">Email Address / Student ID</label>
                            <input
                                type="text"
                                name="email"
                                className="modern-input"
                                placeholder="Faculty Email or Student Roll No"
                                value={credentials.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="input-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <label className="input-label" style={{ marginBottom: 0 }}>Password / Mobile Number</label>
                                <a href="#" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '500' }}>Forgot Password?</a>
                            </div>
                            <input
                                type="password"
                                name="password"
                                className="modern-input"
                                placeholder="Password or Mobile Number"
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

                        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                            <a href="#" style={{ color: 'var(--primary)', fontWeight: '500', fontSize: '0.9rem' }}>Use OTP to Login</a>
                        </div>

                        <div className="divider" style={{ margin: '1.5rem 0' }}>
                            <span style={{ background: 'white', padding: '0 10px', color: '#666', fontSize: '0.9rem' }}>Or</span>
                        </div>

                        <button
                            type="button"
                            onClick={() => googleLogin()}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                background: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                color: '#333',
                                fontWeight: '500',
                                transition: 'all 0.2s',
                                marginBottom: '1.5rem'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#f8f9fa'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" /><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" /><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" /><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" /></svg>
                            Sign in with Google
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
