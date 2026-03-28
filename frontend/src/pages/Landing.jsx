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
            setScrolled(window.scrollY > 40)
        }
        window.addEventListener('scroll', handleScroll)
        fetch(`${API_BASE_URL}/api/departments`).catch(() => null)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div className="landing-classic">
            {/* Professional Top Bar */}
            <div className="top-utility-bar desktop-only">
                <div className="utility-container">
                    <span>Official Academic Portal - JNTU-GV, Vizianagaram</span>
                    <div className="utility-links">
                        <a href="https://jntugv.edu.in" target="_blank" rel="noreferrer">University Website</a>
                        <span className="separator">|</span>
                        <span>Support: support@jntugv.edu.in</span>
                    </div>
                </div>
            </div>

            {/* Main Navbar */}
            <nav className={`main-nav ${scrolled ? 'nav-scrolled' : ''}`}>
                <div className="nav-container">
                    <div className="brand-stack">
                        <img src="/jntugv-logo.png" alt="JNTU-GV" className="nav-logo-img" />
                        <div className="brand-text-group">
                            <h1 className="brand-main">JNTU-GV</h1>
                            <p className="brand-location">VIZIANAGARAM, AP</p>
                        </div>
                    </div>

                    <div className="nav-links-wrapper desktop-only">
                        <Link to="/" className="nav-item active">HOME</Link>
                        <Link to="/departments" className="nav-item">DEPARTMENTS</Link>
                        <a href="#about" className="nav-item">ACADEMICS</a>
                        <a href="#contact" className="nav-item">CONTACT</a>
                    </div>

                    <div className="nav-action-buttons desktop-only">
                        <button 
                            className="btn-portal-classic"
                            onClick={() => setIsLoginModalOpen(true)}
                        >
                            Log In to Portal
                        </button>
                    </div>

                    <button
                        className="mobile-hamburger"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? '✕' : '☰'}
                    </button>
                </div>

                {/* Mobile Drawer */}
                {isMobileMenuOpen && (
                    <div className="mobile-drawer-modern">
                        <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>HOME</Link>
                        <Link to="/departments" onClick={() => setIsMobileMenuOpen(false)}>DEPARTMENTS</Link>
                        <button 
                            className="mobile-login-full"
                            onClick={() => {
                                setIsLoginModalOpen(true)
                                setIsMobileMenuOpen(false)
                            }}
                        >
                            SIGN IN
                        </button>
                    </div>
                )}
            </nav>

            <main>
                {/* High Contrast Hero */}
                <section className="hero-classic">
                    <div className="hero-bg-overlay"></div>
                    <div className="hero-content-stack fade-in-up">
                        <div className="hero-badge-classic">ESTD. 2021 | STATE UNIVERSITY</div>
                        <h2 className="hero-headline">
                            Excellence in <strong>Technology</strong> & <br />Research Innovation.
                        </h2>
                        <p className="hero-summary">
                            Jawaharlal Nehru Technological University - Gurajada Vizianagaram. 
                            Empowering students through quality technical education and fostering 
                            pioneering research for global impact.
                        </p>
                        <div className="hero-action-group">
                            <button className="btn-solid-primary" onClick={() => setIsLoginModalOpen(true)}>
                                GET STARTED
                            </button>
                            <Link to="/departments" className="btn-outline-bold">
                                VIEW DEPARTMENTS
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Solid Feature Section */}
                <section className="highlights-section" id="about">
                    <div className="highlights-header">
                        <span className="pre-title">OUR CAMPUS</span>
                        <h2>Institutional Highlights</h2>
                        <div className="title-bar"></div>
                    </div>
                    
                    <div className="highlights-grid">
                        <div className="highlight-block">
                            <div className="block-icon">🏛️</div>
                            <h3>Academic Rigor</h3>
                            <p>Rigorous curriculum designed to meet global industrial standards and technological advancements.</p>
                        </div>
                        <div className="highlight-block">
                            <div className="block-icon">🏢</div>
                            <h3>Modern Infrastructure</h3>
                            <p>State-of-the-art classrooms, smart theaters, and specialized labs for advanced engineering studies.</p>
                        </div>
                        <div className="highlight-block">
                            <div className="block-icon">🧪</div>
                            <h3>Innovation Hub</h3>
                            <p>Foster creativity and entrepreneurship through our dedicated R&D centers and incubation labs.</p>
                        </div>
                        <div className="highlight-block">
                            <div className="block-icon">🎖️</div>
                            <h3>Placement Success</h3>
                            <p>Strong industry connect and dedicated career support for graduating engineers at top global firms.</p>
                        </div>
                        <div className="highlight-block">
                            <div className="block-icon">📚</div>
                            <h3>Central Library</h3>
                            <p>Extensive collection of digital and physical resources, journals, and a 24/7 dedicated reading hall.</p>
                        </div>
                        <div className="highlight-block">
                            <div className="block-icon">💡</div>
                            <h3>Research excellence</h3>
                            <p>Comprehensive research facilities supporting innovation in engineering and applied sciences.</p>
                        </div>
                        <div className="highlight-block">
                            <div className="block-icon">⚽</div>
                            <h3>Sports & Wellness</h3>
                            <p>Full-size athletic facilities, multi-gym, and wellness programs for all-round development.</p>
                        </div>
                        <div className="highlight-block">
                            <div className="block-icon">🌐</div>
                            <h3>Global Outreach</h3>
                            <p>Active collaborations with international universities and industries for global exposure.</p>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="footer-professional">
                <div className="footer-main-row">
                    <div className="footer-info">
                        <img src="/jntugv-logo.png" alt="Logo" className="footer-logo" />
                        <div className="footer-text">
                            <h3>JNTU-GV University</h3>
                            <p>Vizianagaram, Andhra Pradesh - 535003</p>
                        </div>
                    </div>
                    <div className="footer-quick-links">
                        <Link to="/departments">Departments</Link>
                        <button onClick={() => setIsLoginModalOpen(true)}>PORTAL LOGIN</button>
                    </div>
                </div>
                <div className="footer-copyright">
                    <p>&copy; {new Date().getFullYear()} JNTU-GV University Portal. Built for Academic Excellence.</p>
                </div>
            </footer>

            {/* Login Modal */}
            <LoginModal 
                isOpen={isLoginModalOpen} 
                onClose={() => setIsLoginModalOpen(false)} 
            />

            <style>{`
                .landing-classic {
                    font-family: 'Outfit', 'Inter', sans-serif;
                    color: #0c1e3a;
                    background: #fff;
                    overflow-x: hidden;
                }

                /* Utility Bar */
                .top-utility-bar {
                    background: #0c1e3a;
                    color: rgba(255,255,255,0.7);
                    padding: 8px 5%;
                    font-size: 0.75rem;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }

                .utility-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    display: flex;
                    justify-content: space-between;
                }

                .utility-links {
                    display: flex;
                    gap: 15px;
                    align-items: center;
                }

                .utility-links a {
                    color: white;
                    text-decoration: none;
                }

                /* Navbar Redesign */
                .main-nav {
                    background: #ffffff;
                    padding: 20px 5%;
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border-bottom: 1px solid #f1f5f9;
                }

                .nav-scrolled {
                    padding: 12px 5%;
                    background: rgba(255,255,255,0.98);
                    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                }

                .nav-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .brand-stack {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }

                .nav-logo-img {
                    height: 54px;
                }

                .brand-main {
                    margin: 0;
                    font-size: 1.6rem;
                    font-weight: 900;
                    color: #0c1e3a;
                    line-height: 1;
                    letter-spacing: -0.5px;
                }

                .brand-location {
                    margin: 2px 0 0;
                    font-size: 0.7rem;
                    font-weight: 800;
                    color: #3b82f6;
                    letter-spacing: 2px;
                }

                .nav-links-wrapper {
                    display: flex;
                    gap: 35px;
                }

                .nav-item {
                    text-decoration: none;
                    color: #475569;
                    font-weight: 800;
                    font-size: 0.9rem;
                    transition: 0.2s;
                }

                .nav-item:hover, .nav-item.active {
                    color: #0c1e3a;
                }

                .btn-portal-classic {
                    background: #0c1e3a;
                    color: white;
                    border: none;
                    padding: 0.9rem 2rem;
                    border-radius: 8px;
                    font-weight: 800;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.3s;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .btn-portal-classic:hover {
                    background: #3b82f6;
                    transform: translateY(-2px);
                    box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
                }

                /* Hero Redesign */
                .hero-classic {
                    position: relative;
                    height: calc(100vh - 120px);
                    min-height: 650px;
                    background: url("/jntugv-main-block.png") center/cover no-repeat;
                    display: flex;
                    align-items: center;
                    padding: 0 5%;
                }

                .hero-bg-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to right, rgba(12, 30, 58, 0.95) 20%, rgba(12, 30, 58, 0.6) 100%);
                }

                .hero-content-stack {
                    position: relative;
                    z-index: 10;
                    max-width: 800px;
                    color: white;
                }

                .hero-badge-classic {
                    font-size: 0.8rem;
                    font-weight: 900;
                    letter-spacing: 3px;
                    color: #3b82f6;
                    margin-bottom: 25px;
                }

                .hero-headline {
                    font-size: 4.8rem;
                    font-weight: 300;
                    line-height: 1.1;
                    margin: 0;
                }

                .hero-headline strong {
                    font-weight: 900;
                    color: white;
                }

                .hero-summary {
                    font-size: 1.2rem;
                    line-height: 1.7;
                    color: rgba(255,255,255,0.85);
                    margin: 30px 0 45px;
                    max-width: 650px;
                }

                .hero-action-group {
                    display: flex;
                    gap: 20px;
                }

                .btn-solid-primary {
                    background: #3b82f6;
                    color: white;
                    border: none;
                    padding: 1.2rem 3rem;
                    border-radius: 8px;
                    font-weight: 900;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: 0.3s;
                    box-shadow: 0 15px 35px rgba(59, 130, 246, 0.4);
                }

                .btn-solid-primary:hover {
                    background: #2563eb;
                    transform: translateY(-4px);
                }

                .btn-outline-bold {
                    border: 2px solid white;
                    color: white;
                    text-decoration: none;
                    padding: 1.1rem 3rem;
                    border-radius: 8px;
                    font-weight: 900;
                    font-size: 1rem;
                    transition: 0.3s;
                }

                .btn-outline-bold:hover {
                    background: white;
                    color: #0c1e3a;
                }

                /* Highlights Section */
                .highlights-section {
                    padding: 120px 5%;
                    background: #ffffff;
                }

                .highlights-header {
                    text-align: center;
                    margin-bottom: 80px;
                }

                .pre-title {
                    font-size: 0.85rem;
                    font-weight: 900;
                    color: #3b82f6;
                    letter-spacing: 4px;
                }

                .highlights-header h2 {
                    font-size: 3rem;
                    font-weight: 800;
                    margin: 15px 0;
                }

                .title-bar {
                    width: 80px;
                    height: 5px;
                    background: #0c1e3a;
                    margin: 0 auto;
                }

                .highlights-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                    gap: 40px;
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .highlight-block {
                    background: #f8fafc;
                    padding: 50px 40px;
                    border-radius: 20px;
                    transition: 0.4s;
                    border: 1px solid #e2e8f0;
                }

                .highlight-block:hover {
                    background: white;
                    border-color: #3b82f6;
                    transform: translateY(-10px);
                    box-shadow: 0 25px 50px -10px rgba(0,0,0,0.06);
                }

                .block-icon {
                    font-size: 3.5rem;
                    margin-bottom: 30px;
                }

                .highlight-block h3 {
                    font-size: 1.6rem;
                    font-weight: 800;
                    margin-bottom: 15px;
                }

                .highlight-block p {
                    color: #64748b;
                    line-height: 1.8;
                }

                /* Footer */
                .footer-professional {
                    background: #0c1e3a;
                    color: white;
                    padding: 80px 5% 40px;
                }

                .footer-main-row {
                    max-width: 1400px;
                    margin: 0 auto 60px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .footer-info {
                    display: flex;
                    align-items: center;
                    gap: 25px;
                }

                .footer-logo {
                    height: 80px;
                }

                .footer-text h3 { margin: 0; font-size: 1.8rem; }
                .footer-text p { margin: 5px 0 0; color: rgba(255,255,255,0.6); }

                .footer-quick-links {
                    display: flex;
                    gap: 40px;
                }

                .footer-quick-links a, .footer-quick-links button {
                    color: white;
                    text-decoration: none;
                    background: none;
                    border: none;
                    font-weight: 700;
                    font-size: 1rem;
                    cursor: pointer;
                    text-transform: uppercase;
                }

                .footer-copyright {
                    border-top: 1px solid rgba(255,255,255,0.1);
                    padding-top: 40px;
                    text-align: center;
                    color: rgba(255,255,255,0.4);
                    font-size: 0.9rem;
                }

                /* Mobile Drawer */
                .mobile-drawer-modern {
                    position: fixed;
                    top: 94px;
                    left: 0;
                    right: 0;
                    background: white;
                    padding: 40px;
                    display: flex;
                    flex-direction: column;
                    gap: 25px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                    z-index: 999;
                    animation: slideDown 0.4s ease;
                }

                .mobile-drawer-modern a {
                    font-size: 1.4rem;
                    font-weight: 800;
                    text-decoration: none;
                    color: #0c1e3a;
                }

                .mobile-login-full {
                    background: #3b82f6;
                    color: white;
                    border: none;
                    padding: 1.2rem;
                    border-radius: 12px;
                    font-weight: 900;
                }

                .mobile-hamburger {
                    display: none;
                    background: none;
                    border: none;
                    font-size: 2rem;
                    cursor: pointer;
                }

                /* Animations */
                .fade-in-up { animation: fadeInUp 0.8s ease-out; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideDown { from { transform: translateY(-30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

                /* Responsiveness */
                @media (max-width: 1024px) {
                    .hero-headline { font-size: 3.5rem; }
                    .main-nav { padding: 15px 5%; }
                    .top-utility-bar { display: none; }
                }

                @media (max-width: 768px) {
                    .desktop-only { display: none; }
                    .mobile-hamburger { display: block; }
                    .hero-headline { font-size: 2.8rem; }
                    .hero-summary { font-size: 1.1rem; }
                    .hero-action-group { flex-direction: column; }
                    .footer-main-row { flex-direction: column; gap: 40px; text-align: center; }
                    .footer-info { flex-direction: column; gap: 15px; }
                }
            `}</style>
        </div>
    )
}

export default Landing
