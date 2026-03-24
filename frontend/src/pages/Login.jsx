import { useState, useEffect } from 'react'
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
            setError('Please enter your credentials.')
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
                setError(data.message || 'Authentication failed. Please check your credentials.')
                setLoading(false)
                return
            }
            finalizeLogin(data)
        } catch (err) {
            console.error(err)
            setError('Network error. Unable to connect to the academic portal.')
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
            setError(`Authorized access only. Role: ${role}`)
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
        }
        if (demos[role]) setCredentials(demos[role])
    }

    return (
        <div className="login-v2-container">
            {/* Background Layer */}
            <div className="login-v2-bg" style={{ backgroundImage: `url(${bgImage})` }}>
                <div className="login-v2-overlay"></div>
            </div>

            <div className="login-v2-content">
                <div className="login-v2-card fade-in-up">
                    <div className="login-v2-header">
                        <img src="/jntugv-logo.png" alt="Logo" className="login-v2-logo" />
                        <h1 className="title-gradient">JNTU-GV</h1>
                        <p className="login-v2-subtitle">Secure Academic Gateway</p>
                    </div>

                    <form onSubmit={handleLogin} className="login-v2-form">
                        {error && (
                            <div className="login-v2-error pulse-soft">
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        <div className={`login-v2-input-wrapper ${activeField === 'email' ? 'active' : ''}`}>
                            <label>Institutional ID</label>
                            <input
                                type="text"
                                name="email"
                                placeholder="Email or Roll Number"
                                value={credentials.email}
                                onChange={handleChange}
                                onFocus={() => setActiveField('email')}
                                onBlur={() => setActiveField('')}
                                required
                            />
                        </div>

                        <div className={`login-v2-input-wrapper ${activeField === 'password' ? 'active' : ''}`}>
                            <label>Password</label>
                            <div className="password-input-row">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="••••••••"
                                    value={credentials.password}
                                    onChange={handleChange}
                                    onFocus={() => setActiveField('password')}
                                    onBlur={() => setActiveField('')}
                                    required
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle">
                                    {showPassword ? '👁️' : '🔒'}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="login-v2-btn" disabled={loading}>
                            {loading ? <div className="spinner-small"></div> : 'Log In to Dashboard'}
                        </button>
                    </form>

                    <div className="login-v2-divider">
                        <span>OR</span>
                    </div>

                    <div className="login-v2-demos">
                        <p>One-Click Access for Evaluation</p>
                        <div className="demo-grid">
                            <button onClick={() => fillDemo('admin')} className="demo-btn admin">Admin Login</button>
                            <button onClick={() => fillDemo('principal')} className="demo-btn">Principal</button>
                            <button onClick={() => fillDemo('hod')} className="demo-btn">HOD</button>
                            <button onClick={() => fillDemo('student1')} className="demo-btn">Student</button>
                        </div>
                    </div>

                    <div className="login-v2-footer">
                        <p>&copy; {new Date().getFullYear()} JNTU-GV Vizianagaram. All rights reserved.</p>
                        <div className="footer-links">
                            <span>Privacy Policy</span>
                            <span>System Support</span>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .login-v2-container {
                    position: relative;
                    width: 100vw;
                    height: 100vh;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Outfit', sans-serif;
                    background: #0f172a;
                }

                .login-v2-bg {
                    position: absolute;
                    inset: 0;
                    background-size: cover;
                    background-position: center;
                    transition: background 1s ease-in-out;
                    filter: saturate(1.2) contrast(1.1);
                }

                .login-v2-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.8) 50%, rgba(15, 23, 42, 0.95) 100%);
                }

                .login-v2-content {
                    position: relative;
                    z-index: 10;
                    width: 100%;
                    max-width: 440px;
                    padding: 20px;
                }

                .login-v2-card {
                    background: rgba(30, 41, 59, 0.45);
                    backdrop-filter: blur(25px) saturate(180%);
                    -webkit-backdrop-filter: blur(25px) saturate(180%);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    border-radius: 32px;
                    padding: 3rem;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
                    text-align: center;
                }

                .login-v2-header {
                    margin-bottom: 2.5rem;
                }

                .login-v2-logo {
                    height: 80px;
                    margin-bottom: 1rem;
                    filter: drop-shadow(0 0 20px rgba(255,255,255,0.15));
                }

                .login-v2-subtitle {
                    color: #94a3b8;
                    font-size: 0.85rem;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    margin-top: 0.5rem;
                    font-weight: 700;
                }

                .login-v2-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .login-v2-error {
                    background: rgba(239, 68, 68, 0.15);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    color: #fca5a5;
                    padding: 0.75rem;
                    border-radius: 12px;
                    font-size: 0.85rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }

                .login-v2-input-wrapper {
                    text-align: left;
                    display: flex;
                    flex-direction: column;
                    gap: 0.6rem;
                    transition: all 0.3s ease;
                }

                .login-v2-input-wrapper label {
                    color: #f8fafc;
                    font-size: 0.85rem;
                    font-weight: 700;
                    margin-left: 0.5rem;
                    letter-spacing: 0.3px;
                }

                .login-v2-input-wrapper input {
                    background: rgba(15, 23, 42, 0.7);
                    border: 1.5px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    padding: 1rem 1.25rem;
                    color: white;
                    font-size: 1rem;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    outline: none;
                }

                .login-v2-input-wrapper.active input {
                    border-color: #7c3aed;
                    background: rgba(15, 23, 42, 0.9);
                    box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.2);
                    transform: translateY(-1px);
                }

                .password-input-row {
                    display: flex;
                    gap: 10px;
                }

                .password-input-row input {
                    flex: 1;
                }

                .password-toggle {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1.5px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    width: 54px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .password-toggle:hover {
                    background: rgba(255, 255, 255, 0.15);
                    border-color: rgba(255, 255, 255, 0.2);
                }

                .login-v2-btn {
                    background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
                    color: white;
                    border: none;
                    padding: 1.1rem;
                    border-radius: 16px;
                    font-size: 1.05rem;
                    font-weight: 800;
                    cursor: pointer;
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    margin-top: 0.8rem;
                    box-shadow: 0 12px 24px -6px rgba(124, 58, 237, 0.4);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .login-v2-btn:hover:not(:disabled) {
                    transform: translateY(-2px) scale(1.01);
                    box-shadow: 0 20px 30px -8px rgba(124, 58, 237, 0.5);
                    filter: brightness(1.1);
                }

                .login-v2-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .login-v2-divider {
                    margin: 2rem 0;
                    position: relative;
                    text-align: center;
                }

                .login-v2-divider::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 0;
                    width: 100%;
                    height: 1px;
                    background: rgba(255, 255, 255, 0.1);
                }

                .login-v2-divider span {
                    position: relative;
                    z-index: 1;
                    background: #1e293b;
                    padding: 0 1rem;
                    color: #64748b;
                    font-size: 0.75rem;
                    font-weight: 700;
                }

                .login-v2-demos {
                    margin-bottom: 2rem;
                }

                .login-v2-demos p {
                    font-size: 0.8rem;
                    color: #94a3b8;
                    margin-bottom: 1rem;
                }

                .demo-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 8px;
                }

                .demo-btn {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    color: #cbd5e1;
                    padding: 0.5rem;
                    border-radius: 10px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .demo-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: rgba(255, 255, 255, 0.2);
                    color: white;
                }

                .demo-btn.admin {
                   border-color: rgba(255, 184, 0, 0.3);
                   color: var(--brand-gold);
                }

                .login-v2-footer {
                    margin-top: 1rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    padding-top: 1.5rem;
                }

                .login-v2-footer p {
                    font-size: 0.7rem;
                    color: #64748b;
                    margin-bottom: 0.75rem;
                }

                .footer-links {
                    display: flex;
                    justify-content: center;
                    gap: 1.5rem;
                    font-size: 0.7rem;
                    font-weight: 600;
                    color: #475569;
                }

                .spinner-small {
                    width: 20px;
                    height: 20px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                    margin: 0 auto;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                @media (max-width: 480px) {
                    .login-v2-card {
                        padding: 2.5rem 1.5rem;
                        border-radius: 0;
                        height: 100vh;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        background: #0f172a;
                    }
                }
            `}</style>
        </div>
    )
}

export default Login
