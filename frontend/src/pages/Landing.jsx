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
                        <Link to="/login" className="btn-primary-lg">Access Portal</Link>
                    </div>
                </section>

                {/* About JNTU-GV Section */}
                <section className="info-section" id="about-university">
                    <div className="content-wrapper">
                        <div className="text-content">
                            <h2 className="section-title">About <span className="highlight">JNTU-GV</span></h2>
                            <p className="text-gray-600 mb-4 text-justify">
                                JNTU College of Engineering, Vizianagaram was established in the year 2007 as a constituent College of JNTU Hyderabad. JNTU Hyderabad was trifurcated into three Universities by the Andhra Pradesh Act No. 30 of 2008 and since 24th August 2008, the College has become the constituent college of JNTU Kakinada. Vide University Act No.22 of 2021, JNTU Kakinada is bifurcated and Jawaharlal Nehru Technological University Gurajada, Vizianagaram come into existence as a separate University vide G.O.Ms.No.3, dated: 12-01-2022.
                            </p>
                            <p className="text-gray-600 text-justify">
                                The university is spread across six districts i.e Vizianagaram, Visakhapatnam, Srikakulam, Parvathipuram Manyam, Alluri Sitharama Raju and Anakapalli. There are 2 constituent colleges and 37 affiliated colleges under its jurisdiction and catering education in different Engineering, Pharmacy and Management departments.
                            </p>
                        </div>
                        <div className="image-content">
                            <img
                                src="/college-building.png"
                                alt="JNTU-GV Campus Representative"
                                className="rounded-image shadow-lg"
                            />
                        </div>
                    </div>
                </section>

                {/* Mission Section */}
                <section className="info-section alt-bg" id="mission">
                    <div className="content-wrapper reverse">
                        <div className="text-content">
                            <h2 className="section-title">Our <span className="highlight">Mission</span></h2>
                            <ul className="mission-list text-justify">
                                <li className="mb-3">❖ To orchestrate an unparalleled symphony of intellectual rigor and academic distinction, sculpting minds through innovative pedagogies, cutting-edge research, thus forging individuals capable of leading transformative change in their chosen fields.</li>
                                <li className="mb-3">❖ To foster a mission of community synergy, university engages with and uplifts the rural community through initiatives that transcend educational boundarie enriching environment within our academic sphere.</li>
                                <li>❖ To foster a global perspective and a culture of scholarly inquiry, the university endeavors to instill in our students a thirst for knowledge that transcends borders, encouraging them to explore diverse perspectives and engage in rigorous scholarly endeavors that contribute not only to their personal growth but also to the global academic discourse.</li>
                            </ul>
                        </div>
                        <div className="image-content">
                            <img
                                src="/college-landing-small.jpg"
                                alt="University Mission"
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
