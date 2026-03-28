import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import API_BASE_URL from '../config'
import '../App.css'

function Landing() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/departments`).catch(() => null)
    }, [])

    return (
        <div className="edubin-layout">
            <nav className="edubin-navbar">
                <div className="edu-logo">
                    <img src="/jntugv-logo.png" alt="JNTU-GV" />
                    <h2>JNTU-GV</h2>
                </div>
                <div className="edu-links desktop-only">
                    <Link to="/" className="active">HOME</Link>
                    <Link to="/about">ABOUT</Link>
                    <Link to="/departments">DEPARTMENTS</Link>
                </div>
                <div className="edu-actions desktop-only">
                    <Link to="/login" className="edu-btn primary">Login</Link>
                    <Link to="/login" className="edu-btn secondary">Sign In</Link>
                </div>
                <button
                    className="mobile-toggle"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? 'X' : '☰'}
                </button>
            </nav>

            {isMobileMenuOpen && (
                <div className="mobile-menu">
                    <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>HOME</Link>
                    <Link to="/login" className="btn-mobile" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                </div>
            )}

            <main>
                <section
                    className="edubin-hero"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(10, 30, 60, 0.4), rgba(10, 30, 60, 0.7)), url("/jntugv-main-block.png")'
                    }}
                >
                    <div className="hero-content-container fade-in-up">
                        <h1 className="hero-heading">Elevate your future with<br />premium education</h1>
                        <p className="hero-paragraph">
                            Join India's premier technological university for innovation-driven research and academic brilliance.
                            Step into a world where education meets excellence, preparing you for global challenges.
                        </p>
                        <div className="hero-buttons">
                            <Link to="/departments" className="edu-btn primary">Explore Courses</Link>
                            <Link to="/login" className="edu-btn secondary">Get Started</Link>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="footer-university glass-footer">
                <div className="footer-grid-univ glass-footer-grid">
                    <div className="footer-col">
                        <div className="footer-brand">
                            <img src="/jntugv-logo.png" alt="Logo" />
                            <div className="logo-text-group">
                                <div className="logo-main" style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800 }}>JNTU-GV</div>
                            </div>
                        </div>
                        <p style={{ opacity: 0.7, lineHeight: '1.7' }}>
                            Empowering the next generation of engineers with a legacy of excellence and a vision for the future of technological education.
                        </p>
                    </div>
                    <div className="footer-col">
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Quick Navigation</h3>
                        <ul className="footer-links-univ footer-link-list">
                            <li><Link to="/login">Student Portal</Link></li>
                            <li><Link to="/login">Faculty Dashboard</Link></li>
                            <li><Link to="/departments">Academic Programs</Link></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Connect</h3>
                        <p style={{ opacity: 0.7, fontSize: '0.9rem', lineHeight: '1.8' }}>
                            College of Engineering,<br />
                            Vizianagaram, AP - 535003<br />
                            <span className="footer-email">support@jntugv.edu.in</span>
                        </p>
                    </div>
                </div>
                <div className="footer-bottom-univ" style={{ textAlign: 'center', marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                    <p>&copy; {new Date().getFullYear()} JNTU-GV University. All Rights Reserved. Crafted for Excellence.</p>
                </div>
            </footer>
        </div>
    )
}

export default Landing
