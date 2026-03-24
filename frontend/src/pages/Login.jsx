import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API_BASE_URL from '../config'
import '../App.css'

function Login() {
    const [credentials, setCredentials] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [bgImage, setBgImage] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [activeField, setActiveField] = useState('')

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
        const randomImg = campusImages[Math.floor(Math.random() * campusImages.length)]
        setBgImage(randomImg)
    }, [])

    const handleChange = (e) => {
        setCredentials(prev => ({ ...prev, [e.target.name]: e.target.value }))
        setError('')
    }

    const handleLogin = async (e) => {
        e.preventDefault()
        if (!credentials.email.trim() || !credentials.password.trim()) {
            setError('Please enter both your ID and password.')
            return
        }
        setLoading(true)
        setError('')

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.message || 'Invalid credentials. Please try again.')
                setLoading(false)
                return
            }
            finalizeLogin(data)
        } catch (err) {
            console.error(err)
            setError('Unable to connect to server. Please check your connection.')
            setLoading(false)
        }
    }

    const finalizeLogin = (data) => {
        const { role, name, email: userEmail, semester } = data
        const user = { email: userEmail, role, name, semester }
        localStorage.setItem('user', JSON.stringify(user))
        window.dispatchEvent(new Event('auth-change'))

        const cleanRole = role ? role.trim().toLowerCase() : ''
        const routes = {
            'admin': '/dashboard/admin',
            'principal': '/dashboard/principal',
            'vice_principal': '/dashboard/vice-principal',
            'hod': '/dashboard/hod',
            'faculty': '/dashboard/faculty',
            'student': '/dashboard/student'
        }

        if (routes[cleanRole]) {
            window.location.href = routes[cleanRole]
        } else {
            setError(`Unknown role: ${role}`)
            setLoading(false)
        }
    }

    const fillDemo = (role) => {
        const demos = {
            admin: { email: 'admin@jntugv.edu', password: 'Admin@JNTUGV#2026!Secured' },
            principal: { email: 'principal@jntugv.edu', password: 'Jntugv@2024' },
            vice_principal: { email: 'viceprincipal@jntugv.edu', password: 'Jntugv@2024' },
            hod: { email: 'drb.4@jntugv.edu.in', password: '9876543204' },
            faculty: { email: 'mranilwurity5@jntugv.edu.in', password: '9876543205' },
            student1: { email: '21131A0501', password: 'password' },
            student2: { email: '23VV5A1201', password: 'password' }
        }
        if (demos[role]) setCredentials(demos[role])
    }

    const demoRoles = [
        { key: 'admin', label: 'Admin' },
        { key: 'principal', label: 'Principal' },
        { key: 'vice_principal', label: 'Vice Principal' },
        { key: 'hod', label: 'HOD' },
        { key: 'faculty', label: 'Faculty' },
        { key: 'student1', label: 'Student (IT)' },
        { key: 'student2', label: 'Student (CSE)' }
    ]

    return (
        <div className="login-dark-wrapper">
            {/* Left Side – Hero Side */}
            <div className="login-hero-side" style={{ backgroundImage: `url("${bgImage}")` }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: 'white', lineHeight: 1.1, marginBottom: '1.5rem' }}>
                        Empowering Digital<br />
                        <span style={{ color: 'var(--brand-gold)' }}>Academic Excellence</span>
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)', maxWidth: '500px', lineHeight: 1.6 }}>
                        Jawaharlal Nehru Technological University - Gurazada, Vizianagaram. A legacy of innovation and engineering brilliance.
                    </p>
                </div>
            </div>

            {/* Right Side – Form Side */}
            <div className="login-form-side">
                <div className="login-glass-card">
                    <Link to="/" className="login-back-btn">
                        <span>←</span> Back to University Home
                    </Link>

                    <div style={{ marginBottom: '2.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <img src="/jntugv-logo.png" alt="Logo" style={{ height: '50px' }} />
                            <div>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: 'white' }}>Sign In</h2>
                                <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: 0 }}>Enter your credentials to access the portal</p>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="login-status-error">
                            <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin}>
                        <div className="login-form-group">
                            <label className="login-label-dark" style={{ color: activeField === 'email' ? 'var(--brand-gold)' : '' }}>
                                Username / Admission No.
                            </label>
                            <div className="login-input-wrapper">
                                <span className="input-icon-dark" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>👤</span>
                                <input
                                    type="text"
                                    name="email"
                                    className="login-input-dark"
                                    placeholder="e.g. 21131A0501"
                                    value={credentials.email}
                                    onChange={handleChange}
                                    onFocus={() => setActiveField('email')}
                                    onBlur={() => setActiveField('')}
                                    style={{ paddingLeft: '3.5rem' }}
                                />
                            </div>
                        </div>

                        <div className="login-form-group">
                            <label className="login-label-dark" style={{ color: activeField === 'password' ? 'var(--brand-gold)' : '' }}>
                                Password
                            </label>
                            <div className="login-input-wrapper">
                                <span className="input-icon-dark" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔒</span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    className="login-input-dark"
                                    placeholder="••••••••"
                                    value={credentials.password}
                                    onChange={handleChange}
                                    onFocus={() => setActiveField('password')}
                                    onBlur={() => setActiveField('')}
                                    style={{ paddingLeft: '3.5rem', paddingRight: '3.5rem' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute', right: '1rem', top: '50%',
                                        transform: 'translateY(-50%)', background: 'none',
                                        border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1.1rem'
                                    }}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn-login-gold" disabled={loading}>
                            {loading ? 'Processing...' : 'Secure Authorization →'}
                        </button>
                    </form>

                    <div style={{ marginTop: '3rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Demo Access</span>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                        </div>
                        <div className="login-demo-grid-dark">
                            {demoRoles.map(role => (
                                <button
                                    key={role.key}
                                    onClick={() => fillDemo(role.key)}
                                    className="login-demo-btn-dark"
                                >
                                    {role.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
