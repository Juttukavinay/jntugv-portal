import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../App.css'

const departments = [
    {
        name: "Computer Science & Engineering",
        image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800",
        description: "Focuses on computer systems, software engineering, and computational theory."
    },
    {
        name: "Electronics & Communication Engineering",
        image: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&q=80&w=800",
        description: "Deals with electronic devices, circuits, communication equipment, and systems."
    },
    {
        name: "Mechanical Engineering",
        image: "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&q=80&w=800",
        description: "Involves the design, analysis, manufacturing, and maintenance of mechanical systems."
    },
    {
        name: "Electrical & Electronics Engineering",
        image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=800",
        description: "Covers electricity, electronics, and electromagnetism in various application areas."
    },
    {
        name: "Information Technology",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800",
        description: "Focuses on the use of computers and telecommunications to store, retrieve, transmit and manipulate data."
    },
    {
        name: "Metallurgical Engineering",
        image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=800",
        description: "Study of metals and their properties, extraction, and processing into useful products."
    },
    {
        name: "Civil Engineering",
        image: "https://images.unsplash.com/photo-1503387762-592dea58ef23?auto=format&fit=crop&q=80&w=800",
        description: "Concentrates on the design, construction, and maintenance of the physical and naturally built environment."
    },
    {
        name: "BS & HSS",
        image: "https://images.unsplash.com/photo-1532094349884-543bb11783bb?auto=format&fit=crop&q=80&w=800",
        description: "Basic Sciences and Humanities & Social Sciences provide the foundation for engineering education."
    },
    {
        name: "Master's in Business Administration",
        image: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&q=80&w=800",
        description: "Focuses on management techniques, business strategies, and leadership skills."
    }
];

function Departments() {
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) setIsScrolled(true)
            else setIsScrolled(false)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div className="dept-page-container">
            {/* Minimal Navbar for Dept Page */}
            <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
                <div className="logo-container">
                    <img src="/jntugv-logo.png" alt="JNTU-GV Logo" className="university-logo" style={{ height: '50px' }} />
                    <div className="logo-text-group">
                        <div className="logo-main">JNTU-GV</div>
                        <div className="logo-sub">University Departments</div>
                    </div>
                </div>
                <div className="nav-links desktop-only">
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/login" className="btn-glow">Sign In</Link>
                    <Link to="/faculty" className="nav-link">Faculty</Link>
                </div>
            </nav>

            <header className="dept-hero">
                <div className="content-wrapper">
                    <h1 className="hero-title">Our <span className="text-gradient-animated">Departments</span></h1>
                    <p className="hero-subtitle">Diverse academic disciplines fostering specialized knowledge and technical expertise.</p>
                </div>
            </header>

            <main className="dept-grid-section">
                <div className="content-wrapper">
                    <div className="dept-grid">
                        {departments.map((dept, index) => (
                            <div key={index} className="dept-card fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                                <div className="dept-image-wrapper">
                                    <img src={dept.image} alt={dept.name} className="dept-image" />
                                    <div className="dept-overlay">
                                        <button className="btn-view-details">Explore Dept</button>
                                    </div>
                                </div>
                                <div className="dept-card-content">
                                    <h3>{dept.name}</h3>
                                    <p>{dept.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <footer className="footer">
                <p>&copy; {new Date().getFullYear()} JNTU-GV. Academic Excellence & Innovation.</p>
            </footer>

            <style dangerouslySetInnerHTML={{
                __html: `
                .dept-page-container {
                    background: #f8fafc;
                    min-height: 100vh;
                }
                .dept-hero {
                    padding: 120px 0 60px;
                    background: linear-gradient(135deg, #c00000 0%, #900000 100%);
                    color: white;
                    text-align: center;
                }
                .dept-grid-section {
                    padding: 80px 0;
                }
                .dept-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                    gap: 40px;
                }
                .dept-card {
                    background: white;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    border: 1px solid #e2e8f0;
                }
                .dept-card:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                    border-color: var(--primary);
                }
                .dept-image-wrapper {
                    position: relative;
                    height: 220px;
                    overflow: hidden;
                }
                .dept-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.6s ease;
                }
                .dept-card:hover .dept-image {
                    transform: scale(1.1);
                }
                .dept-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(15, 23, 42, 0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                .dept-card:hover .dept-overlay {
                    opacity: 1;
                }
                .btn-view-details {
                    background: white;
                    color: #0f172a;
                    border: none;
                    padding: 10px 24px;
                    border-radius: 30px;
                    font-weight: 700;
                    cursor: pointer;
                    transform: translateY(20px);
                    transition: all 0.4s ease;
                }
                .dept-card:hover .btn-view-details {
                    transform: translateY(0);
                }
                .dept-card-content {
                    padding: 24px;
                }
                .dept-card-content h3 {
                    margin: 0 0 12px 0;
                    font-size: 1.25rem;
                    color: #0f172a;
                    line-height: 1.3;
                }
                .dept-card-content p {
                    color: #64748b;
                    font-size: 0.95rem;
                    line-height: 1.6;
                    margin: 0;
                }
                @media (max-width: 768px) {
                    .dept-grid {
                        grid-template-columns: 1fr;
                        padding: 0 20px;
                    }
                }
            `}} />
        </div>
    )
}

export default Departments
