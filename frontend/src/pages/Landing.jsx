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
                    <a href="#about-university" className="nav-link">University</a>
                    <a href="#it-dept" className="nav-link">IT Dept</a>
                    <a href="#features" className="nav-link">Features</a>
                </div>

                <div className="nav-actions desktop-only">
                    <Link to="/login" className="btn-glass">Sign In</Link>
                    <Link to="/login" className="btn-glow">Access Portal</Link>
                </div>

                {/* Mobile Toggle */}
                <button className="mobile-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    ☰
                </button>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="mobile-menu">
                        <a href="#home" onClick={() => setIsMobileMenuOpen(false)}>Home</a>
                        <a href="#about-university" onClick={() => setIsMobileMenuOpen(false)}>University</a>
                        <a href="#it-dept" onClick={() => setIsMobileMenuOpen(false)}>IT Dept</a>
                        <a href="#features" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
                        <hr style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                        <Link to="/login" className="btn-mobile">Login</Link>
                    </div>
                )}
            </nav>

            <main>
                {/* Hero Section */}
                <section className="hero-section" id="home">
                    {/* Decorative Blobs */}
                    <div className="blob blob-1"></div>
                    <div className="blob blob-2"></div>

                    <div className="hero-content">
                        <div className="badge-pill-hero">🚀 Empowering Future Innovators</div>
                        <h1 className="hero-title">
                            JNTU-GV UNIVERSITY <br />
                            <span className="text-gradient-animated">Information Technology Department</span>
                        </h1>
                        <p className="hero-subtitle">
                            Streamlining academic excellence for the Department of Information Technology. Experience the future of university management.
                        </p>
                    </div>

                    <div className="status-indicator status-success">
                        <span className="status-dot pulse"></span>
                        System Status: <span style={{ color: '#22c55e', fontWeight: 'bold' }}>Active</span>
                    </div>

                    <div className="hero-actions">
                        <Link to="/login" className="btn-primary-lg">Student Login</Link>
                        <Link to="/login" className="btn-outline-lg">Faculty Login</Link>
                    </div>
                </section>

                {/* About JNTU-GV Section */}
                <section className="info-section" id="about-university">
                    <div className="content-wrapper">
                        <div className="text-content">
                            <h2 className="section-title">About <span className="highlight">JNTU-GV</span></h2>
                        </div>
                        <div className="image-content">
                            <img
                                src="https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                alt="JNTU-GV Campus Representative"
                                className="rounded-image shadow-lg"
                            />
                        </div>
                    </div>
                </section>

                {/* IT Dept Section */}
                <section className="info-section alt-bg" id="it-dept">
                    <div className="content-wrapper reverse">
                        <div className="text-content">
                            <h2 className="section-title">Department of <span className="highlight">Information Technology</span></h2>
                        </div>
                        <div className="image-content">
                            <img
                                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                alt="IT Department Lab"
                                className="rounded-image shadow-lg"
                            />
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="features-grid-section" id="features">
                    <h2 className="section-header-center">Why Choose Us?</h2>
                    <div className="features-grid">
                        <div className="feature-card-glass">
                            <div className="icon">⚡</div>
                            <h3>Real-time Updates</h3>
                            <p>Instant notifications for timetables and circulars.</p>
                        </div>
                        <div className="feature-card-glass">
                            <div className="icon">🛡️</div>
                            <h3>Secure Portal</h3>
                            <p>Role-based access for students, faculty, and admin.</p>
                        </div>
                        <div className="feature-card-glass">
                            <div className="icon">📊</div>
                            <h3>Academic Analytics</h3>
                            <p>Track performance and attendance with visual insights.</p>
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
