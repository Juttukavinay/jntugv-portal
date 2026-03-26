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
        const { role, name, email: userEmail, semester, dept, department: deptField } = data
        const user = { email: userEmail, role, name, semester, department: dept || deptField || '' }
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

    const fillDemoAndLogin = async (role) => {
        const demos = {
            admin: { email: 'admin@jntugv.edu', password: 'Admin@JNTUGV#2026!Secured' },
            principal: { email: 'principal@jntugv.edu', password: 'Jntugv@2024' },
            vice_principal: { email: 'viceprincipal@jntugv.edu', password: 'Jntugv@2024' },
            hod: { email: 'drch1@jntugv.edu.in', password: '9876543201' },
            fac_sri: { email: 'SRI1@GMAIL.COM', password: '741852963' },
            fac_kiran: { email: 'KIRAN@GMAIL.COM', password: '741852963' },
            fac_jaya: { email: 'dr2@jntugv.edu.in', password: '9876543202' },
            fac_madhavi: { email: 'drg.3@jntugv.edu.in', password: '9876543203' },
            fac_tirimula: { email: 'drb.4@jntugv.edu.in', password: '9876543204' },
            fac_anil: { email: 'mranilwurity5@jntugv.edu.in', password: '9876543205' },
            fac_srikanth: { email: 'ksrikanth8@jntugv.edu.in', password: '9876543208' },
            fac_roje: { email: 'rrojespandana9@jntugv.edu.in', password: '9876543209' },
            fac_manasa: { email: 'bmanasa11@jntugv.edu.in', password: '9876543211' },
            fac_madhumita: { email: 'madhumita12@jntugv.edu.in', password: '9876543212' },
            student1: { email: '24131A0501', password: 'password' },
            student2: { email: '23131A0501', password: 'password' },
            student3: { email: '22131A0501', password: 'password' },
            student4: { email: '21131A0501', password: 'password' },
        }
        if (demos[role]) {
            setCredentials(demos[role])
            // Auto Login
            setLoading(true)
            setError('')
            try {
                const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(demos[role])
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

                    <div className="login-v2-demos" style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: '10px' }}>
                        <p style={{ fontWeight: 600, color: '#444', position: 'sticky', top: 0, background: '#fff', paddingBottom: '10px', margin: 0, zIndex: 2 }}>Select Demo Role for Instant Login</p>
                        <div className="demo-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '10px' }}>
                            <button onClick={() => fillDemoAndLogin('admin')} className="demo-btn admin">Admin</button>
                            <button onClick={() => fillDemoAndLogin('principal')} className="demo-btn admin">Principal</button>
                            <button onClick={() => fillDemoAndLogin('vice_principal')} className="demo-btn admin">Vice Principal</button>
                            
                            <button onClick={() => fillDemoAndLogin('hod')} className="demo-btn admin">HOD (Dr. Bindu)</button>
                            <button onClick={() => fillDemoAndLogin('fac_sri')} className="demo-btn fac">Sri</button>
                            <button onClick={() => fillDemoAndLogin('fac_kiran')} className="demo-btn fac">Kiran</button>
                            <button onClick={() => fillDemoAndLogin('fac_jaya')} className="demo-btn fac">Dr. Jaya Suma</button>
                            <button onClick={() => fillDemoAndLogin('fac_madhavi')} className="demo-btn fac">Dr. Madhavi</button>
                            <button onClick={() => fillDemoAndLogin('fac_tirimula')} className="demo-btn fac">Dr. Tirimula Rao</button>
                            <button onClick={() => fillDemoAndLogin('fac_anil')} className="demo-btn fac">Mr. Anil Wurity</button>
                            <button onClick={() => fillDemoAndLogin('fac_srikanth')} className="demo-btn fac">K. Srikanth</button>
                            <button onClick={() => fillDemoAndLogin('fac_roje')} className="demo-btn fac">R. Roje Spandana</button>
                            <button onClick={() => fillDemoAndLogin('fac_manasa')} className="demo-btn fac">B. Manasa</button>
                            <button onClick={() => fillDemoAndLogin('fac_madhumita')} className="demo-btn fac">Madhumita Chanda</button>

                            <button onClick={() => fillDemoAndLogin('student1')} className="demo-btn stu">1st Yr Stu</button>
                            <button onClick={() => fillDemoAndLogin('student2')} className="demo-btn stu">2nd Yr Stu</button>
                            <button onClick={() => fillDemoAndLogin('student3')} className="demo-btn stu">3rd Yr Stu</button>
                            <button onClick={() => fillDemoAndLogin('student4')} className="demo-btn stu">4th Yr Stu</button>
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
                    font-family: 'Inter', sans-serif;
                    background: #f4f6f9;
                }

                .login-v2-bg {
                    position: absolute;
                    inset: 0;
                    background-size: cover;
                    background-position: center;
                    transition: background 1s ease-in-out;
                    filter: saturate(1) contrast(1);
                    opacity: 0.8;
                }

                .login-v2-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(255, 255, 255, 0.85);
                }

                .login-v2-content {
                    position: relative;
                    z-index: 10;
                    width: 100%;
                    max-width: 500px;
                    padding: 20px;
                }

                .login-v2-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 3rem;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
                    text-align: center;
                    color: #1e293b;
                }

                .login-v2-header {
                    margin-bottom: 2.5rem;
                }

                .login-v2-logo {
                    height: 80px;
                    margin-bottom: 1rem;
                }

                .login-v2-subtitle {
                    color: #64748b;
                    font-size: 0.85rem;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    margin-top: 0.5rem;
                    font-weight: 700;
                }

                .title-gradient {
                    color: #0f172a;
                    font-family: 'Outfit', sans-serif;
                }

                .login-v2-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .login-v2-error {
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    color: #ef4444;
                    padding: 0.75rem;
                    border-radius: 8px;
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
                    color: #475569;
                    font-size: 0.85rem;
                    font-weight: 700;
                    margin-left: 0.2rem;
                    letter-spacing: 0.3px;
                }

                .login-v2-input-wrapper input {
                    background: #f8fafc;
                    border: 1.5px solid #cbd5e1;
                    border-radius: 8px;
                    padding: 1rem 1.25rem;
                    color: #0f172a;
                    font-size: 1rem;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    outline: none;
                }

                .login-v2-input-wrapper.active input {
                    border-color: #0047AB;
                    background: #ffffff;
                    box-shadow: 0 0 0 4px rgba(0, 71, 171, 0.1);
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
                    background: #f8fafc;
                    border: 1.5px solid #cbd5e1;
                    border-radius: 8px;
                    width: 54px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #475569;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .password-toggle:hover {
                    background: #e2e8f0;
                    border-color: #94a3b8;
                }

                .login-v2-btn {
                    background: #0047AB;
                    color: white;
                    border: none;
                    padding: 1.1rem;
                    border-radius: 8px;
                    font-size: 1.05rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    margin-top: 0.8rem;
                    box-shadow: 0 4px 10px rgba(0, 71, 171, 0.2);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .login-v2-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 15px rgba(0, 71, 171, 0.3);
                    background: #003380;
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
                    background: #e2e8f0;
                }

                .login-v2-divider span {
                    position: relative;
                    z-index: 1;
                    background: #ffffff;
                    padding: 0 1rem;
                    color: #94a3b8;
                    font-size: 0.75rem;
                    font-weight: 700;
                }

                .login-v2-demos {
                    margin-bottom: 2rem;
                }

                .login-v2-demos p {
                    font-size: 0.8rem;
                    color: #64748b;
                    margin-bottom: 1rem;
                }

                .demo-grid {
                    display: grid;
                    grid-template-columns: auto;
                    gap: 8px;
                }

                .demo-btn {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    color: #475569;
                    padding: 0.5rem;
                    border-radius: 6px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .demo-btn:hover {
                    background: #0047AB;
                    border-color: #0047AB;
                    color: white;
                }

                .demo-btn.admin {
                   border-color: #cbd5e1;
                   color: #0f172a;
                   background: #f1f5f9;
                }
                .demo-btn.admin:hover {
                   background: #0f172a;
                   color: #fff;
                }

                .demo-btn.fac {
                   border-color: #cfdbf3;
                   color: #0047AB;
                   background: #eff6ff;
                }
                .demo-btn.fac:hover {
                   background: #0047AB;
                   color: #fff;
                }

                .demo-btn.stu {
                   border-color: #d1fae5;
                   color: #059669;
                   background: #ecfdf5;
                }
                .demo-btn.stu:hover {
                   background: #10b981;
                   color: #fff;
                }

                .login-v2-footer {
                    margin-top: 1rem;
                    border-top: 1px solid #e2e8f0;
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
