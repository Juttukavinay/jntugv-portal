import { Link } from 'react-router-dom'
import '../App.css'

const departments = [
    {
        name: 'Computer Science & Engineering',
        short: 'CSE',
        icon: '💻',
        color: '#2563EB',
        bg: '#EFF6FF',
        border: '#BFDBFE',
        image: '/jntugv-main-block.png',
        description: 'Cutting-edge curriculum covering algorithms, AI/ML, cloud computing, cybersecurity and software engineering.',
        programs: ['B.Tech CSE', 'M.Tech CSE', 'Ph.D'],
        highlights: ['NAAC Accredited', 'NBA Certified', '100% Placement']
    },
    {
        name: 'Electronics & Communication Engineering',
        short: 'ECE',
        icon: '📡',
        color: '#16A34A',
        bg: '#F0FDF4',
        border: '#BBF7D0',
        image: '/jntugv-first-year-block.jpg',
        description: 'From VLSI design to wireless communications — shaping the next generation of electronics engineers.',
        programs: ['B.Tech ECE', 'M.Tech VLSI', 'Ph.D'],
        highlights: ['Research Labs', 'Industry Tie-ups', 'Innovation Hub']
    },
    {
        name: 'Mechanical Engineering',
        short: 'MECH',
        icon: '⚙️',
        color: '#EA580C',
        bg: '#FFF7ED',
        border: '#FED7AA',
        image: '/jntugv-main-block.png',
        description: 'Advanced manufacturing, thermodynamics, robotics and design — engineering solutions for tomorrow.',
        programs: ['B.Tech MECH', 'M.Tech CAD/CAM', 'Ph.D'],
        highlights: ['Workshop Labs', 'CAD/CAM Centre', 'Auto Club']
    },
    {
        name: 'Electrical & Electronics Engineering',
        short: 'EEE',
        icon: '⚡',
        color: '#CA8A04',
        bg: '#FFFBEB',
        border: '#FDE68A',
        image: '/jntugv-main-block.png',
        description: 'Power systems, control engineering, renewable energy and smart grid technologies at the forefront.',
        programs: ['B.Tech EEE', 'M.Tech Power Systems', 'Ph.D'],
        highlights: ['Power Lab', 'Smart Grid', 'IEEE Chapter']
    },
    {
        name: 'Information Technology',
        short: 'IT',
        icon: '🖥️',
        color: '#7C3AED',
        bg: '#F5F3FF',
        border: '#DDD6FE',
        image: '/jntugv-main-block.png',
        description: 'Web technologies, databases, networking and digital transformation skills that the industry demands.',
        programs: ['B.Tech IT', 'M.Tech IT', 'Ph.D'],
        highlights: ['Digital Lab', 'Start-up Cell', 'Tech Fest']
    },
    {
        name: 'Metallurgical Engineering',
        short: 'META',
        icon: '🔩',
        color: '#BE123C',
        bg: '#FFF1F2',
        border: '#FECDD3',
        image: '/jntugv-main-block.png',
        description: 'Materials science, process metallurgy and extractive metallurgy for industrial applications.',
        programs: ['B.Tech META', 'M.Tech Materials', 'Ph.D'],
        highlights: ['Materials Lab', 'Industry Projects', 'Research Focus']
    },
    {
        name: 'Civil Engineering',
        short: 'CIVIL',
        icon: '🏗️',
        color: '#0F766E',
        bg: '#F0FDFA',
        border: '#99F6E4',
        image: '/jntugv-main-block.png',
        description: 'Structural engineering, transportation, environmental engineering and sustainable infrastructure design.',
        programs: ['B.Tech CIVIL', 'M.Tech Structures', 'Ph.D'],
        highlights: ['Model Lab', 'Survey Equipment', 'GIS Lab']
    },
    {
        name: 'Basic Sciences & Humanities',
        short: 'BSH',
        icon: '📚',
        color: '#0EA5E9',
        bg: '#F0F9FF',
        border: '#BAE6FD',
        image: '/jntugv-main-block.png',
        description: 'Mathematics, physics, chemistry, English and communication skills that form the bedrock of engineering.',
        programs: ['All B.Tech Programs', 'Research Support'],
        highlights: ['Physics Lab', 'Chemistry Lab', 'Language Lab']
    },
    {
        name: 'Master of Business Administration',
        short: 'MBA',
        icon: '💼',
        color: '#A21CAF',
        bg: '#FDF4FF',
        border: '#F0ABFC',
        image: '/jntugv-main-block.png',
        description: 'Business strategy, finance, marketing and entrepreneurship programs for future industry leaders.',
        programs: ['MBA (2 Year)', 'Executive Programs'],
        highlights: ['Case Studies', 'Industry Mentors', 'Placements']
    }
]

function Departments() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-main)', fontFamily: "'Outfit', sans-serif" }}>
            {/* Mini Navbar */}
            <nav style={{
                background: 'white', borderBottom: '1px solid var(--border-light)',
                padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '1rem',
                position: 'sticky', top: 0, zIndex: 100, boxShadow: 'var(--shadow-sm)'
            }}>
                <Link to="/" style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem',
                    textDecoration: 'none', border: '1.5px solid var(--border-light)',
                    padding: '0.5rem 1rem', borderRadius: '8px', transition: 'all 0.2s',
                    background: 'white'
                }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                >
                    ← Back to Home
                </Link>
                <span style={{ color: 'var(--border-light)' }}>|</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src="/jntugv-logo.png" alt="Logo" style={{ height: '32px' }} />
                    <span style={{ fontWeight: 700, color: 'var(--accent-dark)' }}>JNTU-GV Departments</span>
                </div>
            </nav>

            {/* Hero Header */}
            <div style={{
                background: 'var(--accent-dark)',
                padding: '4rem 2rem',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Blobs */}
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: 'var(--primary)', opacity: 0.15, filter: 'blur(60px)' }} />
                <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: 'var(--secondary)', opacity: 0.15, filter: 'blur(60px)' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{
                        display: 'inline-block', padding: '0.4rem 1rem', background: 'rgba(255,107,107,0.2)',
                        border: '1px solid rgba(255,107,107,0.3)', borderRadius: '99px',
                        color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600,
                        textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem'
                    }}>
                        Academic Programs
                    </div>
                    <h1 style={{ fontSize: '2.75rem', fontWeight: 800, color: 'white', margin: '0 0 1rem 0', letterSpacing: '-0.03em' }}>
                        Our Departments
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.7, fontSize: '1.05rem' }}>
                        Explore our nine departments offering world-class B.Tech, M.Tech, MBA and Ph.D programs across engineering and management disciplines.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '2rem', flexWrap: 'wrap' }}>
                        {[
                            { label: 'Programs', value: '9' },
                            { label: 'Students', value: '2000+' },
                            { label: 'Faculty', value: '150+' },
                            { label: 'Research Labs', value: '25+' }
                        ].map(s => (
                            <div key={s.label} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white' }}>{s.value}</div>
                                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Department Cards */}
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '4rem 2rem' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                    gap: '1.75rem'
                }}>
                    {departments.map((dept, i) => (
                        <div
                            key={dept.short}
                            style={{
                                background: 'white', borderRadius: '20px',
                                border: '1px solid var(--border-light)', overflow: 'hidden',
                                transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                                cursor: 'default', display: 'flex', flexDirection: 'column',
                                animation: `fadeIn 0.5s ease-out ${i * 0.05}s backwards`
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-6px)'
                                e.currentTarget.style.boxShadow = 'var(--shadow-xl)'
                                e.currentTarget.style.borderColor = dept.color + '40'
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.boxShadow = 'none'
                                e.currentTarget.style.borderColor = 'var(--border-light)'
                            }}
                        >
                            {/* Card Top Strip */}
                            <div style={{
                                height: '6px',
                                background: `linear-gradient(90deg, ${dept.color}, ${dept.color}80)`
                            }} />

                            <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                {/* Icon + Name */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                                    <div style={{
                                        width: '56px', height: '56px', borderRadius: '14px',
                                        background: dept.bg, border: `2px solid ${dept.border}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.75rem', flexShrink: 0
                                    }}>
                                        {dept.icon}
                                    </div>
                                    <div>
                                        <div style={{
                                            display: 'inline-block', padding: '2px 10px',
                                            background: dept.bg, color: dept.color,
                                            borderRadius: '99px', fontSize: '0.7rem',
                                            fontWeight: 700, letterSpacing: '1px',
                                            marginBottom: '0.25rem'
                                        }}>{dept.short}</div>
                                        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-dark)', lineHeight: 1.3 }}>
                                            {dept.name}
                                        </h3>
                                    </div>
                                </div>

                                {/* Description */}
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.65, margin: '0 0 1.25rem 0', flex: 1 }}>
                                    {dept.description}
                                </p>

                                {/* Highlights */}
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                                    {dept.highlights.map(h => (
                                        <span key={h} style={{
                                            padding: '3px 10px', background: dept.bg,
                                            color: dept.color, borderRadius: '99px',
                                            fontSize: '0.72rem', fontWeight: 600,
                                            border: `1px solid ${dept.border}`
                                        }}>{h}</span>
                                    ))}
                                </div>

                                {/* Programs */}
                                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                                        Programs Offered
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                        {dept.programs.map(p => (
                                            <span key={p} style={{
                                                padding: '4px 10px', background: 'var(--bg-subtle)',
                                                color: 'var(--text-secondary)', borderRadius: '6px',
                                                fontSize: '0.75rem', fontWeight: 500
                                            }}>{p}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div style={{
                    marginTop: '4rem', textAlign: 'center', padding: '3rem',
                    background: 'var(--accent-dark)', borderRadius: '24px', position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'var(--primary)', opacity: 0.1, filter: 'blur(40px)' }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', margin: '0 0 1rem 0' }}>
                            Ready to Join JNTU-GV?
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem', fontSize: '1rem' }}>
                            Sign in to access your personalized academic dashboard.
                        </p>
                        <Link to="/login" style={{
                            display: 'inline-block', padding: '0.875rem 2.5rem',
                            background: 'linear-gradient(135deg, var(--primary), #FF8E8E)',
                            color: 'white', borderRadius: '12px', fontWeight: 700, fontSize: '1rem',
                            textDecoration: 'none', boxShadow: '0 8px 25px rgba(255,107,107,0.4)',
                            transition: 'all 0.3s'
                        }}>
                            Access Portal →
                        </Link>
                    </div>
                </div>
            </div>

            <footer style={{
                background: 'var(--accent-dark)', color: 'rgba(255,255,255,0.5)',
                textAlign: 'center', padding: '1.5rem', fontSize: '0.85rem'
            }}>
                © {new Date().getFullYear()} JNTU-GV — Vizianagaram. All rights reserved.
            </footer>
        </div>
    )
}

export default Departments
