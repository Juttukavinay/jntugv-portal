import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';
import '../App.css';

function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/signin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }
            const data = await response.json();
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/dashboard/hod');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="login-container">
            {/* Left Section - Hero/Branding */}
            <div className="login-hero-section" style={{ display: 'flex', flex: 1.2, background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'var(--primary)', filter: 'blur(100px)', opacity: 0.1, animation: 'pulseSoft 10s infinite' }}></div>
                <div style={{ position: 'absolute', bottom: '10%', left: '10%', width: '200px', height: '200px', borderRadius: '50%', background: 'var(--secondary)', filter: 'blur(80px)', opacity: 0.15 }}></div>
                
                <div style={{ position: 'relative', zIndex: 10, padding: '4rem', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '4rem', animation: 'fadeInDown 0.8s ease-out' }}>
                        <img src="/jntugv-logo.png" alt="Logo" style={{ height: '60px', filter: 'drop-shadow(0 4px 10px rgba(255,255,255,0.1))' }} />
                        <div style={{ color: 'white' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>JNTU-GV</div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '2px' }}>Academic Portal</div>
                        </div>
                    </div>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: '900', color: 'white', lineHeight: '1.1', marginBottom: '1.5rem', animation: 'fadeInLeft 1s ease-out' }}>
                        Empowering <span style={{ color: 'var(--primary)' }}>Academic Excellence</span>
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', maxWidth: '500px', animation: 'fadeInUp 1s ease-out 0.2s backwards' }}>
                        Access high-level analytics, automated timetable management, and real-time attendance tracking in one unified interface.
                    </p>
                </div>
                
                <div style={{ position: 'absolute', bottom: '2rem', left: '4rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
                    &copy; {new Date().getFullYear()} JNTU-GV Vizianagaram. All rights reserved.
                </div>
            </div>

            {/* Right Section - Form */}
            <div className="login-form-section" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white' }}>
                <div style={{ width: '100%', maxWidth: '420px', padding: '2rem', animation: 'slideInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent-dark)', marginBottom: '0.5rem' }}>Welcome Back</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Sign in to continue to your dashboard</p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                        {error && (
                            <div style={{ padding: '1rem', background: '#fee2e2', color: '#ef4444', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '600', border: '1px solid #fecaca' }}>
                                ⚠️ {error}
                            </div>
                        )}
                        
                        <div className="input-group">
                            <label className="input-label" style={{ fontWeight: '700' }}>Institutional Email</label>
                            <input
                                className="modern-input"
                                type="email"
                                placeholder="name@jntugv.edu.in"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{ borderRadius: '14px', padding: '1rem' }}
                            />
                        </div>

                        <div className="input-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <label className="input-label" style={{ margin: 0, fontWeight: '700' }}>Secure Password</label>
                                <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}>Forgot?</span>
                            </div>
                            <input
                                className="modern-input"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{ borderRadius: '14px', padding: '1rem' }}
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="btn-primary" 
                            style={{ padding: '1.1rem', borderRadius: '14px', fontSize: '1rem', fontWeight: '700', marginTop: '1rem', boxShadow: '0 10px 25px rgba(79, 70, 229, 0.3)' }}
                        >
                            Log In to Portal
                        </button>
                    </form>

                    <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Need priority access? <span style={{ color: 'var(--primary)', fontWeight: '700', cursor: 'pointer' }}>Contact Admin</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignIn;