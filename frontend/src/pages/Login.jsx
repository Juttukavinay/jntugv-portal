import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import API_BASE_URL from '../config'
import '../App.css'

function Login() {
    const navigate = useNavigate()
    const [credentials, setCredentials] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [bgImage, setBgImage] = useState('')

    const campusImages = [
        '/jntugv-main-block.png',
        '/jntugv-first-year-block.jpg',
        '/jntugv-library.jpg',
        '/jntugv-dispensary.png',
        '/jntugv-entrance.jpg',
        '/jntugv-board-english.jpg',
        '/jntugv-board-telugu.jpg',
        '/jntugv-building-sign.png'
    ]

    useEffect(() => {
        // Pick a random image from the list on load
        const randomImg = campusImages[Math.floor(Math.random() * campusImages.length)]
        setBgImage(randomImg)
    }, [])

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
        <div className="login-container" style={{ backgroundImage: bgImage ? `url("${bgImage}")` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
            {/* Left Side - Image (Hidden on Mobile) */}
            <div className="login-hero-section" style={{ backgroundImage: bgImage ? `url("${bgImage}")` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
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

                        <div className="divider" style={{ margin: '1.5rem 0' }}>
                            <span style={{ background: 'transparent', padding: '0 10px', color: '#64748b', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Or continue with</span>
                        </div>

                        <button
                            type="button"
                            onClick={() => googleLogin()}
                            style={{
                                width: '100%',
                                padding: '0.8rem',
                                border: '1px solid rgba(0,0,0,0.1)',
                                borderRadius: '12px',
                                background: 'rgba(255,255,255,0.6)',
                                backdropFilter: 'blur(10px)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                color: '#1e293b',
                                fontWeight: '600',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.9)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.6)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" /><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" /><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" /><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" /></svg>
                            Sign in with Google
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
                        &copy; {new Date().getFullYear()} Jawaharlal Nehru Technological University Gurjada Vizianagaram. All rights secured.
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
