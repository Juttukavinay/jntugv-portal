import { useEffect, useState } from 'react'
import API_BASE_URL from '../config'
import { Link } from 'react-router-dom'
import '../App.css'

function Landing() {
    const [serverMsg, setServerMsg] = useState('Connecting...')
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    useEffect(() => {
        fetch(`${API_BASE_URL}/api`)
            .then(res => res.json())
            .then(data => setServerMsg(data.message))
            .catch(() => setServerMsg('Server Offline'))

        // Scroll listener for dynamic navbar
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true)
            } else {
                setIsScrolled(false)
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div className="app-container">
            {/* Dynamic Navbar */}
            <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
                <div className="logo-container">
                    <img src="/jntugv-logo.png" alt="JNTU-GV Logo" className="university-logo" style={{ height: '50px' }} />
                    <div className="logo-text-group">
                        <div className="logo-main">JNTU-GV</div>
                        <div className="logo-sub">Dept of Information Technology</div>
                    </div>
                </div>

                {/* Desktop Links */}
                <div className="nav-links desktop-only">
                    <a href="#home" className="nav-link">Home</a>
                    <a href="#about" className="nav-link">About</a>
                    <a href="#features" className="nav-link">Features</a>
                </div>

                <div className="nav-actions desktop-only">
                    <Link to="/login" className="btn-glow">Sign In</Link>
                </div>

                {/* Mobile Toggle */}
                <button className="mobile-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    ☰
                </button>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="mobile-menu">
                        <a href="#home" onClick={() => setIsMobileMenuOpen(false)}>Home</a>
                        <a href="#about" onClick={() => setIsMobileMenuOpen(false)}>About</a>
                        <a href="#features" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
                        <hr style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                        <Link to="/login" className="btn-mobile">Login</Link>
                    </div>
                )}
            </nav>

            <main>
                {/* Hero Section */}
                <section className="hero-section" id="home">
                    <div className="blob blob-1"></div>
                    <div className="blob blob-2"></div>

                    <div className="content-wrapper" style={{ zIndex: 10 }}>
                        <div className="hero-content" style={{ textAlign: 'left', flex: 1.2 }}>
                            <div className="badge-pill-hero">VIZIANAGARAM, ANDHRA PRADESH</div>
                            <h1 className="hero-title">
                                JNTU-GV <br />
                                <span className="text-gradient-animated">Technological University</span>
                            </h1>
                            <p className="hero-subtitle" style={{ marginLeft: 0 }}>
                                Empowering minds through engineering excellence and digital innovation. A premier institution for technical education in Andhra Pradesh.
                            </p>
                            <div className="hero-actions" style={{ justifyContent: 'flex-start' }}>
                                <Link to="/login" className="btn-primary-lg">Access Portal</Link>
                                <a href="#about" className="btn-outline-lg">Learn More</a>
                            </div>
                        </div>
                        <div className="hero-image-v2" style={{ flex: 1 }}>
                            <img src="/jntugv-main-block.png" alt="Main Block" className="rounded-image shadow-2xl pulse-soft" style={{ border: '8px solid white' }} />
                        </div>
                    </div>
                </section>

                {/* Redesigned About Section - Classic Style */}
                <section className="info-section" id="about">
                    <div className="content-wrapper">
                        <div className="text-content">
                            <h2 className="section-title">Academic <span className="highlight">Excellence</span></h2>
                            <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                                JNTU-GV stands as a beacon of technical education, fostering innovation and research. Our Department of Information Technology is committed to producing world-class engineers equipped with modern digital skills.
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="facility-card-simple">
                                    <h4>🏛️ Established</h4>
                                    <p>Founded in 2007, elevated to University status in 2022.</p>
                                </div>
                                <div className="facility-card-simple">
                                    <h4>📚 Resources</h4>
                                    <p>Dr. Y.S.R. Central Library with thousands of digital and print volumes.</p>
                                </div>
                            </div>
                        </div>
                        <div className="image-content">
                            <img
                                src="/jntugv-first-year-block.jpg"
                                alt="Academic Block"
                                className="rounded-image shadow-xl"
                            />
                        </div>
                    </div>
                </section>

                {/* Classic Parallax - Single Impact Image */}
                <section className="parallax-section" style={{ backgroundImage: 'url("/jntugv-main-block.png")', height: '400px' }}>
                    <div className="parallax-overlay">
                        <div className="content-wrapper">
                            <div className="text-content center" style={{ color: 'white', textAlign: 'center' }}>
                                <h2 className="section-title" style={{ color: 'white' }}>Shaping the Future</h2>
                                <p style={{ fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto' }}>
                                    Dedicated to providing world-class technological education and fostering an environment of research and development.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Portal Preview Section */}
                <section className="info-section alt-bg">
                    <div className="content-wrapper reverse">
                        <div className="text-content">
                            <h2 className="section-title">Digital <span className="highlight">Ecosystem</span></h2>
                            <p className="text-gray-600 text-lg">
                                Our bespoke Information Technology portal provides a unified interface for students and faculty to manage academics, attendances, and communication with ease and security.
                            </p>
                            <ul style={{ listStyle: 'none', padding: 0, marginTop: '1.5rem' }}>
                                <li style={{ marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>✓</span> Secure Role-based Access
                                </li>
                                <li style={{ marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>✓</span> Real-time Academic Tracking
                                </li>
                                <li style={{ marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>✓</span> Automated Communication Center
                                </li>
                            </ul>
                        </div>
                        <div className="image-content">
                            <img
                                src="/portal-preview.png"
                                alt="Portal Interface"
                                className="rounded-image shadow-2xl"
                                style={{ border: '4px solid #fff' }}
                            />
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="features-grid-section" id="features">
                    <h2 className="section-header-center">Core Pillars</h2>
                    <div className="features-grid">
                        <div className="feature-card-glass">
                            <div className="icon">⚡</div>
                            <h3>Performance</h3>
                            <p>Optimized for speed and real-time updates across all devices.</p>
                        </div>
                        <div className="feature-card-glass">
                            <div className="icon">🛡️</div>
                            <h3>Security</h3>
                            <p>End-to-end encryption and robust data protection for all users.</p>
                        </div>
                        <div className="feature-card-glass">
                            <div className="icon">📊</div>
                            <h3>Insights</h3>
                            <p>Advanced analytics for tracking progress and academic growth.</p>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="footer">
                <p>&copy; {new Date().getFullYear()} JNTU-GV Dept of IT. All rights reserved.</p>
            </footer>
        </div>
    )
}

export default Landing
