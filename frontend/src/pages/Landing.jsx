import { useEffect, useState } from 'react'
import API_BASE_URL from '../config'
import { Link } from 'react-router-dom'
import '../App.css'

function Landing({ user }) {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [departments, setDepartments] = useState([])

    const fallbackDepts = [
        { name: 'Computer Science & Engineering', short: 'CSE' },
        { name: 'Electronics & Communication', short: 'ECE' },
        { name: 'Mechanical Engineering', short: 'MECH' },
        { name: 'Electrical Engineering', short: 'EEE' },
        { name: 'Information Technology', short: 'IT' }
    ]

    useEffect(() => {
        // Fetch Departments from Backend
        fetch(`${API_BASE_URL}/api/departments`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    setDepartments(data);
                } else {
                    setDepartments(fallbackDepts);
                }
            })
            .catch(() => setDepartments(fallbackDepts))

        const handleScroll = () => setIsScrolled(window.scrollY > 50)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div className="app-container">
            {/* Top Utility Bar - Removed Placeholder Links */}
            <div className="top-utility-bar desktop-only">
                <span style={{ color: 'var(--brand-purple)', fontWeight: 600 }}>Official Portal of JNTU-GV Vizianagaram</span>
            </div>

            {/* University Navbar */}
            <nav className="university-navbar">
                <div className="logo-container">
                    <img src="/jntugv-logo.png" alt="JNTU-GV Logo" className="university-logo" />
                    <div className="logo-text-group">
                        <div className="logo-main">JNTU-GV</div>
                        <div className="logo-sub">Vizianagaram</div>
                    </div>
                </div>

                <div className="nav-search-container desktop-only">
                    <Link to="/login" className="btn-apply">Student/Faculty Login →</Link>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="mobile-toggle"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? '✕' : '☰'}
                </button>
            </nav>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="mobile-menu">
                    <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                    <Link to="/login" className="btn-mobile" onClick={() => setIsMobileMenuOpen(false)}>Sign In →</Link>
                </div>
            )}

            <main>
                {/* Hero Section */}
                <section className="hero-university" style={{ backgroundImage: 'url("/jntugv-main-block.png")' }}>
                    <div className="hero-card">
                        <p style={{ color: '#8B734B', fontWeight: 700, letterSpacing: '2px', marginBottom: '1rem' }}>ESTABLISHED EXCELLENCE</p>
                        <h1>Empowering Rural Minds Through <span>Global Engineering</span></h1>
                        <div className="btn-group">
                            <Link to="/login" className="btn-purple">Access Portal →</Link>
                        </div>
                    </div>
                </section>

                {/* Stats Grid */}
                <section className="university-stats">
                    <div className="stat-item-univ purple">
                        <span style={{ fontSize: '2rem' }}>🎓</span>
                        <h2>95%</h2>
                        <p>Placement Statistics</p>
                    </div>
                    <div className="stat-item-univ white">
                        <span style={{ fontSize: '2rem' }}>📄</span>
                        <h2>1,200+</h2>
                        <p>Research Publications</p>
                    </div>
                    <div className="stat-item-univ gold">
                        <span style={{ fontSize: '2rem' }}>👥</span>
                        <h2>15k+</h2>
                        <p>Active Students</p>
                    </div>
                    <div className="stat-item-univ maroon">
                        <span style={{ fontSize: '2rem' }}>🏛️</span>
                        <h2>45+</h2>
                        <p>Industrial Partners</p>
                    </div>
                </section>

                {/* News & Events Section */}
                <section className="news-events-grid">
                    <div className="news-column">
                        <div className="news-section-header">
                            <div>
                                <h2>University Highlights</h2>
                                <p style={{ color: '#666', marginTop: '1rem' }}>The latest announcements and cultural milestones at JNTU-GV.</p>
                            </div>
                        </div>

                        <div className="news-cards-grid">
                            <div className="news-card-univ">
                                <div className="news-img-wrapper">
                                    <img src="/jntugv-main-block.png" alt="News 1" />
                                    <span className="news-badge">RESEARCH</span>
                                </div>
                                <div className="news-content-univ">
                                    <h3>Next-Gen Nano-Technology Lab Inaugurated</h3>
                                    <p>The university takes a massive leap forward in materials science with the opening of the new...</p>
                                    <div className="news-date">📅 Oct 24, 2024</div>
                                </div>
                            </div>
                            <div className="news-card-univ">
                                <div className="news-img-wrapper">
                                    <img src="/jntugv-first-year-block.jpg" alt="News 2" />
                                    <span className="news-badge">CAMPUS EVENT</span>
                                </div>
                                <div className="news-content-univ">
                                    <h3>Annual Convocation: Celebrating Class of 2024</h3>
                                    <p>Over 2,500 graduates received their degrees in a grand ceremony attended by industry stalwarts...</p>
                                    <div className="news-date">📅 Oct 12, 2024</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="events-column">
                        <h2 style={{ fontSize: '1.8rem', color: '#1a0b2e', marginBottom: '2.5rem' }}>Upcoming Events</h2>
                        <div className="events-list">
                            {[
                                { date: 'NOV 05', title: 'Global Engineering Summit', loc: 'Main Auditorium' },
                                { date: 'NOV 12', title: 'Inter-College Hackathon 2.0', loc: 'Innovation Center' },
                                { date: 'NOV 28', title: 'Green Campus Marathon', loc: 'Sports Complex' }
                            ].map((event, idx) => (
                                <div key={idx} className="event-item-univ">
                                    <div className="event-date-badge">
                                        <span>{event.date.split(' ')[0]}</span>
                                        <span>{event.date.split(' ')[1]}</span>
                                    </div>
                                    <div className="event-info">
                                        <h4>{event.title}</h4>
                                        <div className="event-location">📍 {event.loc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Sustainability Section */}
                <section className="sustainability-univ">
                    <div className="sustainability-content">
                        <div className="sus-images">
                            <img src="/jntugv-main-block.png" alt="Green Campus" className="sus-img-1" />
                            <img src="/jntugv-first-year-block.jpg" alt="Eco Garden" className="sus-img-2" />
                        </div>
                        <div className="sus-text">
                            <h2>Pioneering a Greener Tomorrow</h2>
                            <p>At JNTU-GV, sustainability is part of our DNA. Our 200-acre **Green Campus** initiative has transformed the university into a carbon-neutral haven.</p>
                            
                            <div className="sus-features">
                                <div className="sus-feature-item">
                                    <div className="sus-icon-box">⚡</div>
                                    <div className="sus-feature-text">
                                        <h4>Innovation Center: EV Buggies</h4>
                                        <p>Entirely student-developed electric transport for intra-campus mobility.</p>
                                    </div>
                                </div>
                                <div className="sus-feature-item">
                                    <div className="sus-icon-box">☀️</div>
                                    <div className="sus-feature-text">
                                        <h4>Renewable Energy Hub</h4>
                                        <p>Our campus is powered by a 500kW rooftop solar grid.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Modern Footer */}
            <footer className="footer-university">
                <div className="footer-grid-univ">
                    <div className="footer-col">
                        <h2 style={{ color: 'white', marginBottom: '1.5rem' }}>JNTU-GV</h2>
                        <p>Empowering the next generation of engineers with a legacy of excellence and a vision for the future.</p>
                    </div>
                    <div className="footer-col">
                        <h3>Quick Links</h3>
                        <ul className="footer-links-univ">
                            <li><Link to="/login">Student Portal</Link></li>
                            <li><Link to="/login">Faculty Login</Link></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h3>Reach Us</h3>
                        <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>
                            JNTU-GV College of Engineering,<br />
                            Vizianagaram, Andhra Pradesh - 535003<br />
                            Email: support@jntugv.edu.in
                        </p>
                    </div>
                    <div className="footer-col">
                        <h3>Newsletter</h3>
                        <p>Join our mailing list to stay updated.</p>
                        <form className="newsletter-form">
                            <input type="email" placeholder="Email Address" />
                            <button type="submit">Join</button>
                        </form>
                    </div>
                </div>
                <div className="footer-bottom-univ">
                    <p>© {new Date().getFullYear()} JNTU-GV University. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    )
}

export default Landing
