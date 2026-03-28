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
            <div className="login-v2-bg" style={{ backgroundImage: `url(${bgImage})` }}>
                <div className="login-v2-overlay"></div>
            </div>

            <div className="login-v2-content">
                <aside className="login-v2-sidepanel fade-in-up">
                    <div>
                        <p className="login-v2-subtitle" style={{ color: 'rgba(255,255,255,0.72)', marginTop: 0 }}>Academic Cloud Portal</p>
                        <h2>Step into a cleaner glass dashboard experience.</h2>
                        <p>
                            Access classes, timetables, attendance, and notices from one polished workspace built for students,
                            faculty, HODs, and university leadership.
                        </p>
                        <ul>
                            <li>Unified dashboard for every academic role</li>
                            <li>Live notices, timetable views, and analytics</li>
                            <li>Fast demo access for reviews and testing</li>
                        </ul>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.75rem' }}>
                        <div className="login-v2-stat">
                            <strong>6</strong>
                            <span>Role portals</span>
                        </div>
                        <div className="login-v2-stat">
                            <strong>24/7</strong>
                            <span>Access</span>
                        </div>
                        <div className="login-v2-stat">
                            <strong>1</strong>
                            <span>Campus hub</span>
                        </div>
                    </div>
                </aside>

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
                        <p className="login-v2-demo-title" style={{ position: 'sticky', top: 0, background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(12px)', paddingBottom: '10px', margin: 0, zIndex: 2 }}>
                            Select Demo Role for Instant Login
                        </p>
                        <div className="demo-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '10px' }}>
                            <button onClick={() => fillDemoAndLogin('admin')} className="demo-btn admin">Admin</button>
                            <button onClick={() => fillDemoAndLogin('principal')} className="demo-btn admin">Principal</button>
                            <button onClick={() => fillDemoAndLogin('vice_principal')} className="demo-btn admin">Vice Principal</button>
                            
                            <button onClick={() => fillDemoAndLogin('hod')} className="demo-btn admin">HOD (Tirumala Rao)</button>
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
        </div>
    )
}

export default Login
