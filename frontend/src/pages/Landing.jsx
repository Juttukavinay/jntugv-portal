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
        <div className="edubin-layout">
            {/* Top Utility Bar */}
            <div className="edubin-topbar">
                <div className="topbar-left">
                    <span>✉ info@jntugv.edu.in</span>
                    <span>📞 +91-8922-227338</span>
                </div>
                <div className="topbar-right">
                    <span className="social-text">Follow Us : </span>
                    <span className="social-icons">f 🐦 📷 in</span>
                    <Link to="/login" className="topbar-login">Login / Register</Link>
                </div>
            </div>

            {/* Main Navbar */}
            <nav className="edubin-navbar">
                <div className="edu-logo">
                    <img src="/jntugv-logo.png" alt="JNTU-GV" />
                    <h2>JNTU-GV</h2>
                </div>
                <div className="edu-links desktop-only">
                    <Link to="/" className="active">HOME</Link>
                    <Link to="/about">ABOUT</Link>
                    <Link to="/departments">DEPARTMENTS</Link>
                    <Link to="/admissions">ADMISSIONS</Link>
                    <Link to="/campus">CAMPUS</Link>
                    <Link to="/contact">CONTACT</Link>
                </div>
                <div className="edu-actions desktop-only">
                    <span className="search-icon">🔍</span>
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
                    <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>HOME</Link>
                    <Link to="/login" className="btn-mobile" onClick={() => setIsMobileMenuOpen(false)}>Login →</Link>
                </div>
            )}

            <main>
                {/* Hero Section */}
                <section className="edubin-hero" style={{ backgroundImage: 'linear-gradient(rgba(10, 30, 60, 0.4), rgba(10, 30, 60, 0.7)), url("/jntugv-main-block.png")' }}>
                    <div className="hero-content-container fade-in-up">
                        <h1 className="hero-heading">Elevate your future with<br/>premium education</h1>
                        <p className="hero-paragraph">
                            Join India's premier technological university for innovation-driven research and academic brilliance. 
                            Step into a world where education meets excellence, preparing you for global challenges.
                        </p>
                        <div className="hero-buttons">
                            <Link to="/departments" className="edu-btn primary">Explore Courses</Link>
                            <Link to="/login" className="edu-btn secondary">Get Started</Link>
                        </div>
                    </div>

                    {/* Overlapping Feature Block */}
                    <div className="edubin-features-overlap">
                        <div className="feature-left-box">
                            <h3>Best platform<br/>to learn<br/>everything</h3>
                            <div className="feature-arrows">
                                <span className="arrow-btn">❮</span>
                                <span className="arrow-btn">❯</span>
                            </div>
                        </div>
                        <div className="feature-right-boxes">
                            <div className="feat-box blue">
                                <div className="feat-icon">⚙️</div>
                                <h4>Engineering</h4>
                            </div>
                            <div className="feat-box green">
                                <div className="feat-icon">💻</div>
                                <h4>Technology</h4>
                            </div>
                            <div className="feat-box red">
                                <div className="feat-icon">🔬</div>
                                <h4>Research</h4>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Adding spacing below hero due to overlap */}
                <div style={{ height: '150px' }}></div>

                {/* News & Events Section */}
                <section className="news-events-grid" style={{ padding: '4rem 2rem', background: '#fff' }}>
                    <div className="news-column">
                        <div className="news-section-header">
                            <div>
                                <h2 style={{fontSize: '2.5rem', fontWeight: 800, color: '#0b1f38'}}>University Highlights</h2>
                                <p style={{ color: '#666', marginTop: '1rem', fontSize: '1.1rem' }}>The latest announcements and cultural milestones at JNTU-GV.</p>
                            </div>
                        </div>

                        <div className="news-cards-grid" style={{ marginTop: '2rem', display: 'grid', gap: '2rem' }}>
                            <div className="news-card-univ" style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
                                <div className="news-img-wrapper" style={{ height: '200px', background: '#ccc' }}>
                                    <img src="/jntugv-first-year-block.jpg" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="News 2" />
                                </div>
                                <div className="news-content-univ" style={{ padding: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1.3rem', color: '#0b1f38', marginBottom: '0.5rem' }}>Annual Convocation: Celebrating Class of 2024</h3>
                                    <p style={{ color: '#666' }}>Over 2,500 graduates received their degrees in a grand ceremony attended by industry stalwarts...</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="events-column" style={{ padding: '2rem', background: '#f8fafc', borderRadius: '8px' }}>
                        <h2 style={{ fontSize: '1.8rem', color: '#0b1f38', marginBottom: '2.5rem' }}>Upcoming Events</h2>
                        <div className="events-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {[
                                { date: 'NOV 05', title: 'Global Engineering Summit', loc: 'Main Auditorium' },
                                { date: 'NOV 12', title: 'Inter-College Hackathon 2.0', loc: 'Innovation Center' },
                                { date: 'NOV 28', title: 'Green Campus Marathon', loc: 'Sports Complex' }
                            ].map((event, idx) => (
                                <div key={idx} className="event-item-univ" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', background: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                                    <div className="event-date-badge" style={{ background: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', textAlign: 'center', fontWeight: 'bold' }}>
                                        <span style={{ display: 'block', fontSize: '0.8rem' }}>{event.date.split(' ')[0]}</span>
                                        <span style={{ display: 'block', fontSize: '1.2rem' }}>{event.date.split(' ')[1]}</span>
                                    </div>
                                    <div className="event-info">
                                        <h4 style={{ margin: 0, color: '#0b1f38', fontSize: '1.1rem' }}>{event.title}</h4>
                                        <div className="event-location" style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.3rem' }}>📍 {event.loc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            {/* Premium Footer */}
            <footer className="footer-university" style={{ background: '#0b1f38', color: 'white', padding: '4rem 2rem 2rem' }}>
                <div className="footer-grid-univ" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem', maxWidth: '1200px', margin: '0 auto' }}>
                    <div className="footer-col">
                        <div className="logo-container" style={{ padding: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <img src="/jntugv-logo.png" alt="Logo" style={{ height: '50px' }} />
                            <div className="logo-text-group">
                                <div className="logo-main" style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800 }}>JNTU-GV</div>
                            </div>
                        </div>
                        <p style={{ opacity: 0.7, lineHeight: '1.7' }}>Empowering the next generation of engineers with a legacy of excellence and a vision for the future of technological education.</p>
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
                    <p>© {new Date().getFullYear()} JNTU-GV University. All Rights Reserved. Crafted for Excellence.</p>
                </div>
            </footer>
        </div>
    )
}

export default Landing
