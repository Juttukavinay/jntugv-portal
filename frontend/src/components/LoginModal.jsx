import { useState, useEffect } from 'react'
import API_BASE_URL from '../config'

function LoginModal({ isOpen, onClose }) {
    const [credentials, setCredentials] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [activeField, setActiveField] = useState('')

    if (!isOpen) return null;

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
            setError('Network error. Unable to connect.')
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
            setLoading(true)
            try {
                const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(demos[role])
                })
                const data = await res.json()
                if (res.ok) finalizeLogin(data)
                else {
                    setError(data.message || 'Demo login failed')
                    setLoading(false)
                }
            } catch (err) {
                setError('Network error')
                setLoading(false)
            }
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-card" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>&times;</button>
                <div className="login-header">
                    <img src="/jntugv-logo.png" alt="Logo" className="modal-logo" />
                    <h2>Secure Login</h2>
                    <p>Access JNTU-GV Academic Portal</p>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                    {error && <div className="login-error">{error}</div>}
                    
                    <div className={`input-group ${activeField === 'email' ? 'active' : ''}`}>
                        <label>ID / Email</label>
                        <input
                            type="text"
                            name="email"
                            value={credentials.email}
                            onChange={handleChange}
                            onFocus={() => setActiveField('email')}
                            onBlur={() => setActiveField('')}
                            required
                        />
                    </div>

                    <div className={`input-group ${activeField === 'password' ? 'active' : ''}`}>
                        <label>Password</label>
                        <div className="pass-row">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={credentials.password}
                                onChange={handleChange}
                                onFocus={() => setActiveField('password')}
                                onBlur={() => setActiveField('')}
                                required
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? '👁️' : '🔒'}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Authenticating...' : 'Sign In to Portal'}
                    </button>
                </form>

                <div className="demo-section">
                    <p style={{ fontWeight: 800, color: '#0f172a', marginBottom: '1.2rem' }}>Quick Demo Access</p>
                    
                    <div className="demo-category">
                        <span>ADMINISTRATION</span>
                        <div className="demo-grid">
                            <button onClick={() => fillDemoAndLogin('admin')}>Admin</button>
                            <button onClick={() => fillDemoAndLogin('principal')}>Principal</button>
                            <button onClick={() => fillDemoAndLogin('vice_principal')}>Vice Principal</button>
                            <button onClick={() => fillDemoAndLogin('fac_tirimula')}>Dr. Tirimula Rao (HOD)</button>
                        </div>
                    </div>

                    <div className="demo-category">
                        <span>FACULTY SUITE</span>
                        <div className="demo-grid fac">
                            <button onClick={() => fillDemoAndLogin('fac_sri')}>Sri</button>
                            <button onClick={() => fillDemoAndLogin('fac_kiran')}>Kiran</button>
                            <button onClick={() => fillDemoAndLogin('fac_jaya')}>Dr. Jaya</button>
                            <button onClick={() => fillDemoAndLogin('fac_madhavi')}>Dr. Madhavi</button>
                            <button onClick={() => fillDemoAndLogin('hod')}>Dr. Bindu</button>
                            <button onClick={() => fillDemoAndLogin('fac_anil')}>Mr. Anil</button>
                            <button onClick={() => fillDemoAndLogin('fac_srikanth')}>K. Srikanth</button>
                            <button onClick={() => fillDemoAndLogin('fac_roje')}>R. Roje</button>
                            <button onClick={() => fillDemoAndLogin('fac_manasa')}>B. Manasa</button>
                            <button onClick={() => fillDemoAndLogin('fac_madhumita')}>Madhumita</button>
                        </div>
                    </div>

                    <div className="demo-category">
                        <span>STUDENTS (4 YEARS)</span>
                        <div className="demo-grid stu">
                            <button onClick={() => fillDemoAndLogin('student1')}>1st Yr</button>
                            <button onClick={() => fillDemoAndLogin('student2')}>2nd Yr</button>
                            <button onClick={() => fillDemoAndLogin('student3')}>3rd Yr</button>
                            <button onClick={() => fillDemoAndLogin('student4')}>4th Yr</button>
                        </div>
                    </div>
                </div>

                <style>{`
                    .modal-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(15, 23, 42, 0.85);
                        backdrop-filter: blur(12px);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 2000;
                        animation: fadeIn 0.3s ease;
                    }

                    .modal-card {
                        background: white;
                        width: 95%;
                        max-width: 580px;
                        max-height: 90vh;
                        overflow-y: auto;
                        padding: 3.5rem;
                        border-radius: 28px;
                        box-shadow: 0 35px 70px -15px rgba(0, 0, 0, 0.5);
                        position: relative;
                        animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    }

                    .close-btn {
                        position: absolute;
                        top: 1.5rem;
                        right: 1.5rem;
                        background: none;
                        border: none;
                        font-size: 2rem;
                        cursor: pointer;
                        color: #94a3b8;
                    }

                    .login-header {
                        text-align: center;
                        margin-bottom: 2.5rem;
                    }

                    .modal-logo {
                        height: 70px;
                        margin-bottom: 1.2rem;
                    }

                    .login-header h2 {
                        margin: 0;
                        font-size: 2rem;
                        color: #0c1e3a;
                        font-weight: 800;
                    }

                    .login-header p {
                        margin: 0.5rem 0 0;
                        color: #64748b;
                        font-size: 1rem;
                    }

                    .login-form {
                        display: flex;
                        flex-direction: column;
                        gap: 1.5rem;
                    }

                    .input-group label {
                        font-weight: 800;
                        font-size: 0.85rem;
                        color: #0c1e3a;
                        display: block;
                        margin-bottom: 0.6rem;
                    }

                    .input-group input {
                        width: 100%;
                        padding: 1.1rem 1.4rem;
                        border: 2px solid #e2e8f0;
                        border-radius: 12px;
                        font-size: 1rem;
                        outline: none;
                        transition: all 0.3s;
                    }

                    .input-group.active input {
                        border-color: #3b82f6;
                        box-shadow: 0 0 0 5px rgba(59, 130, 246, 0.1);
                    }

                    .pass-row {
                        display: flex;
                        gap: 12px;
                    }

                    .pass-row button {
                        width: 60px;
                        border-radius: 12px;
                        border: 2px solid #e2e8f0;
                        background: #f8fafc;
                        cursor: pointer;
                        font-size: 1.2rem;
                    }

                    .login-btn {
                        background: #0c1e3a;
                        color: white;
                        border: none;
                        padding: 1.2rem;
                        border-radius: 12px;
                        font-weight: 800;
                        font-size: 1.1rem;
                        cursor: pointer;
                        transition: all 0.3s;
                        margin-top: 1rem;
                        box-shadow: 0 8px 20px rgba(12, 30, 58, 0.2);
                    }

                    .login-btn:hover {
                        background: #3b82f6;
                        transform: translateY(-3px);
                        box-shadow: 0 12px 25px rgba(59, 130, 246, 0.3);
                    }

                    .demo-section {
                        margin-top: 3rem;
                        padding-top: 2.5rem;
                        border-top: 2px solid #f1f5f9;
                    }

                    .demo-category {
                        margin-bottom: 2rem;
                    }

                    .demo-category span {
                        font-size: 0.75rem;
                        font-weight: 800;
                        color: #64748b;
                        letter-spacing: 1.5px;
                        display: block;
                        margin-bottom: 1rem;
                    }

                    .demo-grid {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 12px;
                    }

                    .demo-grid.fac {
                        grid-template-columns: repeat(3, 1fr);
                    }

                    .demo-grid.stu {
                        grid-template-columns: repeat(4, 1fr);
                    }

                    .demo-grid button {
                        padding: 0.8rem;
                        font-size: 0.85rem;
                        font-weight: 700;
                        border-radius: 10px;
                        border: 1.5px solid #e2e8f0;
                        background: #f8fafc;
                        cursor: pointer;
                        transition: all 0.2s;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }

                    .demo-grid button:hover {
                        background: #0c1e3a;
                        border-color: #0c1e3a;
                        color: white;
                    }

                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }

                    @keyframes slideUp {
                        from { transform: translateY(30px); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }

                    @media (max-width: 600px) {
                        .modal-card { padding: 2rem; }
                        .demo-grid.fac { grid-template-columns: repeat(2, 1fr); }
                        .demo-grid.stu { grid-template-columns: repeat(2, 1fr); }
                    }
                `}</style>
            </div>
        </div>
    )
}

export default LoginModal
