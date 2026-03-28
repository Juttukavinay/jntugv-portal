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

            <footer className="footer-university" style={{ background: '#0b1f38', color: 'white', padding: '4rem 2rem 2rem' }}>
                <div className="footer-grid-univ" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem', maxWidth: '1200px', margin: '0 auto' }}>
                    <div className="footer-col">
                        <div className="logo-container" style={{ padding: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <img src="/jntugv-logo.png" alt="Logo" style={{ height: '50px' }} />
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
                        <ul className="footer-links-univ" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <li><Link to="/login" style={{ color: '#aaa', textDecoration: 'none' }}>Student Portal</Link></li>
                            <li><Link to="/login" style={{ color: '#aaa', textDecoration: 'none' }}>Faculty Dashboard</Link></li>
                            <li><Link to="/departments" style={{ color: '#aaa', textDecoration: 'none' }}>Academic Programs</Link></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Connect</h3>
                        <p style={{ opacity: 0.7, fontSize: '0.9rem', lineHeight: '1.8' }}>
                            College of Engineering,<br />
                            Vizianagaram, AP - 535003<br />
                            <span style={{ color: '#3b82f6' }}>support@jntugv.edu.in</span>
                        </p>
                    </div>
                </div>
                <div className="footer-bottom-univ" style={{ textAlign: 'center', marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', color: '#888' }}>
                    <p>&copy; {new Date().getFullYear()} JNTU-GV University. All Rights Reserved. Crafted for Excellence.</p>
                </div>
            </footer>

            <style>{`
                .edubin-layout {
                    min-height: 100vh;
                    background: #ffffff;
                }

                .edubin-navbar {
                    height: 82px;
                    background: #ffffff;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 4rem;
                    box-sizing: border-box;
                }

                .edu-logo {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .edu-logo img {
                    width: 40px;
                    height: 40px;
                    object-fit: contain;
                }

                .edu-logo h2 {
                    margin: 0;
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: #13294b;
                    letter-spacing: 0.02em;
                }

                .edu-links {
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                }

                .edu-links a {
                    text-decoration: none;
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: #1e2f49;
                }

                .edu-links a.active {
                    color: #3b82f6;
                }

                .edu-actions {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .edu-btn {
                    text-decoration: none;
                    font-size: 0.95rem;
                    font-weight: 700;
                    padding: 0.9rem 1.8rem;
                    border-radius: 12px;
                    transition: background 0.2s ease, color 0.2s ease;
                }

                .edu-btn.primary {
                    background: #3b82f6;
                    color: #ffffff;
                }

                .edu-btn.secondary {
                    background: #ffffff;
                    color: #1e2f49;
                }

                .mobile-toggle {
                    display: none;
                    border: none;
                    background: transparent;
                    font-size: 1.5rem;
                    color: #1e2f49;
                    cursor: pointer;
                }

                .mobile-menu {
                    display: none;
                }

                .edubin-hero {
                    min-height: 810px;
                    background-size: cover;
                    background-position: center;
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .hero-content-container {
                    width: 100%;
                    max-width: 720px;
                    padding: 0 0 0 4rem;
                    box-sizing: border-box;
                }

                .hero-heading {
                    margin: 0;
                    color: #ffffff;
                    font-size: 4.8rem;
                    line-height: 0.98;
                    font-weight: 800;
                    letter-spacing: -0.04em;
                }

                .hero-paragraph {
                    margin: 2rem 0 2.5rem;
                    max-width: 640px;
                    color: rgba(255, 255, 255, 0.9);
                    font-size: 1rem;
                    line-height: 1.55;
                }

                .hero-buttons {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                @media (max-width: 1024px) {
                    .edubin-navbar {
                        padding: 0 1.5rem;
                    }

                    .hero-content-container {
                        padding-left: 1.5rem;
                        padding-right: 1.5rem;
                    }

                    .hero-heading {
                        font-size: 3.8rem;
                    }
                }

                @media (max-width: 768px) {
                    .desktop-only {
                        display: none;
                    }

                    .mobile-toggle {
                        display: block;
                    }

                    .mobile-menu {
                        display: flex;
                        flex-direction: column;
                        gap: 1rem;
                        padding: 1rem 1.5rem;
                        background: #ffffff;
                        border-top: 1px solid #e5e7eb;
                    }

                    .mobile-menu a {
                        text-decoration: none;
                        color: #1e2f49;
                        font-weight: 700;
                    }

                    .edubin-hero {
                        min-height: 620px;
                    }

                    .hero-heading {
                        font-size: 3rem;
                    }

                    .hero-buttons {
                        flex-wrap: wrap;
                    }
                }
            `}</style>
        </div>
    )
}

export default Landing
