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
                    <div className="blob blob-1"></div>
                    <div className="blob blob-2"></div>

                    <div className="content-wrapper" style={{ zIndex: 10 }}>
                        <div className="hero-content" style={{ textAlign: 'left', flex: 1.2 }}>
                            <div className="badge-pill-hero">📍 VIZIANAGARAM, ANDHRA PRADESH</div>
                            <h1 className="hero-title">
                                JNTU-GV <br />
                                <span className="text-gradient-animated">Technological University</span>
                            </h1>
                            <p className="hero-subtitle" style={{ marginLeft: 0 }}>
                                Empowering minds through engineering excellence and digital innovation. Discover our state-of-the-art campus and facilities.
                            </p>
                            <div className="hero-actions" style={{ justifyContent: 'flex-start' }}>
                                <a href="#gallery" className="btn-primary-lg">View Gallery</a>
                                <a href="#about-university" className="btn-outline-lg">About Us</a>
                            </div>
                        </div>
                        <div className="hero-image-v2" style={{ flex: 1 }}>
                            <img src="/jntugv-main-block.png" alt="Main Block" className="rounded-image shadow-2xl pulse-soft" style={{ border: '8px solid white' }} />
                        </div>
                    </div>
                </section>

                {/* About JNTU-GV Section */}
                <section className="info-section" id="about-university">
                    <div className="content-wrapper">
                        <div className="text-content">
                            <h2 className="section-title">Academic <span className="highlight">Foundation</span></h2>
                            <p className="text-gray-600 mb-4 text-justify">
                                Our <b>First Year Block</b> serves as the gateway for aspiring engineers, providing a nurturing environment where foundational concepts meet practical exploration. We prioritize academic rigor coupled with holistic development.
                            </p>
                            <div className="feature-small">
                                <strong>Established:</strong> 2007 (Constituent College)
                            </div>
                            <div className="feature-small">
                                <strong>University Status:</strong> Since 2022
                            </div>
                        </div>
                        <div className="image-content">
                            <img
                                src="/jntugv-first-year-block.jpg"
                                alt="JNTU-GV First Year Block"
                                className="rounded-image shadow-lg"
                            />
                        </div>
                    </div>
                </section>

                {/* Infrastructure Section */}
                <section className="info-section alt-bg" id="infrastructure">
                    <div className="content-wrapper reverse">
                        <div className="text-content">
                            <h2 className="section-title">World-Class <span className="highlight">Facilities</span></h2>
                            <div className="facility-card mb-4" style={{ background: 'white', padding: '1.5rem', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>📚 Dr. Y.S.R. Central Library</h4>
                                <p style={{ fontSize: '0.9rem', color: '#64748b' }}>A vast repository of knowledge featuring digital archives, research journals, and quiet study zones to foster intellectual growth.</p>
                            </div>
                            <div className="facility-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>🏥 JNTU-GV Dispensary</h4>
                                <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Ensuring student well-being with on-campus medical facilities, professional care, and emergency response services.</p>
                            </div>
                        </div>
                        <div className="image-content" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                            <img
                                src="/jntugv-library.jpg"
                                alt="University Library"
                                className="rounded-image shadow-lg"
                                style={{ height: '220px', objectFit: 'cover' }}
                            />
                            <img
                                src="/jntugv-dispensary.png"
                                alt="Campus Dispensary"
                                className="rounded-image shadow-lg"
                                style={{ height: '180px', objectFit: 'cover' }}
                            />
                        </div>
                    </div>
                </section>

                {/* Full Gallery Grid */}
                <section className="info-section" id="gallery">
                    <h2 className="section-header-center">Visual <span className="highlight">Journey</span></h2>
                    <div className="content-wrapper" style={{ display: 'block' }}>
                        <div className="image-grid-premium">
                            <div className="grid-item tall"><img src="/jntugv-main-block.png" alt="Main Block" /></div>
                            <div className="grid-item"><img src="/jntugv-entrance.jpg" alt="Entrance" /></div>
                            <div className="grid-item"><img src="/jntugv-library.jpg" alt="Library" /></div>
                            <div className="grid-item wide"><img src="/jntugv-board-english.jpg" alt="Board" /></div>
                            <div className="grid-item"><img src="/jntugv-first-year-block.jpg" alt="AY Block" /></div>
                            <div className="grid-item"><img src="/jntugv-dispensary.png" alt="Health" /></div>
                        </div>
                    </div>
                </section>

                {/* Portal Preview */}
                <section className="info-section alt-bg">
                    <div className="content-wrapper">
                        <div className="text-content">
                            <h2 className="section-title">Smart <span className="highlight">Digital Portal</span></h2>
                            <p className="text-gray-600">
                                Our bespoke Information Technology portal provides a unified interface for students and faculty to manage academics, attendances, and communication with ease and security.
                            </p>
                        </div>
                        <div className="image-content">
                            <img
                                src="/portal-preview.png"
                                alt="JNTU-GV IT Portal Preview"
                                className="rounded-image shadow-lg"
                                style={{ border: '4px solid #fff' }}
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
