import { useEffect, useState } from 'react'
import API_BASE_URL from '../config'
import { Link } from 'react-router-dom'
import '../App.css'

function Landing({ user }) {
    const [serverMsg, setServerMsg] = useState('Connecting...')
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [departments, setDepartments] = useState([])
    const [loadingDepts, setLoadingDepts] = useState(true)

    const fallbackDepts = [
        { name: 'Computer Science & Engineering', short: 'CSE', icon: '💻', color: '#EFF6FF', iconColor: '#2563EB' },
        { name: 'Electronics & Communication', short: 'ECE', icon: '📡', color: '#F0FDF4', iconColor: '#16A34A' },
        { name: 'Mechanical Engineering', short: 'MECH', icon: '⚙️', color: '#FFF7ED', iconColor: '#EA580C' },
        { name: 'Electrical Engineering', short: 'EEE', icon: '⚡', color: '#FFFBEB', iconColor: '#CA8A04' },
        { name: 'Information Technology', short: 'IT', icon: '🖥️', color: '#F5F3FF', iconColor: '#7C3AED' },
        { name: 'Civil Engineering', short: 'CIVIL', icon: '🏗️', color: '#E0FFF7', iconColor: '#0F766E' },
        { name: 'Metallurgical Engineering', short: 'META', icon: '🔩', color: '#FFF1F2', iconColor: '#BE123C' },
        { name: 'BS & HSS', short: 'BSH', icon: '📚', color: '#F0F9FF', iconColor: '#0EA5E9' },
        { name: 'MBA', short: 'MBA', icon: '💼', color: '#FDF4FF', iconColor: '#A21CAF' }
    ]

    useEffect(() => {
        fetch(`${API_BASE_URL}/api`)
            .then(res => res.json())
            .then(data => setServerMsg(data.message))
            .catch(() => setServerMsg('Server Offline'))

        // Fetch Departments from Backend
        fetch(`${API_BASE_URL}/api/departments`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    // Match backend names with our icon mapping
                    const mapped = data.map(d => {
                        const fb = fallbackDepts.find(f => f.name === d.name || f.short === d.name);
                        return {
                            ...fb,
                            name: d.name,
                            short: fb?.short || d.name.split(' ').map(w => w[0]).join('')
                        };
                    });
                    setDepartments(mapped);
                } else {
                    setDepartments(fallbackDepts);
                }
            })
            .catch(() => setDepartments(fallbackDepts))
            .finally(() => setLoadingDepts(false));

        const handleScroll = () => setIsScrolled(window.scrollY > 50)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const getDashboardLink = () => {
        if (!user) return '/login'
        const roleMap = {
            admin: '/dashboard/admin',
            principal: '/dashboard/principal',
            vice_principal: '/dashboard/vice-principal',
            hod: '/dashboard/hod',
            faculty: '/dashboard/faculty',
            student: '/dashboard/student'
        }
        return roleMap[user.role] || '/login'
    }

    return (
        <div className="app-container">
            {/* Sticky Navbar */}
            <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
                <div className="logo-container">
                    <img src="/jntugv-logo.png" alt="JNTU-GV Logo" className="university-logo" />
                    <div className="logo-text-group">
                        <div className="logo-main">JNTU-GV</div>
                        <div className="logo-sub">Vizianagaram</div>
                    </div>
                </div>

                {/* Desktop Links */}
                <div className="nav-links desktop-only">
                    <a href="#home" className="nav-link">Home</a>
                    <a href="#about" className="nav-link">About</a>

                    {/* Departments Dropdown - normal style like other links */}
                    <div className="nav-item-dropdown">
                        <Link to="/departments" className="nav-link">Departments ▾</Link>
                        <div className="dropdown-menu-premium">
                            {departments.map(d => (
                                <Link key={d.name} to="/departments">{d.name}</Link>
                            ))}
                        </div>
                    </div>
                    <a href="#features" className="nav-link">Features</a>
                </div>

                <div className="nav-actions desktop-only" style={{ display: 'flex', alignItems: 'center' }}>
                    <Link to="/login" className="btn-glow">Sign In →</Link>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="mobile-toggle"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)',
                        border: '1.5px solid #e2e8f0', width: '44px', height: '44px',
                        borderRadius: '10px', cursor: 'pointer', fontSize: '1.2rem',
                        color: '#1F1A12', transition: 'all 0.2s'
                    }}
                >
                    {isMobileMenuOpen ? '✕' : '☰'}
                </button>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="mobile-menu">
                        <a href="#home" onClick={() => setIsMobileMenuOpen(false)}>Home</a>
                        <a href="#about" onClick={() => setIsMobileMenuOpen(false)}>About</a>
                        <Link to="/departments" onClick={() => setIsMobileMenuOpen(false)}>Departments</Link>
                        <a href="#features" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
                        <Link
                            to="/login"
                            className="btn-mobile"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Sign In →
                        </Link>
                    </div>
                )}
            </nav>

            <main>
                {/* Hero Section */}
                <section className="hero-section" id="home">
                    {/* Decorative Blobs */}
                    <div className="blob blob-1"></div>
                    <div className="blob blob-2"></div>

                    <div className="hero-content" style={{ textAlign: 'center' }}>
                        <div className="status-indicator status-success" style={{ display: 'inline-flex', marginBottom: '2rem' }}>
                            <div className="status-dot pulse" style={{ background: 'var(--secondary)' }}></div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0F766E' }}>
                                {serverMsg === 'Server Offline' ? '🔴 Server Offline' : '🟢 Portal Active — ' + (serverMsg || 'Connected')}
                            </span>
                        </div>

                        <div className="badge-pill-hero" style={{ marginBottom: '1.5rem' }}>VIZIANAGARAM, ANDHRA PRADESH</div>

                        <h1 className="hero-title">
                            Welcome to <br />
                            <span className="text-gradient-animated">JNTU-GV Portal</span>
                        </h1>

                        <p className="hero-subtitle">
                            A unified smart academic management system for students, faculty, HODs, and administration — all in one place.
                        </p>

                        <div className="hero-actions" style={{ justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            <Link to="/login" className="btn-primary-lg">
                                Get Started →
                            </Link>
                            <a href="#about" className="btn-outline-lg">Learn More</a>
                        </div>

                        {/* Stats row */}
                        <div style={{
                            display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap',
                            marginTop: '3rem', padding: '1.5rem 2rem',
                            background: 'white', borderRadius: '16px',
                            border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)',
                            maxWidth: '700px', margin: '3rem auto 0'
                        }}>
                            {[
                                { label: 'Students', value: '2000+', icon: '🎓' },
                                { label: 'Faculty', value: '150+', icon: '👨‍🏫' },
                                { label: 'Departments', value: departments.length || '9', icon: '🏛️' },
                                { label: 'Est. Year', value: '2007', icon: '📅' }
                            ].map(stat => (
                                <div key={stat.label} style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem' }}>{stat.icon}</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-dark)' }}>{stat.value}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Departments as Cards Section */}
                <section className="info-section" id="departments">
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                            <div className="feature-label">ACADEMIC BRANCHES</div>
                            <h2 className="section-header-center" style={{ margin: 0 }}>
                                Our <span style={{ color: 'var(--primary)' }}>Departments</span>
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '1rem auto 0' }}>
                                Explore our diverse range of engineering and management programs
                            </p>
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                            gap: '1.25rem',
                            marginBottom: '2rem'
                        }}>
                            {departments.map(dept => (
                                <Link
                                    key={dept.name}
                                    to="/departments"
                                    style={{ textDecoration: 'none' }}
                                >
                                    <div style={{
                                        background: 'white', border: '1px solid var(--border-light)',
                                        borderRadius: '16px', padding: '1.5rem', textAlign: 'center',
                                        cursor: 'pointer', transition: 'all 0.3s ease',
                                        height: '100%'
                                    }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.transform = 'translateY(-4px)'
                                            e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
                                            e.currentTarget.style.borderColor = dept.iconColor
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.transform = 'translateY(0)'
                                            e.currentTarget.style.boxShadow = 'none'
                                            e.currentTarget.style.borderColor = 'var(--border-light)'
                                        }}
                                    >
                                        <div style={{
                                            width: '52px', height: '52px', borderRadius: '12px',
                                            background: dept.color, display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', fontSize: '1.5rem',
                                            margin: '0 auto 1rem', border: `1px solid ${dept.iconColor}20`
                                        }}>
                                            {dept.icon}
                                        </div>
                                        <div style={{ fontWeight: 700, color: dept.iconColor, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                                            {dept.short}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                                            {dept.name}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <Link to="/departments" className="btn-outline-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                View All Departments →
                            </Link>
                        </div>
                    </div>
                </section>

                {/* About Section */}
                <section className="info-section alt-bg" id="about">
                    <div className="content-wrapper">
                        <div className="text-content">
                            <div className="feature-label">EST. 2007</div>
                            <h2 className="section-title">Academic <span className="highlight">Excellence</span></h2>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
                                JNTU-GV stands as a beacon of technical education, fostering innovation and research. Our platform provides a seamless digital experience for every stakeholder in the academic ecosystem.
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="facility-card-simple">
                                    <h4>🏛️ Established</h4>
                                    <p>Founded in 2007, elevated to University status in 2022.</p>
                                </div>
                                <div className="facility-card-simple">
                                    <h4>📚 Resources</h4>
                                    <p>Dr. Y.S.R. Central Library with thousands of volumes.</p>
                                </div>
                                <div className="facility-card-simple">
                                    <h4>🔬 Research</h4>
                                    <p>Active research centers and innovation labs.</p>
                                </div>
                                <div className="facility-card-simple">
                                    <h4>🎯 Placements</h4>
                                    <p>Strong industry partnerships and placement records.</p>
                                </div>
                            </div>
                        </div>
                        <div className="image-content">
                            <img
                                src="/jntugv-first-year-block.jpg"
                                alt="Academic Block"
                                className="rounded-image"
                                style={{ boxShadow: 'var(--shadow-xl)' }}
                            />
                        </div>
                    </div>
                </section>

                {/* Parallax Section */}
                <section className="parallax-section" style={{ backgroundImage: 'url("/jntugv-main-block.png")', height: '380px' }}>
                    <div className="parallax-overlay">
                        <div style={{ textAlign: 'center', color: 'white', padding: '0 2rem' }}>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 1rem 0' }}>Shaping the Future</h2>
                            <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '700px', margin: '0 auto 2rem' }}>
                                Dedicated to providing world-class technological education and fostering an environment of research and digital excellence.
                            </p>
                            <Link to="/login" className="btn-glow" style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}>
                                Join the Portal →
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Portal Features Section */}
                <section className="info-section" id="portal">
                    <div className="content-wrapper reverse">
                        <div className="text-content">
                            <div className="feature-label">SMART PORTAL</div>
                            <h2 className="section-title">Digital <span className="highlight">Ecosystem</span></h2>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                                Our bespoke portal provides a unified interface for students and faculty to manage academics, attendance, and communication with ease.
                            </p>
                            <ul style={{ listStyle: 'none', padding: 0, marginTop: '1.5rem' }}>
                                {[
                                    'Role-based Access (Student, Faculty, HOD, Principal)',
                                    'Real-time Attendance Tracking & Reports',
                                    'Smart Timetable Management',
                                    'Automated Communication Center',
                                    'Export reports as CSV, Excel & PDF'
                                ].map(item => (
                                    <li key={item} style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                        <span style={{ color: 'var(--secondary)', fontWeight: 'bold', fontSize: '1.1rem', flexShrink: 0 }}>✓</span>
                                        <span style={{ color: 'var(--text-secondary)' }}>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="image-content">
                            <img
                                src="/jntugv-main-block.png"
                                alt="Portal Interface"
                                className="rounded-image"
                                style={{ border: '4px solid white', boxShadow: 'var(--shadow-xl)' }}
                            />
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="features-grid-section" id="features">
                    <div className="feature-label" style={{ marginBottom: '0.5rem' }}>WHY CHOOSE US</div>
                    <h2 className="section-header-center">Core <span style={{ color: 'var(--primary)' }}>Pillars</span></h2>
                    <div className="features-grid">
                        <div className="feature-card-glass">
                            <div className="icon">⚡</div>
                            <h3>Performance</h3>
                            <p>Blazing fast interface optimized for real-time updates across all devices and connections.</p>
                        </div>
                        <div className="feature-card-glass">
                            <div className="icon">🛡️</div>
                            <h3>Security</h3>
                            <p>Robust role-based access control and data protection for all university stakeholders.</p>
                        </div>
                        <div className="feature-card-glass">
                            <div className="icon">📊</div>
                            <h3>Analytics</h3>
                            <p>Advanced attendance analytics and academic insights with exportable reports.</p>
                        </div>
                        <div className="feature-card-glass">
                            <div className="icon">📱</div>
                            <h3>Mobile First</h3>
                            <p>Fully responsive design that works beautifully on phones, tablets and desktops.</p>
                        </div>
                        <div className="feature-card-glass">
                            <div className="icon">🤖</div>
                            <h3>AI Powered</h3>
                            <p>Gemini AI integrated timetable assistant for smart scheduling suggestions.</p>
                        </div>
                        <div className="feature-card-glass">
                            <div className="icon">📧</div>
                            <h3>Communication</h3>
                            <p>Built-in communication center for notices, circulars and announcements.</p>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="footer">
                <p>© {new Date().getFullYear()} JNTU-GV — Department of Information Technology. Designed with ❤️ for academic excellence.</p>
            </footer>
        </div>
    )
}

export default Landing
