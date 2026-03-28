import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import API_BASE_URL from '../config'
import LoginModal from '../components/LoginModal'
import '../App.css'

function Landing() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        fetch(`${API_BASE_URL}/api/departments`).catch(() => null)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div className="landing-premium">
            {/* Navbar */}
            <nav className={`nav-glass ${scrolled ? 'scrolled' : ''}`}>
                <div className="nav-container">
                    <div className="nav-logo">
                        <img src="/jntugv-logo.png" alt="JNTU-GV" />
                        <div className="logo-text">
                            <span className="logo-title">JNTU-GV</span>
                            <span className="logo-sub">VIZIANAGARAM</span>
                        </div>
                    </div>

                    <div className="nav-links desktop-only">
                        <Link to="/" className="active">Home</Link>
                        <Link to="/departments">Departments</Link>
                        <a href="#about">About</a>
                        <a href="#contact">Contact</a>
                    </div>

                    <div className="nav-actions desktop-only">
                        <button 
                            className="btn-login-modern"
                            onClick={() => setIsLoginModalOpen(true)}
                        >
                            Sign In to Portal
                        </button>
                    </div>

                    <button
                        className="mobile-toggle"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? '✕' : '☰'}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="mobile-drawer slide-in">
                        <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                        <Link to="/departments" onClick={() => setIsMobileMenuOpen(false)}>Departments</Link>
                        <button 
                            className="mobile-login-btn"
                            onClick={() => {
                                setIsLoginModalOpen(true)
                                setIsMobileMenuOpen(false)
                            }}
                        >
                            Login
                        </button>
                    </div>
                )}
            </nav>

            <main>
                {/* Hero Section */}
                <section className="hero-section">
                    <div className="hero-overlay"></div>
                    <div className="hero-content fade-in-up">
                        <div className="univ-badge">PREMIER TECHNOLOGICAL UNIVERSITY</div>
                        <h1 className="hero-title">
                            Inspiring Innovation,<br />
                            <span>Empowering Future.</span>
                        </h1>
                        <p className="hero-desc">
                            Welcome to JNTU-GV Academic Portal. A unified platform for students and faculty 
                            to manage academics, research, and campus life with ease.
                        </p>
                        <div className="hero-btns">
                            <button className="btn-primary-glow" onClick={() => setIsLoginModalOpen(true)}>
                                Get Started
                            </button>
                            <Link to="/departments" className="btn-outline-white">
                                Explore Courses
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="features-section" id="about">
                    <div className="section-head">
                        <h2>Academic Excellence</h2>
                        <div className="underline"></div>
                    </div>
                    <div className="features-grid">
                        <div className="feat-card fade-in">
                            <div className="feat-icon">🎓</div>
                            <h3>Expert Faculty</h3>
                            <p>Learn from industry experts and researchers dedicated to your growth.</p>
                        </div>
                        <div className="feat-card fade-in" style={{ animationDelay: '0.2s' }}>
                            <div className="feat-icon">🔬</div>
                            <h3>Advanced Labs</h3>
                            <p>State-of-the-art infrastructure for hands-on technical learning.</p>
                        </div>
                        <div className="feat-card fade-in" style={{ animationDelay: '0.4s' }}>
                            <div className="feat-icon">🌐</div>
                            <h3>Innovation Hub</h3>
                            <p>Fostering entrepreneurship and groundbreaking technological research.</p>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="footer-elegant">
                <div className="footer-top">
                    <div className="footer-brand">
                        <img src="/jntugv-logo.png" alt="Logo" />
                        <div>
                            <h3>JNTU-GV</h3>
                            <p>Towards Excellence in Engineering</p>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} JNTU-GV University. All Rights Reserved.</p>
                </div>
            </footer>

            {/* Login Modal Integration */}
            <LoginModal 
                isOpen={isLoginModalOpen} 
                onClose={() => setIsLoginModalOpen(false)} 
            />

            <style>{`
                .landing-premium {
                    font-family: 'Outfit', sans-serif;
                    background: #fff;
                    color: #1e293b;
                }

                /* Navbar */
                .nav-glass {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    padding: 1.5rem 5%;
                    z-index: 1000;
                    transition: all 0.4s ease;
                    background: transparent;
                }

                .nav-glass.scrolled {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(15px);
                    padding: 1rem 5%;
                    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.05);
                }

                .nav-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .nav-logo {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .nav-logo img {
                    height: 48px;
                }

                .logo-text {
                    display: flex;
                    flex-direction: column;
                }

                .logo-title {
                    font-weight: 800;
                    font-size: 1.3rem;
                    color: #0c1e3a;
                    letter-spacing: -0.5px;
                }

                .logo-sub {
                    font-size: 0.7rem;
                    color: #475569;
                    font-weight: 700;
                    letter-spacing: 2px;
                }

                .nav-links {
                    display: flex;
                    gap: 2.5rem;
                }

                .nav-links a {
                    text-decoration: none;
                    color: #334155;
                    font-weight: 600;
                    font-size: 0.95rem;
                    transition: 0.3s;
                    position: relative;
                }

                .nav-links a::after {
                    content: '';
                    position: absolute;
                    bottom: -5px;
                    left: 0;
                    width: 0;
                    height: 2px;
                    background: #3b82f6;
                    transition: 0.3s;
                }

                .nav-links a:hover::after, .nav-links a.active::after {
                    width: 100%;
                }

                .btn-login-modern {
                    background: #0c1e3a;
                    color: white;
                    border: none;
                    padding: 0.8rem 1.8rem;
                    border-radius: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .btn-login-modern:hover {
                    background: #3b82f6;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
                }

                /* Mobile Toggle */
                .mobile-toggle {
                    display: none;
                    background: none;
                    border: none;
                    font-size: 1.8rem;
                    cursor: pointer;
                    color: #1e293b;
                }

                /* Hero Section */
                .hero-section {
                    height: 100vh;
                    min-height: 700px;
                    background: url("/jntugv-main-block.png") center/cover no-repeat;
                    display: flex;
                    align-items: center;
                    padding: 0 5%;
                    position: relative;
                    color: white;
                }

                .hero-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, rgba(12, 30, 58, 0.9) 0%, rgba(12, 30, 58, 0.4) 100%);
                }

                .hero-content {
                    position: relative;
                    z-index: 10;
                    max-width: 850px;
                }

                .univ-badge {
                    display: inline-block;
                    padding: 0.6rem 1.2rem;
                    background: rgba(255,255,255,0.1);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.2);
                    border-radius: 99px;
                    font-size: 0.75rem;
                    font-weight: 800;
                    letter-spacing: 2px;
                    margin-bottom: 2rem;
                }

                .hero-title {
                    font-size: 5rem;
                    line-height: 1.1;
                    font-weight: 800;
                    margin: 0;
                }

                .hero-title span {
                    color: #60a5fa;
                }

                .hero-desc {
                    font-size: 1.15rem;
                    color: rgba(255,255,255,0.85);
                    max-width: 600px;
                    margin: 2rem 0 3rem;
                    line-height: 1.6;
                }

                .hero-btns {
                    display: flex;
                    gap: 1.5rem;
                }

                .btn-primary-glow {
                    background: #3b82f6;
                    color: white;
                    border: none;
                    padding: 1.1rem 2.5rem;
                    border-radius: 12px;
                    font-size: 1.1rem;
                    font-weight: 800;
                    cursor: pointer;
                    transition: 0.3s;
                    box-shadow: 0 10px 30px rgba(59, 130, 246, 0.4);
                }

                .btn-primary-glow:hover {
                    box-shadow: 0 15px 40px rgba(59, 130, 246, 0.6);
                    transform: translateY(-3px);
                }

                .btn-outline-white {
                    border: 2.5px solid white;
                    color: white;
                    text-decoration: none;
                    padding: 1rem 2.5rem;
                    border-radius: 12px;
                    font-size: 1.1rem;
                    font-weight: 800;
                    transition: 0.3s;
                }

                .btn-outline-white:hover {
                    background: white;
                    color: #0c1e3a;
                }

                /* Features */
                .features-section {
                    padding: 100px 5%;
                    background: #f8fafc;
                }

                .section-head {
                    text-align: center;
                    margin-bottom: 4rem;
                }

                .section-head h2 {
                    font-size: 2.5rem;
                    color: #0f172a;
                    margin-bottom: 1rem;
                }

                .underline {
                    width: 60px;
                    height: 4px;
                    background: #3b82f6;
                    margin: 0 auto;
                    border-radius: 2px;
                }

                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 2.5rem;
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .feat-card {
                    background: white;
                    padding: 3.5rem 2.5rem;
                    border-radius: 24px;
                    transition: 0.4s;
                    border: 1px solid #e2e8f0;
                }

                .feat-card:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.05);
                    border-color: #3b82f6;
                }

                .feat-icon {
                    font-size: 3rem;
                    margin-bottom: 1.5rem;
                }

                .feat-card h3 {
                    font-size: 1.4rem;
                    margin-bottom: 1rem;
                }

                .feat-card p {
                    color: #64748b;
                    line-height: 1.6;
                }

                /* Footer */
                .footer-elegant {
                    background: #0f172a;
                    color: white;
                    padding: 4rem 5% 2rem;
                }

                .footer-brand {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    margin-bottom: 3rem;
                }

                .footer-brand img {
                    height: 60px;
                }

                .footer-bottom {
                    border-top: 1px solid rgba(255,255,255,0.1);
                    padding-top: 2rem;
                    text-align: center;
                    color: #94a3b8;
                    font-size: 0.9rem;
                }

                /* Animations */
                .fade-in-up {
                    animation: fadeInUp 0.8s ease-out;
                }

                .fade-in {
                    animation: fadeIn 1s ease-out backwards;
                }

                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                /* Mobile Menu Drawer */
                .mobile-drawer {
                    position: fixed;
                    top: 80px;
                    left: 0;
                    right: 0;
                    background: white;
                    display: flex;
                    flex-direction: column;
                    padding: 2rem;
                    gap: 1.5rem;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
                    z-index: 1001;
                }

                .mobile-drawer a {
                    text-decoration: none;
                    color: #1e293b;
                    font-weight: 700;
                    font-size: 1.2rem;
                }

                .mobile-login-btn {
                    padding: 1rem;
                    background: #3b82f6;
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-weight: 800;
                    font-size: 1.1rem;
                }

                /* Responsive */
                @media (max-width: 1024px) {
                    .hero-title { font-size: 3.5rem; }
                }

                @media (max-width: 768px) {
                    .desktop-only { display: none; }
                    .mobile-toggle { display: block; }
                    .hero-title { font-size: 2.8rem; }
                    .hero-btns { flex-direction: column; }
                    .nav-glass { padding: 1rem 5%; background: white; }
                }
            `}</style>
        </div>
    )
}

export default Landing
