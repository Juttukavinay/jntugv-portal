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
            // Manual login trigger with demo data
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
                    <h2>Institutional Login</h2>
                    <p>Enter your credentials to access the portal</p>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                    {error && <div className="login-error">{error}</div>}
                    
                    <div className={`input-group ${activeField === 'email' ? 'active' : ''}`}>
                        <label>Email / Roll Number</label>
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
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                <div className="demo-section">
                    <p>Select Demo Role for Instant Access</p>
                    <div className="demo-grid">
                        <button onClick={() => fillDemoAndLogin('admin')}>Admin</button>
                        <button onClick={() => fillDemoAndLogin('principal')}>Principal</button>
                        <button onClick={() => fillDemoAndLogin('hod')}>HOD</button>
                        <button onClick={() => fillDemoAndLogin('fac_sri')}>Faculty</button>
                        <button onClick={() => fillDemoAndLogin('student1')}>Student</button>
                    </div>
                </div>

                <style>{`
                    .modal-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(15, 23, 42, 0.7);
                        backdrop-filter: blur(8px);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 2000;
                        animation: fadeIn 0.3s ease;
                    }

                    .modal-card {
                        background: white;
                        width: 100%;
                        max-width: 450px;
                        padding: 3rem;
                        border-radius: 24px;
                        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
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
                        margin-bottom: 2rem;
                    }

                    .modal-logo {
                        height: 60px;
                        margin-bottom: 1rem;
                    }

                    .login-header h2 {
                        margin: 0;
                        font-size: 1.75rem;
                        color: #0f172a;
                    }

                    .login-header p {
                        margin: 0.5rem 0 0;
                        color: #64748b;
                        font-size: 0.95rem;
                    }

                    .login-form {
                        display: flex;
                        flex-direction: column;
                        gap: 1.25rem;
                    }

                    .input-group {
                        display: flex;
                        flex-direction: column;
                        gap: 0.5rem;
                    }

                    .input-group label {
                        font-weight: 700;
                        font-size: 0.85rem;
                        color: #475569;
                    }

                    .input-group input {
                        padding: 0.8rem 1rem;
                        border: 1.5px solid #e2e8f0;
                        border-radius: 12px;
                        font-size: 1rem;
                        outline: none;
                        transition: all 0.2s;
                    }

                    .input-group.active input {
                        border-color: #3b82f6;
                        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                    }

                    .pass-row {
                        display: flex;
                        gap: 10px;
                    }

                    .pass-row input {
                        flex: 1;
                    }

                    .pass-row button {
                        width: 50px;
                        border-radius: 12px;
                        border: 1.5px solid #e2e8f0;
                        background: #f8fafc;
                        cursor: pointer;
                    }

                    .login-btn {
                        background: #3b82f6;
                        color: white;
                        border: none;
                        padding: 1rem;
                        border-radius: 12px;
                        font-weight: 700;
                        font-size: 1rem;
                        cursor: pointer;
                        transition: all 0.2s;
                        margin-top: 0.5rem;
                    }

                    .login-btn:hover {
                        background: #2563eb;
                        transform: translateY(-2px);
                    }

                    .login-error {
                        background: #fef2f2;
                        color: #ef4444;
                        padding: 0.75rem;
                        border-radius: 8px;
                        font-size: 0.85rem;
                        text-align: center;
                    }

                    .demo-section {
                        margin-top: 2rem;
                        padding-top: 2rem;
                        border-top: 1px solid #e2e8f0;
                    }

                    .demo-section p {
                        font-size: 0.85rem;
                        color: #64748b;
                        margin-bottom: 1rem;
                        text-align: center;
                    }

                    .demo-grid {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 8px;
                    }

                    .demo-grid button {
                        padding: 0.5rem;
                        font-size: 0.75rem;
                        border-radius: 6px;
                        border: 1px solid #e2e8f0;
                        background: #f8fafc;
                        cursor: pointer;
                        transition: all 0.2s;
                    }

                    .demo-grid button:hover {
                        background: #eff6ff;
                        border-color: #3b82f6;
                        color: #3b82f6;
                    }

                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }

                    @keyframes slideUp {
                        from { transform: translateY(20px); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }
                `}</style>
            </div>
        </div>
    )
}

export default LoginModal
