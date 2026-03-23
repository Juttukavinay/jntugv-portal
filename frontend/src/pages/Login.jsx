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
        { key: 'admin', label: '⚙️ Admin', color: '#C5A059' },
        { key: 'principal', label: '🏛️ Principal', color: '#8B5CF6' },
        { key: 'vice_principal', label: '🏛️ Vice Principal', color: '#8B5CF6' },
        { key: 'hod', label: '👨‍💼 HOD', color: '#00C9A7' },
        { key: 'faculty', label: '👨‍🏫 Faculty', color: '#3B82F6' },
        { key: 'student1', label: '🎓 Student (IT)', color: '#F59E0B' },
        { key: 'student2', label: '🎓 Student (CSE)', color: '#EC4899' }
    ]

    return (
        <div className="login-container">
            {/* Left Side – Campus Image */}
            <div
                className="login-hero-section"
                style={{ backgroundImage: bgImage ? `url("${bgImage}")` : 'linear-gradient(135deg, #1F1A12 0%, #C5A059 100%)' }}
            >
                <div className="login-hero-overlay" style={{ background: 'linear-gradient(135deg, rgba(31, 26, 18, 0.9) 0%, rgba(197, 160, 89, 0.2) 100%)' }}></div>
                <div className="hero-content" style={{ padding: '0 10%' }}>
                    {/* University Branding */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
                        background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px',
                        padding: '0.6rem 1.2rem', marginBottom: '2.5rem',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                    }}>
                        <img src="/jntugv-logo.png" alt="Logo" style={{ height: '36px', filter: 'brightness(0) invert(1)' }} />
                        <span style={{ color: 'rgba(255,255,255,0.95)', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.05em' }}>JNTU-GV</span>
                    </div>

                    <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: 'white', lineHeight: 1.1, margin: '0 0 1.5rem 0', letterSpacing: '-0.03em' }}>
                        Jawaharlal Nehru<br />
                        <span style={{
                            background: 'linear-gradient(135deg, #FDFCF8, #C5A059)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>Technological University</span>
                    </h1>

                    <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.85)', margin: '0 0 3rem 0', lineHeight: 1.7, maxWidth: '500px' }}>
                        Empowering innovation and digital excellence through our unified smart academic management ecosystem.
                    </p>

                    {/* Feature pills */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                        {['📊 Live Attendance', '📅 Smart Timetable', '🔒 Secure Access', '📱 Mobile Ready'].map(f => (
                            <div key={f} style={{
                                background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px',
                                padding: '0.5rem 1.2rem', color: 'white', fontSize: '0.85rem', fontWeight: 600,
                                transition: 'all 0.3s ease', cursor: 'default'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                            >{f}</div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side – Login Form */}
            <div className="login-form-section">
                <div className="login-form-wrapper">
                    {/* Back to Home */}
                    <div style={{ marginBottom: '2rem' }}>
                        <Link to="/" style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                            color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500,
                            textDecoration: 'none', transition: 'color 0.2s'
                        }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                        >
                            ← Back to Home
                        </Link>
                    </div>

                    {/* Logo */}
                    <div className="brand-header">
                        <img src="/jntugv-logo.png" alt="JNTU-GV Logo" className="brand-logo" />
                        <div className="brand-text">
                            <h1>JNTU-GV</h1>
                            <p>Academic Portal</p>
                        </div>
                    </div>

                    {/* Headings */}
                    <h2 className="form-title">Welcome back 👋</h2>
                    <p className="form-subtitle">Sign in to access your personalized dashboard.</p>

                    {/* Error Banner */}
                    {error && (
                        <div style={{
                            background: '#FEF2F2', border: '1px solid #FECACA', color: '#EF4444',
                            padding: '0.875rem 1.25rem', borderRadius: '10px', marginBottom: '1.5rem',
                            display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem',
                            animation: 'fadeIn 0.3s ease-out'
                        }}>
                            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                            <span style={{ fontWeight: 500 }}>{error}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleLogin}>
                        {/* Email / ID Field */}
                        <div className="input-group">
                            <label className="input-label" style={{ color: activeField === 'email' ? 'var(--primary)' : '' }}>
                                Username / Roll Number
                            </label>
                            <div style={{ position: 'relative' }}>
                                <span style={{
                                    position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                                    fontSize: '1rem', opacity: 0.5
                                }}>👤</span>
                                <input
                                    type="text"
                                    name="email"
                                    className="modern-input"
                                    placeholder="Enter your ID or email"
                                    value={credentials.email}
                                    onChange={handleChange}
                                    onFocus={() => setActiveField('email')}
                                    onBlur={() => setActiveField('')}
                                    style={{ paddingLeft: '3rem' }}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="input-group">
                            <label className="input-label" style={{ color: activeField === 'password' ? 'var(--primary)' : '' }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <span style={{
                                    position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                                    fontSize: '1rem', opacity: 0.5
                                }}>🔒</span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    className="modern-input"
                                    placeholder="••••••••"
                                    value={credentials.password}
                                    onChange={handleChange}
                                    onFocus={() => setActiveField('password')}
                                    onBlur={() => setActiveField('')}
                                    style={{ paddingLeft: '3rem', paddingRight: '3rem' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute', right: '1rem', top: '50%',
                                        transform: 'translateY(-50%)', background: 'none',
                                        border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '1rem'
                                    }}
                                    title={showPassword ? 'Hide' : 'Show'}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                            style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', fontWeight: 700, marginTop: '0.5rem' }}
                        >
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    <span style={{
                                        width: '18px', height: '18px', border: '3px solid rgba(255,255,255,0.3)',
                                        borderTop: '3px solid white', borderRadius: '50%',
                                        display: 'inline-block', animation: 'spin 1s linear infinite'
                                    }} />
                                    Signing in...
                                </span>
                            ) : 'Sign In →'}
                        </button>
                    </form>

                    {/* Demo Logins */}
                    <div className="demo-login-section">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                                Quick Demo Access
                            </span>
                            <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
                            {demoRoles.map(role => (
                                <button
                                    key={role.key}
                                    onClick={() => fillDemo(role.key)}
                                    style={{
                                        padding: '0.625rem 0.5rem',
                                        background: 'white',
                                        border: '1.5px solid var(--border-light)',
                                        borderRadius: '10px',
                                        color: 'var(--text-secondary)',
                                        fontSize: '0.78rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.25s',
                                        textAlign: 'center',
                                        lineHeight: 1.3
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = role.color
                                        e.currentTarget.style.color = role.color
                                        e.currentTarget.style.background = `${role.color}12`
                                        e.currentTarget.style.transform = 'translateY(-2px)'
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = 'var(--border-light)'
                                        e.currentTarget.style.color = 'var(--text-secondary)'
                                        e.currentTarget.style.background = 'white'
                                        e.currentTarget.style.transform = 'translateY(0)'
                                    }}
                                >
                                    {role.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
                        © {new Date().getFullYear()} JNTU-GV — Dept. of Information Technology
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}

export default Login
