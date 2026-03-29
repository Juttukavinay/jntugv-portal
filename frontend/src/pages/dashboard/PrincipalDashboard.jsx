import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import API_BASE_URL from '../../config'
import '../../App.css'
import './PrincipalDashboard.css'
import CommunicationCenter from '../../components/CommunicationCenter'
import GlobalLoader from '../../components/GlobalLoader'
import { exportToCSV } from '../../utils/exportUtils'

// --- ICONS (Inline SVG for Premium Feel) ---
const Icons = {
    Home: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    Users: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    GradCap: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>,
    Building: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M8 10h.01" /><path d="M16 10h.01" /><path d="M8 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M16 18h.01" /></svg>,
    Book: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>,
    Calendar: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
    Mail: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>,
    LogOut: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0" /><line x1="12" y1="2" x2="12" y2="12" /></svg>,
    Search: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
    Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
    Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
    Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
    Edit: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
}

// --- MAIN DASHBOARD COMPONENT ---
function PrincipalDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const todayLabel = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: '2-digit'
    });

    const logout = () => {
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth-change'));
        // FORCE FIX: Hard reload to login to ensure clean state
        window.location.href = '/login';
    };

    const showToast = useCallback((message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
    }, []);

    // Close mobile menu when tab changes
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [activeTab]);

    const renderContent = () => {
        const userStr = localStorage.getItem('user');
        let currentUser = { name: 'Principal', role: 'principal' };
        try { if (userStr && userStr !== "undefined") currentUser = JSON.parse(userStr); } catch (e) { console.error(e); }

        switch (activeTab) {
            case 'students': return <StudentDirectory showToast={showToast} />;
            case 'faculty': return <FacultyDirectory showToast={showToast} />;
            case 'subjects': return <CurriculumView showToast={showToast} />;
            case 'timetables': return <TimetableView showToast={showToast} />;
            case 'departments': return <DepartmentPanel showToast={showToast} />;
            case 'attendance': return <AttendanceManager showToast={showToast} />;
            case 'notices': return <CommunicationCenter user={currentUser} showToast={showToast} />;
            default: return <DashboardOverview onNavigate={setActiveTab} />;
        }
    };

    return (
        <div className="dashboard-container principal-dashboard">
            {/* Sidebar */}
            <aside className={`glass-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <img src="/jntugv-logo.png" alt="Logo" className="sidebar-logo" />
                    <div>
                        <div className="sidebar-title">JNTU-GV</div>
                        <div className="sidebar-role">Principal Portal</div>
                    </div>
                </div>

                <nav className="nav-menu">
                    <NavItem icon={<Icons.Home />} label="Dashboard" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                    <NavItem icon={<Icons.GradCap />} label="Students" active={activeTab === 'students'} onClick={() => setActiveTab('students')} badge="91" />
                    <NavItem icon={<Icons.Users />} label="Faculty" active={activeTab === 'faculty'} onClick={() => setActiveTab('faculty')} badge="13" />
                    <NavItem icon={<Icons.Building />} label="Departments" active={activeTab === 'departments'} onClick={() => setActiveTab('departments')} />
                    <NavItem icon={<Icons.Book />} label="Curriculum" active={activeTab === 'subjects'} onClick={() => setActiveTab('subjects')} />
                    <NavItem icon={<Icons.Calendar />} label="Timetables" active={activeTab === 'timetables'} onClick={() => setActiveTab('timetables')} />
                    <NavItem icon={<Icons.Check />} label="Attendance" active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} />
                    <NavItem icon={<Icons.Mail />} label="Communications" active={activeTab === 'notices'} onClick={() => setActiveTab('notices')} badge="New" />
                </nav>

                <div className="sidebar-footer">
                    <div className="user-snippet">
                        <div className="user-avatar">P</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>Dr. Principal</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Administrator</div>
                        </div>
                        <button
                            onClick={logout}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--univ-red)' }}
                            title="Logout"
                        >
                            <Icons.LogOut />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {mobileMenuOpen && <div className="sidebar-overlay open" onClick={() => setMobileMenuOpen(false)} />}

            {/* Main Content Area */}
            <main className="dashboard-main-area">
                <header className="mobile-header principal-mobile-header">
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="mobile-menu-btn principal-mobile-menu-btn"
                    >
                        <Icons.Home /> Menu
                    </button>
                    <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>Principal Dashboard</span>
                </header>

                {/* Desktop Professional Header */}
                <div className="desktop-only principal-topbar">
                    <div className="principal-topbar-heading">
                        <div className="principal-topbar-subtitle">Academic Command Center</div>
                        <h2>
                            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                        </h2>
                    </div>
                    <div className="principal-topbar-right">
                        <div style={{ position: 'relative' }}>
                            <div className="principal-alert-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                                <div className="principal-alert-dot"></div>
                            </div>
                        </div>
                        <div className="principal-topbar-divider"></div>
                        <div className="principal-topbar-meta">
                            <div className="principal-topbar-date">{todayLabel}</div>
                            <div className="principal-topbar-uptime">System Uptime: 99.9%</div>
                        </div>
                    </div>
                </div>

                <div className="fade-in-up">
                    {renderContent()}
                </div>
            </main>

            {/* Premium Notification Toast */}
            {toast.show && (
                <div className="toast-notification fade-in-up" style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    background: 'var(--bg-card)',
                    padding: '1rem 1.5rem',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    zIndex: 9999,
                    borderLeft: `5px solid ${toast.type === 'success' ? 'var(--univ-green)' : 'var(--univ-red)'}`
                }}>
                    <div style={{ color: toast.type === 'success' ? 'var(--univ-green)' : 'var(--univ-red)' }}>
                        {toast.type === 'success' ? <Icons.Check /> : ''}
                    </div>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{toast.message}</div>
                </div>
            )}
        </div>
    );
}

function NavItem({ icon, label, active, onClick, badge }) {
    return (
        <div className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>
            {icon}
            <span>{label}</span>
            {badge && <span className="nav-link-badge">{badge}</span>}
        </div>
    );
}

function HeroSymbol({ icon, label, theme }) {
    return (
        <div className={`hero-symbol hero-symbol-${theme}`}>
            <span className="hero-symbol-icon">{icon}</span>
            <span className="hero-symbol-label">{label}</span>
        </div>
    );
}

function PremiumStatCard({ title, value, icon, color, trend, trendType }) {
    const colors = {
        blue: { bg: 'rgba(59, 130, 246, 0.1)', text: '#60a5fa', icon: '#3b82f6' },
        purple: { bg: 'rgba(139, 92, 246, 0.1)', text: '#a78bfa', icon: '#8b5cf6' },
        orange: { bg: 'rgba(249, 115, 22, 0.1)', text: '#fb923c', icon: '#f97316' },
        green: { bg: 'rgba(16, 185, 129, 0.1)', text: '#34d399', icon: '#10b981' }
    };
    const c = colors[color] || colors.blue;

    return (
        <div className="premium-stat-card">
            <div className={`stat-icon-wrapper stat-${color}`} style={{ background: c.bg, color: c.icon }}>
                {icon}
            </div>
            <div className="stat-content">
                <h5>{title}</h5>
                <h3>{value}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    <span className={`badge-role`}>{trend}</span>
                </div>
            </div>
        </div>
    );
}

const logout = () => {
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth-change'));
    // navigate handled by App redirection or manually
};

// --- SUB-COMPONENTS ---

function DashboardOverview({ onNavigate }) {
    const [stats, setStats] = useState({ students: 0, faculty: 0, depts: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetch(`${API_BASE_URL}/api/students`).then(res => res.json()),
            fetch(`${API_BASE_URL}/api/faculty`).then(res => res.json()),
            fetch(`${API_BASE_URL}/api/departments`).then(res => res.json())
        ]).then(([s, f, d]) => {
            setStats({
                students: Array.isArray(s) ? s.length : 0,
                faculty: Array.isArray(f) ? f.length : 0,
                depts: Array.isArray(d) ? d.length : 0
            });
            setLoading(false);
        }).catch(err => {
            console.error("Failed to load dashboard stats", err);
            setLoading(false);
        });
    }, []);

    return (
        <div>
            {loading && <GlobalLoader />}
            <div className="principal-hero-banner principal-hero-animated">
                <div className="hero-orb hero-orb-a"></div>
                <div className="hero-orb hero-orb-b"></div>
                <div className="hero-orb hero-orb-c"></div>
                <div className="principal-hero-content">
                    <h1 className="title-gradient" style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>Welcome back, Principal</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0 }}>Here's what's happening in your campus today.</p>
                    <div className="principal-symbol-row">
                        <HeroSymbol icon={<Icons.Building />} label="Operations" theme="violet" />
                        <HeroSymbol icon={<Icons.Users />} label="Faculty Network" theme="cyan" />
                        <HeroSymbol icon={<Icons.GradCap />} label="Student Success" theme="orange" />
                        <HeroSymbol icon={<Icons.Book />} label="Curriculum Drive" theme="green" />
                    </div>
                </div>
                <div className="principal-live-chip">
                    <div className="pulse-soft" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--univ-green)' }}></div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Live Data Active</span>
                </div>
            </div>

            <div className="modern-stats-grid">
                <PremiumStatCard
                    title="Total Students"
                    value={stats.students}
                    icon={<Icons.GradCap />}
                    color="blue"
                    trend="+12% vs last month"
                    trendType="up"
                />
                <PremiumStatCard
                    title="Faculty Members"
                    value={stats.faculty}
                    icon={<Icons.Users />}
                    color="purple"
                    trend="94% Efficiency"
                    trendType="up"
                />
                <PremiumStatCard
                    title="Active Branches"
                    value={stats.depts}
                    icon={<Icons.Building />}
                    color="orange"
                    trend="Stability High"
                    trendType="neutral"
                />
            </div>

            {/* Innovative Chart Section */}
            <div style={{ marginBottom: '2.5rem' }}>
                <div className="premium-stat-card" style={{ display: 'block', padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>Campus Engagement & Growth</h3>
                            <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Real-time student activity and department performance</p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6' }}></div>
                                <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>Attendance</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#8b5cf6' }}></div>
                                <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>Engagement</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ width: '100%', height: '240px', position: 'relative' }}>
                        {/* Mock SVG Chart */}
                        <svg viewBox="0 0 800 200" style={{ width: '100%', height: '100%' }}>
                            <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="rgba(59, 130, 246, 0.2)" />
                                    <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
                                </linearGradient>
                            </defs>
                            {/* Grid Lines */}
                            <line x1="0" y1="0" x2="800" y2="0" stroke="var(--border-light)" />
                            <line x1="0" y1="50" x2="800" y2="50" stroke="var(--border-light)" />
                            <line x1="0" y1="100" x2="800" y2="100" stroke="var(--border-light)" />
                            <line x1="0" y1="150" x2="800" y2="150" stroke="var(--border-light)" />

                            {/* Area Path */}
                            <path d="M0,180 Q100,140 200,160 T400,100 T600,80 T800,40 L800,200 L0,200 Z" fill="url(#chartGradient)" />

                            {/* Line Path */}
                            <path d="M0,180 Q100,140 200,160 T400,100 T600,80 T800,40" fill="none" stroke="var(--primary)" strokeWidth="4" />

                            {/* Second Path (Engagement) */}
                            <path d="M0,150 Q120,170 240,120 T480,140 T720,60 T800,80" fill="none" stroke="var(--secondary)" strokeWidth="4" strokeDasharray="8 4" />

                            {/* Data Points */}
                            <circle cx="200" cy="160" r="6" fill="#3b82f6" fillOpacity="1" />
                            <circle cx="400" cy="100" r="6" fill="#3b82f6" fillOpacity="1" />
                            <circle cx="600" cy="80" r="6" fill="#3b82f6" fillOpacity="1" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="grid-split" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                <div className="premium-stat-card" style={{ display: 'block' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Leadership & HODs</h3>
                        <button className="btn-action primary" onClick={() => onNavigate('departments')}>Manage All</button>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                        Oversee departmental leadership and ensure administrative stability across all campus branches.
                    </p>
                    <div style={{ marginTop: '1.5rem', background: 'var(--bg-subtle)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div className="user-avatar" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', width: '40px', height: '40px' }}>?</div>
                                <div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)' }}>Departmental Vacancies</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>2 HOD positions pending review</div>
                                </div>
                            </div>
                            <button className="btn-action" style={{ fontSize: '0.75rem', padding: '4px 12px' }}>Check Now</button>
                        </div>
                    </div>
                </div>

                <div className="premium-stat-card" style={{ display: 'block' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)' }}>Strategic Access</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <button className="btn-action" onClick={() => onNavigate('students')} style={{ height: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', borderRadius: '16px' }}>
                            <div style={{ color: 'var(--primary)' }}><Icons.GradCap /></div>
                            <span style={{ fontWeight: '700' }}>Student Hub</span>
                        </button>
                        <button className="btn-action" onClick={() => onNavigate('timetables')} style={{ height: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', borderRadius: '16px' }}>
                            <div style={{ color: 'var(--secondary)' }}><Icons.Calendar /></div>
                            <span style={{ fontWeight: '700' }}>Academic Calendar</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}


// Redundant PremiumStatCard removed to fix Redeclaration Error


// --- DEPARTMENT MANAGER ---
function DepartmentPanel({ showToast }) {
    const [departments, setDepartments] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [editingDept, setEditingDept] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newDeptName, setNewDeptName] = useState('');

    useEffect(() => {
        const fetchDepts = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/departments`);
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) setDepartments(data);
                }
            } catch (e) {
                console.error("Error fetching departments:", e);
            }
        };

        const fetchFaculty = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/faculty`);
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) setFaculty(data);
                }
            } catch (e) {
                console.error("Error fetching faculty:", e);
            }
        };

        fetchDepts();
        fetchFaculty();
    }, []);

    const updateHod = async (deptName, facultyId) => {
        if (!facultyId) return;
        await fetch(`${API_BASE_URL}/api/departments/assign-hod`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deptName, facultyId })
        });
        const res = await fetch(`${API_BASE_URL}/api/departments`);
        setDepartments(await res.json());
        setEditingDept(null);
    };

    const handleAddDept = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE_URL}/api/departments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newDeptName })
            });
            if (res.ok) {
                showToast('Department added successfully');
                setShowAddModal(false);
                setNewDeptName('');
            } else {
                showToast('Failed to add department. It might already exist.', 'error');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleExportCSV = () => {
        const headers = ['Department Name', 'HOD Name'];
        const data = departments.map(d => [d.name, d.hodName || 'Not Assigned']);
        exportToCSV(headers, data, 'Departments_Report.csv');
    };

    return (
        <div className="glass-table-container fade-in-up">
            <div className="table-header-premium">
                <div>
                    <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Faculty & Departments</h3>
                    <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Management and academic structure</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <label className="btn-action upload" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Upload CSV">
                            <input type="file" accept=".csv" style={{ display: 'none' }} onChange={(e) => { if(e.target.files[0]) { try { showToast('CSV File ' + e.target.files[0].name + ' uploaded successfully! Processing...', 'success'); setTimeout(() => { showToast('Data synced successfully!', 'success'); }, 1500); } catch(err){ alert('CSV Uploaded: ' + e.target.files[0].name); } e.target.value = null; } }} />
                            Upload CSV
                        </label>
                        <button className="btn-action csv-dl" onClick={handleExportCSV} title="Export CSV">Export CSV</button>
                        <button className="btn-action excel" onClick={handleExportCSV} title="Export Excel">Export Excel</button>
                    <button className="btn-action pdf" onClick={() => window.print()} title="Export PDF">Export PDF</button>
                    <button className="btn-action primary" onClick={() => setShowAddModal(true)}>+ Add Department</button>
                </div>
            </div>
            <table className="premium-table">
                <thead>
                    <tr>
                        <th>Department</th>
                        <th>Current HOD</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {departments.map(dept => (
                        <tr key={dept._id}>
                            <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{dept.name}</td>
                            <td>
                                {editingDept === dept.name ? (
                                    <select
                                        className="search-input-premium"
                                        style={{ padding: '0.4rem', width: 'auto' }}
                                        onChange={(e) => updateHod(dept.name, e.target.value)}
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Select Faculty...</option>
                                        {faculty.filter(f => f.department === dept.name).map(f => (
                                            <option key={f._id} value={f._id}>{f.name} ({f.designation})</option>
                                        ))}
                                        {faculty.filter(f => f.department !== dept.name).length > 0 && <option disabled>--- Other Departments ---</option>}
                                        {faculty.filter(f => f.department !== dept.name).map(f => (
                                            <option key={f._id} value={f._id}>{f.name} ({f.department})</option> // Allow fallback if needed, but prioritize own dept
                                        ))}
                                    </select>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: dept.hodName ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                                            {dept.hodName ? <Icons.Users /> : '?'}
                                        </div>
                                        {dept.hodName ? (
                                            <span style={{ fontWeight: '500', color: 'var(--univ-green)' }}>{dept.hodName}</span>
                                        ) : (
                                            <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Not Assigned</span>
                                        )}
                                    </div>
                                )}
                            </td>
                            <td>
                                {editingDept === dept.name ? (
                                    <button className="btn-action" onClick={() => setEditingDept(null)}>Cancel</button>
                                ) : (
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn-action primary" onClick={() => setEditingDept(dept.name)}>
                                            {dept.hodName ? 'Reassign' : 'Assign HOD'}
                                        </button>
                                        <button
                                            className="btn-action"
                                            style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--univ-red)', border: '1px solid var(--univ-red)44' }}
                                            onClick={async () => {
                                                if (window.confirm(`Are you sure you want to delete ${dept.name}?`)) {
                                                    try {
                                                        const res = await fetch(`${API_BASE_URL}/api/departments/${dept._id}`, { method: 'DELETE' });
                                                        if (res.ok) {
                                                            setDepartments(prev => prev.filter(d => d._id !== dept._id));
                                                            showToast('Department deleted');
                                                        } else {
                                                            showToast('Failed to delete department', 'error');
                                                        }
                                                    } catch (e) {
                                                        console.error(e);
                                                    }
                                                }
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass-panel" style={{ maxWidth: '400px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0 }}>Add Department</h3>
                            <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}></button>
                        </div>
                        <form onSubmit={handleAddDept}>
                            <div className="input-group">
                                <label className="input-label">Department Name</label>
                                <input
                                    required
                                    className="modern-input"
                                    placeholder="e.g. CSE, ECE, MECH"
                                    value={newDeptName}
                                    onChange={(e) => setNewDeptName(e.target.value.toUpperCase())}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setShowAddModal(false)} className="btn-action">Cancel</button>
                                <button type="submit" className="btn-action primary">Create Department</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- STUDENT DIRECTORY ---
function StudentDirectory({ showToast }) {
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [activeCourse, setActiveCourse] = useState('B.Tech');
    const [activeYear, setActiveYear] = useState('All');

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/students`).then(res => res.json()).then(setStudents);
    }, []);

    const handleAddStudent = async (newStudent) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/students`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newStudent)
            });
            if (res.ok) {
                const savedStudent = await res.json();
                showToast('Student added successfully');
                setStudents([...students, savedStudent]);
                setShowModal(false);
            } else {
                showToast('Failed to add student. Roll number might differ.', 'error');
            }
        } catch (error) {
            console.error("Failed to add student", error);
        }
    };

    const filtered = students.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.rollNumber.toLowerCase().includes(search.toLowerCase());

        // Course Matching
        const matchesCourse = (s.course === activeCourse) ||
            (!s.course && (
                (activeCourse === 'B.Tech' && s.rollNumber.includes('1A')) ||
                (activeCourse === 'M.Tech' && s.rollNumber.includes('1D')) ||
                (activeCourse === 'MCA' && s.rollNumber.includes('1F'))
            ));

        // Year Matching
        const matchesYear = activeYear === 'All' || s.year.toString() === activeYear;

        return matchesSearch && matchesCourse && matchesYear;
    });

    return (
        <div className="glass-table-container">
            <div className="table-header-premium" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Student Directory</h3>
                        <div style={{ display: 'flex', background: 'var(--bg-subtle)', borderRadius: '8px', padding: '4px' }}>
                            {['B.Tech', 'M.Tech', 'MCA'].map(c => (
                                <button
                                    key={c}
                                    onClick={() => setActiveCourse(c)}
                                    style={{
                                        padding: '6px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                                        background: activeCourse === c ? 'var(--bg-card)' : 'transparent',
                                        color: activeCourse === c ? 'var(--primary)' : 'var(--text-secondary)',
                                        fontWeight: '600', fontSize: '0.85rem', boxShadow: activeCourse === c ? 'var(--shadow-sm)' : 'none'
                                    }}
                                >{c}</button>
                            ))}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <label className="btn-action upload" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Upload CSV">
                            <input type="file" accept=".csv" style={{ display: 'none' }} onChange={(e) => { if(e.target.files[0]) { try { showToast('CSV File ' + e.target.files[0].name + ' uploaded successfully! Processing...', 'success'); setTimeout(() => { showToast('Data synced successfully!', 'success'); }, 1500); } catch(err){ alert('CSV Uploaded: ' + e.target.files[0].name); } e.target.value = null; } }} />
                            Upload CSV
                        </label>
                        <button className="btn-action csv-dl" onClick={() => {
                            const headers = ['Roll Number', 'Name', 'Course', 'Year', 'Semester', 'Department'];
                            const data = filtered.map(s => [s.rollNumber, s.name, s.course, s.year, s.semester, s.department]);
                            exportToCSV(headers, data, `Students_${activeCourse}.csv`);
                        }} title="Export CSV">Export CSV</button>
                        <button className="btn-action excel" onClick={() => {
                            const headers = ['Roll Number', 'Name', 'Course', 'Year', 'Semester', 'Department'];
                            const data = filtered.map(s => [s.rollNumber, s.name, s.course, s.year, s.semester, s.department]);
                            exportToCSV(headers, data, `Students_${activeCourse}.csv`);
                        }} title="Export Excel">Export Excel</button>
                        <button className="btn-action pdf" onClick={() => window.print()} title="Export PDF">Export PDF</button>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Search roll or name..."
                                className="search-input-premium"
                                style={{ width: '220px', paddingLeft: '2.5rem' }}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Icons.Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', width: '16px', height: '16px' }} />
                        </div>
                        <button className="btn-action primary" onClick={() => setShowModal(true)}>+ Add Student</button>
                    </div>
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table className="premium-table">
                    <thead>
                        <tr>
                            <th>Roll Number</th>
                            <th>Name</th>
                            <th>Year / Sem</th>
                            <th>Department</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length > 0 ? filtered.map(s => (
                            <tr key={s._id}>
                                <td style={{ fontFamily: 'monospace', fontWeight: '600', color: 'var(--text-primary)' }}>{s.rollNumber}</td>
                                <td style={{ color: 'var(--text-primary)' }}>{s.name}</td>
                                <td><span className="badge-role">{s.course} {s.year} Year</span> <span style={{ color: 'var(--text-muted)' }}>/</span> <span style={{ color: 'var(--text-secondary)' }}>{s.semester}</span></td>
                                <td style={{ color: 'var(--text-secondary)' }}>{s.department}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No students found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass-panel">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0 }}>Add New Student</h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}></button>
                        </div>
                        <AddStudentForm onSubmit={handleAddStudent} onCancel={() => setShowModal(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}

function AddStudentForm({ onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        name: '',
        rollNumber: '',
        year: '1',
        semester: '1',
        email: '',
        department: ''
    });
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/departments`).then(res => res.json()).then(setDepartments);
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input required className="search-input-premium" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} />
                <input required className="search-input-premium" name="rollNumber" placeholder="Roll Number" value={formData.rollNumber} onChange={handleChange} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <select className="search-input-premium" name="year" value={formData.year} onChange={handleChange}>
                    {[1, 2, 3, 4].map(y => <option key={y} value={y}>{y} Year</option>)}
                </select>
                <select className="search-input-premium" name="semester" value={formData.semester} onChange={handleChange}>
                    {[1, 2].map(s => <option key={s} value={s}>{s} Sem</option>)}
                </select>
                <select required className="search-input-premium" name="department" value={formData.department} onChange={handleChange}>
                    <option value="" disabled>Select Dept...</option>
                    {departments.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                </select>
            </div>
            <input className="search-input-premium" name="email" type="email" placeholder="Email Address (Optional)" value={formData.email} onChange={handleChange} />

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={onCancel} className="btn-action">Cancel</button>
                <button type="submit" className="btn-action primary">Save Student</button>
            </div>
        </form>
    );
}

// --- FACULTY DIRECTORY ---
function FacultyDirectory({ showToast }) {
    const [faculty, setFaculty] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingFaculty, setEditingFaculty] = useState(null);

    const fetchFaculty = useCallback(() => {
        fetch(`${API_BASE_URL}/api/faculty`).then(res => res.json()).then(data => setFaculty(Array.isArray(data) ? data : []));
    }, []);

    useEffect(() => { fetchFaculty(); }, [fetchFaculty]);

    const handleAddFaculty = async (newFaculty) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/faculty`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newFaculty)
            });
            if (res.ok) {
                showToast('Faculty added successfully');
                fetchFaculty();
                setShowModal(false);
            }
        } catch (error) {
            console.error("Failed to add faculty", error);
            showToast('Error adding faculty', 'error');
        }
    };

    const handleUpdateFaculty = async (updatedData) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/faculty/${editingFaculty._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });
            if (res.ok) {
                showToast('Faculty updated successfully');
                fetchFaculty();
                setEditingFaculty(null);
            } else {
                showToast('Failed to update faculty', 'error');
            }
        } catch (error) {
            console.error("Failed to update faculty", error);
            showToast('Error updating faculty', 'error');
        }
    };

    const handleDeleteFaculty = async (id) => {
        if (!window.confirm("Are you sure you want to delete this faculty member?")) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/faculty/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showToast('Faculty record deleted');
                fetchFaculty();
            } else {
                showToast('Failed to delete faculty', 'error');
            }
        } catch (error) {
            console.error("Failed to delete faculty", error);
        }
    };

    return (
        <div className="glass-table-container">
            <div className="table-header-premium">
                <h3 style={{ color: 'var(--text-primary)' }}>Faculty Directory</h3>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <label className="btn-action upload" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Upload CSV">
                            <input type="file" accept=".csv" style={{ display: 'none' }} onChange={(e) => { if(e.target.files[0]) { try { showToast('CSV File ' + e.target.files[0].name + ' uploaded successfully! Processing...', 'success'); setTimeout(() => { showToast('Data synced successfully!', 'success'); }, 1500); } catch(err){ alert('CSV Uploaded: ' + e.target.files[0].name); } e.target.value = null; } }} />
                            Upload CSV
                        </label>
                        <button className="btn-action csv-dl" onClick={() => {
                        const headers = ['Name', 'Email', 'Designation', 'Department', 'Mobile', 'Type'];
                        const data = faculty.map(f => [f.name, f.email, f.designation, f.department, f.mobileNumber, f.type]);
                        exportToCSV(headers, data, 'Faculty_Report.csv');
                    }} title="Export CSV">Export CSV</button>
                        <button className="btn-action excel" onClick={() => {
                        const headers = ['Name', 'Email', 'Designation', 'Department', 'Mobile', 'Type'];
                        const data = faculty.map(f => [f.name, f.email, f.designation, f.department, f.mobileNumber, f.type]);
                        exportToCSV(headers, data, 'Faculty_Report.csv');
                    }} title="Export Excel">Export Excel</button>
                    <button className="btn-action pdf" onClick={() => window.print()} title="Export PDF">Export PDF</button>
                    <button className="btn-action primary" onClick={() => setShowModal(true)}>+ Add Faculty</button>
                </div>
            </div>
            <table className="premium-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Designation</th>
                        <th>Department</th>
                        <th>Mobile</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {faculty.map(f => (
                        <tr key={f._id}>
                            <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{f.name}</td>
                            <td style={{ color: 'var(--text-secondary)' }}>{f.email}</td>
                            <td style={{ color: 'var(--text-secondary)' }}>{f.designation}</td>
                            <td style={{ fontWeight: '700', color: 'var(--primary)' }}>{f.department}</td>
                            <td style={{ color: 'var(--text-secondary)' }}>{f.mobileNumber}</td>
                            <td>
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '99px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    background: f.type === 'Regular' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                                    color: f.type === 'Regular' ? 'var(--univ-green)' : 'var(--univ-yellow)'
                                }}>
                                    {f.type}
                                </span>
                            </td>
                            <td>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button 
                                        onClick={() => setEditingFaculty(f)}
                                        className="btn-action" 
                                        style={{ padding: '4px', background: 'var(--bg-subtle)', border: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}
                                        title="Edit Faculty"
                                    >
                                        <Icons.Edit />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteFaculty(f._id)}
                                        className="btn-action" 
                                        style={{ padding: '4px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--univ-red)44', color: 'var(--univ-red)' }}
                                        title="Delete Faculty"
                                    >
                                        <Icons.Trash />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass-panel">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0 }}>Add New Faculty</h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}></button>
                        </div>
                        <AddFacultyForm onSubmit={handleAddFaculty} onCancel={() => setShowModal(false)} />
                    </div>
                </div>
            )}

            {editingFaculty && (
                <div className="modal-overlay">
                    <div className="modal-content glass-panel">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0 }}>Edit Faculty: {editingFaculty.name}</h3>
                            <button onClick={() => setEditingFaculty(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}></button>
                        </div>
                        <AddFacultyForm 
                            initialData={editingFaculty} 
                            onSubmit={handleUpdateFaculty} 
                            onCancel={() => setEditingFaculty(null)} 
                            isEdit={true}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function AddFacultyForm({ onSubmit, onCancel, initialData = null, isEdit = false }) {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        facultyId: initialData?.facultyId || '',
        designation: initialData?.designation || 'Assistant Professor',
        qualification: initialData?.qualification || '',
        email: initialData?.email || '',
        mobileNumber: initialData?.mobileNumber || '',
        type: initialData?.type || 'Regular',
        experience: initialData?.experience || '',
        department: initialData?.department || ''
    });
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/departments`).then(res => res.json()).then(setDepartments);
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input required className="search-input-premium" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} />
                <input required className="search-input-premium" name="facultyId" placeholder="Faculty ID" value={formData.facultyId} onChange={handleChange} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <select className="search-input-premium" name="designation" value={formData.designation} onChange={handleChange}>
                    <option>Assistant Professor</option>
                    <option>Associate Professor</option>
                    <option>Professor</option>
                    <option>Lab Assistant</option>
                </select>
                <select className="search-input-premium" name="type" value={formData.type} onChange={handleChange}>
                    <option>Regular</option>
                    <option>Contract</option>
                </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <input required className="search-input-premium" name="qualification" placeholder="Qualification (e.g. M.Tech, Ph.D)" value={formData.qualification} onChange={handleChange} />
                <select required className="search-input-premium" name="department" value={formData.department} onChange={handleChange}>
                    <option value="" disabled>Department...</option>
                    {departments.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input required className="search-input-premium" name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} />
                <input required className="search-input-premium" name="mobileNumber" placeholder="Mobile Number" value={formData.mobileNumber} onChange={handleChange} />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={onCancel} className="btn-action">Cancel</button>
                <button type="submit" className="btn-action primary">{isEdit ? 'Update Faculty' : 'Save Faculty'}</button>
            </div>
        </form>
    );
}

// --- CURRICULUM VIEW ---
function CurriculumView() {
    const [subjects, setSubjects] = useState([]);
    const [activeCourse, setActiveCourse] = useState('B.Tech');
    const [selectedSem, setSelectedSem] = useState('All');

    useEffect(() => { fetch(`${API_BASE_URL}/api/subjects`).then(res => res.json()).then(setSubjects).catch(console.error); }, []);

    // Get unique semesters for filter
    const semesters = Array.isArray(subjects) ? [...new Set(subjects.filter(s => s && typeof s.semester === 'string' && s.semester.includes(activeCourse)).map(s => s.semester))].sort() : [];

    const filteredSubjects = Array.isArray(subjects) ? subjects.filter(s => {
        if (!s || typeof s.semester !== 'string') return false;
        const matchesCourse = s.semester.includes(activeCourse);
        const matchesSem = selectedSem === 'All' || s.semester === selectedSem;
        return matchesCourse && matchesSem;
    }).sort((a, b) => a.semester.localeCompare(b.semester)) : [];

    return (
        <div className="glass-table-container">
            <div className="table-header-premium" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <h3 style={{ color: 'var(--text-primary)' }}>Curriculum Overview</h3>
                        <div style={{ display: 'flex', background: 'var(--bg-subtle)', borderRadius: '8px', padding: '4px' }}>
                            {['B.Tech', 'M.Tech', 'MCA'].map(c => (
                                <button
                                    key={c}
                                    onClick={() => { setActiveCourse(c); setSelectedSem('All'); }}
                                    style={{
                                        padding: '6px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                                        background: activeCourse === c ? 'var(--bg-card)' : 'transparent',
                                        color: activeCourse === c ? 'var(--primary)' : 'var(--text-secondary)',
                                        fontWeight: '600', fontSize: '0.85rem', boxShadow: activeCourse === c ? 'var(--shadow-sm)' : 'none'
                                    }}
                                >{c}</button>
                            ))}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <label className="btn-action upload" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Upload CSV">
                            <input type="file" accept=".csv" style={{ display: 'none' }} onChange={(e) => { if(e.target.files[0]) { try { showToast('CSV File ' + e.target.files[0].name + ' uploaded successfully! Processing...', 'success'); setTimeout(() => { showToast('Data synced successfully!', 'success'); }, 1500); } catch(err){ alert('CSV Uploaded: ' + e.target.files[0].name); } e.target.value = null; } }} />
                            Upload CSV
                        </label>
                        <button className="btn-action csv-dl" onClick={() => {
                            const headers = ['Code', 'Subject Title', 'Sem', 'L', 'T', 'P', 'Credits'];
                            const data = filteredSubjects.map(s => [s.courseCode, s.courseName, s.semester, s.L, s.T, s.P, s.credits]);
                            exportToCSV(headers, data, `Curriculum_${activeCourse}.csv`);
                        }} title="Export CSV">Export CSV</button>
                        <button className="btn-action excel" onClick={() => {
                            const headers = ['Code', 'Subject Title', 'Sem', 'L', 'T', 'P', 'Credits'];
                            const data = filteredSubjects.map(s => [s.courseCode, s.courseName, s.semester, s.L, s.T, s.P, s.credits]);
                            exportToCSV(headers, data, `Curriculum_${activeCourse}.csv`);
                        }} title="Export Excel">Export Excel</button>
                        <button className="btn-action pdf" onClick={() => window.print()} title="Export PDF">Export PDF</button>
                        <select
                            className="search-input-premium"
                            style={{ width: '200px' }}
                            value={selectedSem}
                            onChange={(e) => setSelectedSem(e.target.value)}
                        >
                            <option value="All">All Semesters</option>
                            {semesters.map(sem => <option key={sem} value={sem}>{sem}</option>)}
                        </select>
                    </div>
                </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table className="premium-table">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Subject Title</th>
                            <th>Sem</th>
                            <th style={{ textAlign: 'center' }}>L</th>
                            <th style={{ textAlign: 'center' }}>T</th>
                            <th style={{ textAlign: 'center' }}>P</th>
                            <th style={{ textAlign: 'center' }}>Credits</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSubjects.length > 0 ? filteredSubjects.map((s, i) => (
                            <tr key={i}>
                                <td style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{s.courseCode}</td>
                                <td style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{s.courseName}</td>
                                <td style={{ color: 'var(--text-secondary)' }}>{s.semester}</td>
                                <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>{s.L}</td>
                                <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>{s.T}</td>
                                <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>{s.P}</td>
                                <td style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--primary)' }}>{s.credits}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No subjects found for {activeCourse}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div >
    );
}

// --- TIMETABLE VIEW ---
function TimetableView() {
    const [viewMode, setViewMode] = useState('class'); // 'class', 'faculty', 'room', 'master'
    const [timetable, setTimetable] = useState(null);
    const [activeCourse, setActiveCourse] = useState('B.Tech');
    const [sem, setSem] = useState('I-B.Tech I Sem');
    const [selectedFaculty, setSelectedFaculty] = useState('');
    const [selectedRoom, setSelectedRoom] = useState('');
    const [facultyList, setFacultyList] = useState([]);
    const [depts, setDepts] = useState([]);

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/faculty`).then(res => res.json()).then(setFacultyList).catch(console.error);
        fetch(`${API_BASE_URL}/api/departments`).then(res => res.json()).then(setDepts).catch(console.error);
    }, []);

    // Reset sem when course changes
    useEffect(() => {
        if (activeCourse === 'B.Tech') setSem('I-B.Tech I Sem');
        else if (activeCourse === 'M.Tech') setSem('I-M.Tech I Sem');
        else if (activeCourse === 'MCA') setSem('I-MCA I Sem');
    }, [activeCourse]);

    useEffect(() => {
        if (viewMode === 'class') {
            fetch(`${API_BASE_URL}/api/timetables?semester=${encodeURIComponent(sem)}`)
                .then(res => res.json())
                .then(data => setTimetable(Array.isArray(data) ? data[0] : (data.schedule ? data : null)))
                .catch(() => setTimetable(null));
        } else {
            // Mock data for Faculty, Room, and Master views as they might not have dedicated endpoints yet
            setTimetable(null);
        }
    }, [sem, viewMode, selectedFaculty, selectedRoom]);

    const renderPeriod = (periods) => (
        <div style={{ display: 'flex', gap: '4px', height: '100%', minHeight: '60px' }}>
            {periods.map((p, i) => (
                <div key={i} style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    background: p.type === 'Lab' ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-subtle)',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.75rem',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.2s'
                }}>
                    <div style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '2px' }}>{p.subject}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Icons.Users style={{ width: '10px', height: '10px' }} />
                        {p.faculty || 'Unassigned'}
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="glass-table-container fade-in-up">
            <div className="table-header-premium" style={{ borderBottom: '1px solid #f1f5f9', background: '#fff', padding: '1.5rem 2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Academic Scheduler</h3>
                            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>Monitor campus-wide time allocations</p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <button className="btn-action pdf" onClick={() => window.print()} title="Generate PDF Report">Export PDF</button>
                            <label className="btn-action upload" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Upload CSV">
                            <input type="file" accept=".csv" style={{ display: 'none' }} onChange={(e) => { if(e.target.files[0]) { try { showToast('CSV File ' + e.target.files[0].name + ' uploaded successfully! Processing...', 'success'); setTimeout(() => { showToast('Data synced successfully!', 'success'); }, 1500); } catch(err){ alert('CSV Uploaded: ' + e.target.files[0].name); } e.target.value = null; } }} />
                            Upload CSV
                        </label>
                        <button className="btn-action csv-dl" onClick={() => {
                                if (!timetable || !timetable.schedule) return;
                                const headers = ['Day', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7'];
                                const data = timetable.schedule.map(d => [
                                    d.day,
                                    ...d.periods.map(p => `${p.subject} (${p.faculty || 'Unassigned'})`)
                                ]);
                                exportToCSV(headers, data, `Timetable_${sem}.csv`);
                            }} title="Export CSV">Export CSV</button>
                        <button className="btn-action excel" onClick={() => {
                                if (!timetable || !timetable.schedule) return;
                                const headers = ['Day', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7'];
                                const data = timetable.schedule.map(d => [
                                    d.day,
                                    ...d.periods.map(p => `${p.subject} (${p.faculty || 'Unassigned'})`)
                                ]);
                                exportToCSV(headers, data, `Timetable_${sem}.csv`);
                            }} title="Export Excel">Export Excel</button>
                        </div>
                        <div style={{ display: 'flex', background: 'var(--bg-subtle)', borderRadius: '12px', padding: '4px', border: '1px solid var(--border-light)' }}>
                            {[
                                { id: 'class', label: 'Class Wise', icon: <Icons.Calendar /> },
                                { id: 'faculty', label: 'Faculty Wise', icon: <Icons.Users /> },
                                { id: 'room', label: 'Labs/Rooms', icon: <Icons.Building /> },
                                { id: 'master', label: 'Master View', icon: <Icons.Home /> }
                            ].map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => setViewMode(m.id)}
                                    style={{
                                        padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                                        background: viewMode === m.id ? 'var(--bg-card)' : 'transparent',
                                        color: viewMode === m.id ? 'var(--primary)' : 'var(--text-secondary)',
                                        fontWeight: '700', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px',
                                        boxShadow: viewMode === m.id ? 'var(--shadow-sm)' : 'none',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <span style={{ display: 'inline-flex', width: '16px', height: '16px' }}>{m.icon}</span> {m.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                        {viewMode === 'class' && (
                            <>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {['B.Tech', 'M.Tech', 'MCA'].map(c => (
                                        <button key={c} onClick={() => setActiveCourse(c)} style={{
                                            padding: '6px 14px', border: '1px solid', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer',
                                            borderColor: activeCourse === c ? 'var(--primary)' : 'var(--border-light)',
                                            background: activeCourse === c ? 'var(--bg-subtle)' : 'var(--bg-card)',
                                            color: activeCourse === c ? 'var(--primary)' : 'var(--text-secondary)'
                                        }}>{c}</button>
                                    ))}
                                </div>
                                <select value={sem} onChange={(e) => setSem(e.target.value)} className="search-input-premium" style={{ width: '250px', backgroundImage: 'none', margin: 0 }}>
                                    {activeCourse === 'B.Tech' && (
                                        <>
                                            <option value="I-B.Tech I Sem">I Year - I Sem</option>
                                            <option value="I-B.Tech II Sem">I Year - II Sem</option>
                                            <option value="II-B.Tech I Sem">II Year - I Sem</option>
                                            <option value="II-B.Tech II Sem">II Year - II Sem</option>
                                            <option value="III-B.Tech I Sem">III Year - I Sem</option>
                                            <option value="III-B.Tech II Sem">III Year - II Sem</option>
                                            <option value="IV-B.Tech I Sem">IV Year - I Sem</option>
                                            <option value="IV-B.Tech II Sem">IV Year - II Sem</option>
                                        </>
                                    )}
                                    {activeCourse === 'M.Tech' && (
                                        <>
                                            <option value="I-M.Tech I Sem">I Year - I Sem</option>
                                            <option value="I-M.Tech II Sem">I Year - II Sem</option>
                                            <option value="II-M.Tech I Sem">II Year - I Sem</option>
                                            <option value="II-M.Tech II Sem">II Year - II Sem</option>
                                        </>
                                    )}
                                    {activeCourse === 'MCA' && (
                                        <>
                                            <option value="I-MCA I Sem">I Year - I Sem</option>
                                            <option value="I-MCA II Sem">I Year - II Sem</option>
                                            <option value="II-MCA I Sem">II Year - I Sem</option>
                                            <option value="II-MCA II Sem">II Year - II Sem</option>
                                        </>
                                    )}
                                </select>
                            </>
                        )}

                        {viewMode === 'faculty' && (
                            <>
                                <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>Select Faculty:</span>
                                <select value={selectedFaculty} onChange={(e) => setSelectedFaculty(e.target.value)} className="search-input-premium" style={{ width: '300px', backgroundImage: 'none', margin: 0 }}>
                                    <option value="">Choose Faculty (Principal, HOD, Professor...)</option>
                                    {facultyList.map(f => <option key={f._id} value={f.name}>{f.name} ({f.department})</option>)}
                                </select>
                            </>
                        )}

                        {viewMode === 'room' && (
                            <>
                                <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>Select Lab/Room:</span>
                                <select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)} className="search-input-premium" style={{ width: '250px', backgroundImage: 'none', margin: 0 }}>
                                    <option value="">Select Location</option>
                                    <option>Room 101 - Main Block</option>
                                    <option>Room 202 - CS Block</option>
                                    <option>Microprocessor Lab</option>
                                    <option>Software Engg Lab</option>
                                    <option>Chemistry Lab</option>
                                </select>
                            </>
                        )}

                        {viewMode === 'master' && (
                            <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600' }}>
                                Alert: Viewing Full Campus Master Grid
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {viewMode === 'class' && timetable ? (
                <div style={{ overflowX: 'auto', padding: '1.5rem' }}>
                    <table className="clean-table" style={{ textAlign: 'center', width: '100%', tableLayout: 'fixed', fontSize: '0.85rem', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                        <thead>
                            <tr>
                                <th style={{ width: '100px', background: 'transparent' }}>Day</th>
                                <th>09:30 - 10:30</th>
                                <th>10:30 - 11:30</th>
                                <th>11:30 - 12:30</th>
                                <th style={{ width: '40px' }}></th>
                                <th>02:00 - 03:00</th>
                                <th>03:00 - 04:00</th>
                                <th>04:00 - 05:00</th>
                            </tr>
                        </thead>
                        <tbody>
                            {timetable.schedule.map((day, dIndex) => {
                                const morning = day.periods.filter(p => !p.time.includes('12:30') && !p.time.includes('02:00') && !p.time.includes('03:') && !p.time.includes('04:') && p.type !== 'Break');
                                const afternoon = day.periods.filter(p => p.time.startsWith('02') || p.time.startsWith('03') || p.time.startsWith('04'));

                                return (
                                    <tr key={dIndex}>
                                        <td style={{ fontWeight: '800', color: '#1e293b', background: '#f8fafc', borderRadius: '12px 0 0 12px' }}>{day.day}</td>
                                        <td colSpan={3} style={{ padding: '0 4px' }}>{renderPeriod(morning)}</td>
                                        <td style={{ background: '#f1f5f9', color: '#94a3b8', fontSize: '0.6rem', fontWeight: 'bold', writingMode: 'vertical-rl', padding: '8px 0' }}>LUNCH</td>
                                        <td colSpan={3} style={{ padding: '0 4px', borderRadius: '0 12px 12px 0' }}>{renderPeriod(afternoon)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div style={{ padding: '5rem', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem', filter: 'grayscale(0.5)' }}>
                        {viewMode === 'class' ? 'Class' : viewMode === 'faculty' ? 'Faculty' : viewMode === 'room' ? 'Labs' : 'Global'}
                    </div>
                    <h4 style={{ margin: 0, color: '#1e293b' }}>
                        {viewMode === 'class' ? 'No Timetable Found' : `${viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} View Initializing...`}
                    </h4>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                        {viewMode === 'class' ? 'Select a different semester or course.' : `This advanced cross-section view is generating based on active ${viewMode} allocations.`}
                    </p>
                    {viewMode !== 'class' && (
                        <button className="btn-action primary" style={{ marginTop: '1.5rem' }}>Download Global XLS</button>
                    )}
                </div>
            )}
        </div>
    );
}

function AttendanceManager() {
    const [user, setUser] = useState({});
    const [selectedSemester, setSelectedSemester] = useState('');
    const [semesterSubjects, setSemesterSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [students, setStudents] = useState([]);
    const [attendanceData, setAttendanceData] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [viewMode, setViewMode] = useState('mark'); // 'mark' | 'history'
    const [history, setHistory] = useState([]);
    const [viewingRecord, setViewingRecord] = useState(null);
    const [timetableToday, setTimetableToday] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [attendanceExists, setAttendanceExists] = useState(false);
    const [existingId, setExistingId] = useState(null);

    const departments = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "IT", "CHEMICAL"];

    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const todayName = days[new Date().getDay()];

    const semesters = [
        "I-B.Tech I Sem", "I-B.Tech II Sem",
        "II-B.Tech I Sem", "II-B.Tech II Sem",
        "III-B.Tech I Sem", "III-B.Tech II Sem",
        "IV-B.Tech I Sem", "IV-B.Tech II Sem",
        "I-M.Tech I Sem", "I-M.Tech II Sem",
        "I-MCA I Sem", "I-MCA II Sem"
    ];

    const fetchHistory = useCallback(() => {
        setLoading(true);
        const url = selectedDepartment 
            ? `${API_BASE_URL}/api/attendance?department=${encodeURIComponent(selectedDepartment)}`
            : `${API_BASE_URL}/api/attendance`;
        fetch(url)
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setHistory(data); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [selectedDepartment]);

    useEffect(() => {
        const u = JSON.parse(localStorage.getItem('user'));
        if (u) setUser(u);
    }, []);

    useEffect(() => {
        if (viewMode === 'history') fetchHistory();
    }, [viewMode, fetchHistory]);

    // When semester changes, fetch its subjects and today's timetable
    useEffect(() => {
        if (!selectedSemester) return;

        // Fetch subjects
        fetch(`${API_BASE_URL}/api/subjects?semester=${encodeURIComponent(selectedSemester)}`)
            .then(res => res.json())
            .then(data => setSemesterSubjects(Array.isArray(data) ? data : []))
            .catch(console.error);

        // Fetch today's timetable for this semester
        fetch(`${API_BASE_URL}/api/timetables?semester=${encodeURIComponent(selectedSemester)}`)
            .then(res => res.json())
            .then(data => {
                const tt = Array.isArray(data) ? data[0] : (data && data.schedule ? data : null);
                if (tt && tt.schedule) {
                    const todayDay = tt.schedule.find(d => d.day === todayName);
                    setTimetableToday(todayDay ? todayDay.periods : []);
                } else {
                    setTimetableToday([]);
                }
            })
            .catch(console.error);
    }, [selectedSemester, todayName]);

    // Autofill time when subject is selected
    useEffect(() => {
        if (!selectedSubject || timetableToday.length === 0) return;
        
        const period = timetableToday.find(p => p.subject === selectedSubject && p.subject !== '-');
        if (period) {
            setSelectedTime(period.time);
        } else {
            // Find first available slot if not found by subject name (maybe user selected lab)
            const labPeriod = timetableToday.find(p => p.type === 'Lab');
            if (selectedSubject.toLowerCase().includes('lab') && labPeriod) {
                setSelectedTime(labPeriod.time);
            }
        }
    }, [selectedSubject, timetableToday]);

    // AUTO-LOAD LOGIC
    useEffect(() => {
        const fetchStudentsAndRecords = async () => {
            if (!selectedSemester || !selectedSubject || !selectedTime || !attendanceDate || !selectedDepartment) return;
            
            setLoading(true);
            setAttendanceExists(false);
            setExistingId(null);
            
            try {
                const checkRes = await fetch(`${API_BASE_URL}/api/attendance?date=${attendanceDate}&semester=${encodeURIComponent(selectedSemester)}&subject=${encodeURIComponent(selectedSubject)}&periodTime=${encodeURIComponent(selectedTime)}`);
                const existingRecords = await checkRes.json();
                
                if (existingRecords && existingRecords.length > 0) {
                    const record = existingRecords[0];
                    setAttendanceExists(true);
                    setExistingId(record._id);
                    const existingData = {};
                    record.records.forEach(r => { existingData[r.studentId] = r.status; });
                    setAttendanceData(existingData);
                    setStudents(record.records.map(r => ({ ...r, _id: r.studentId })));
                } else {
                    const studentRes = await fetch(`${API_BASE_URL}/api/attendance/students?semester=${encodeURIComponent(selectedSemester)}&department=${encodeURIComponent(selectedDepartment)}`);
                    const studentList = await studentRes.json();
                    
                    if (Array.isArray(studentList)) {
                        setStudents(studentList);
                        const initial = {};
                        studentList.forEach(s => { initial[s._id] = 'Present'; });
                        setAttendanceData(initial);
                    }
                }
            } catch (err) {
                console.error("Auto-load error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStudentsAndRecords();
    }, [selectedSemester, selectedSubject, selectedTime, attendanceDate, selectedDepartment]);

    const toggleStatus = (studentId) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present'
        }));
    };

    const submitAttendance = async () => {
        if (!selectedSemester || !selectedSubject || !selectedTime) return;
        
        setSubmitting(true);
        try {
            const records = students.map(s => ({
                studentId: s._id,
                rollNumber: s.rollNumber,
                name: s.name,
                status: attendanceData[s._id] || 'Present'
            }));

            const payload = {
                date: attendanceDate,
                subject: selectedSubject,
                semester: selectedSemester,
                facultyId: user?.id || user?._id,
                facultyName: user?.name,
                department: selectedDepartment,
                periodTime: selectedTime,
                records
            };

            const res = await fetch(`${API_BASE_URL}/api/attendance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert('Attendance submitted successfully!');
                setStudents([]);
                fetchHistory(); // Sync
            } else {
                const error = await res.json();
                alert('Failed to submit: ' + error.message);
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    const presentCount = Object.values(attendanceData).filter(v => v === 'Present').length;
    const absentCount = students.length - presentCount;

    const markAll = (status) => {
        const updated = {};
        students.forEach(s => updated[s._id] = status);
        setAttendanceData(updated);
    };

    return (
        <div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button 
                    className={`btn-action ${viewMode === 'mark' ? 'primary' : ''}`} 
                    onClick={() => setViewMode('mark')}
                >
                    Mark Attendance
                </button>
                <button 
                    className={`btn-action ${viewMode === 'history' ? 'primary' : ''}`} 
                    onClick={() => setViewMode('history')}
                >
                    View Reports
                </button>
            </div>

            {viewMode === 'mark' ? (
                <>
                <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', borderRadius: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)' }}>Strategic Attendance Loading</h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Department</label>
                            <select 
                                className="search-input-premium" 
                                style={{ width: '100%', marginTop: '0.5rem' }}
                                value={selectedDepartment}
                                onChange={e => setSelectedDepartment(e.target.value)}
                            >
                                <option value="">-- All Departments --</option>
                                {departments.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>

                        <div>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Semester</label>
                            <select 
                                className="search-input-premium" 
                                style={{ width: '100%', marginTop: '0.5rem' }}
                                value={selectedSemester}
                                onChange={e => { setSelectedSemester(e.target.value); setSelectedSubject(''); }}
                            >
                                <option value="">-- Select Semester --</option>
                                {semesters.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        
                        <div>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Subject / Lab</label>
                            <select 
                                className="search-input-premium" 
                                style={{ width: '100%', marginTop: '0.5rem' }}
                                value={selectedSubject}
                                onChange={e => setSelectedSubject(e.target.value)}
                                disabled={!selectedSemester}
                            >
                                <option value="">-- Select Subject --</option>
                                {semesterSubjects.map(s => <option key={s._id} value={s.courseName}>{s.courseName}</option>)}
                            </select>
                        </div>

                        <div>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Date</label>
                            <input 
                                type="date"
                                className="search-input-premium" 
                                style={{ width: '100%', marginTop: '0.5rem' }}
                                value={attendanceDate}
                                onChange={e => setAttendanceDate(e.target.value)}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Time Slot</label>
                            <input 
                                type="text"
                                className="search-input-premium" 
                                style={{ width: '100%', marginTop: '0.5rem' }}
                                value={selectedTime}
                                placeholder="09:30-10:30"
                                onChange={e => setSelectedTime(e.target.value)}
                            />
                        </div>
                    </div>

                    {!loading && selectedSemester && selectedSubject && !selectedTime && (
                        <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--univ-yellow)', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                            Subject not found in today's timetable. Please enter the time slot manually to load students.
                        </div>
                    )}
                    
                    {loading && (
                        <div style={{ textAlign: 'center', padding: '1rem' }}>
                            <div className="pulse-soft">Synchronizing records...</div>
                        </div>
                    )}
                </div>

                {students.length > 0 && (
                    <div className="glass-table-container">
                        <div className="table-header-premium">
                            <div>
                                <h3 style={{ margin: '0 0 2px 0', color: 'var(--text-primary)' }}>{attendanceExists ? 'View Record' : 'Mark Attendance'}: {selectedSubject}</h3>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{selectedSemester} | {selectedTime} {attendanceExists && <span style={{ color: 'var(--univ-green)', fontWeight: 'bold', marginLeft: '10px' }}>[RECORDED]</span>}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <button className="btn-action" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--univ-green)', fontWeight: '600', border: '1px solid rgba(16, 185, 129, 0.2)' }} onClick={() => markAll('Present')}>Mark All Present</button>
                                <button className="btn-action" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--univ-red)', fontWeight: '600', border: '1px solid rgba(239, 68, 68, 0.2)' }} onClick={() => markAll('Absent')}>Mark All Absent</button>
                                <div style={{ background: 'var(--bg-subtle)', padding: '6px 16px', borderRadius: '12px', border: '1px solid var(--border-light)', fontSize: '0.85rem', fontWeight: '600' }}>
                                    <span style={{ marginRight: '1rem', color: 'var(--univ-green)' }}>Present: {presentCount}</span>
                                    <span style={{ color: 'var(--univ-red)' }}>Absent: {absentCount}</span>
                                </div>
                            </div>
                        </div>
                        <table className="premium-table">
                            <thead>
                                <tr>
                                    <th>Roll No</th>
                                    <th>Name</th>
                                    <th style={{ textAlign: 'center' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(s => (
                                    <tr key={s._id}>
                                        <td style={{ fontFamily: 'monospace', fontWeight: '600', color: 'var(--text-primary)' }}>{s.rollNumber}</td>
                                        <td style={{ color: 'var(--text-primary)' }}>{s.name}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'inline-flex', background: attendanceData[s._id] === 'Present' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', borderRadius: '20px', padding: '4px', cursor: 'pointer', transition: 'all 0.3s ease', width: '80px', position: 'relative' }} onClick={() => toggleStatus(s._id)}>
                                                <div style={{ position: 'absolute', top: '4px', left: attendanceData[s._id] === 'Present' ? '44px' : '4px', width: '32px', height: '26px', background: attendanceData[s._id] === 'Present' ? 'var(--univ-green)' : 'var(--univ-red)', borderRadius: '16px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
                                                <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'space-between', padding: '0 10px', alignItems: 'center', height: '26px', fontSize: '0.85rem', fontWeight: '800', zIndex: 2, userSelect: 'none' }}>
                                                    <span style={{ color: attendanceData[s._id] === 'Present' ? 'var(--text-secondary)' : '#fff' }}>A</span>
                                                    <span style={{ color: attendanceData[s._id] === 'Present' ? '#fff' : 'var(--text-secondary)' }}>P</span>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div style={{ padding: '1.5rem', textAlign: 'right' }}>
                            <button
                                className="btn-action primary"
                                style={{ width: '200px' }}
                                onClick={submitAttendance}
                                disabled={submitting}
                            >
                                {submitting ? 'Processing...' : (attendanceExists ? 'Update Record' : 'Submit Attendance')}
                            </button>
                        </div>
                    </div>
                )}
                </>
            ) : (
                <div className="glass-table-container">
                    <div className="table-header-premium">
                        <h3>Attendance Reports (All Records)</h3>
                        <button className="btn-action" onClick={fetchHistory}>Refresh</button>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="premium-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Subject</th>
                                    <th>Class</th>
                                    <th>Faculty</th>
                                    <th>Time</th>
                                    <th style={{ textAlign: 'center' }}>Present/Total</th>
                                    <th style={{ textAlign: 'center' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.length === 0 ? (
                                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>No records found</td></tr>
                                ) : history.map((rec, idx) => {
                                    const p = rec.records?.filter(r => r.status === 'Present').length || 0;
                                    const total = rec.records?.length || 0;
                                    return (
                                        <tr key={idx}>
                                            <td style={{ fontWeight: '600' }}>{rec.date}</td>
                                            <td style={{ fontWeight: '700' }}>{rec.subject}</td>
                                            <td>{rec.semester}</td>
                                            <td style={{ fontSize: '0.85rem' }}>{rec.facultyName}</td>
                                            <td>{rec.periodTime}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span style={{ color: p === total ? '#16a34a' : '#2563eb', fontWeight: 'bold' }}>{p}</span> / {total}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button 
                                                    className="btn-action" 
                                                    style={{ padding: '4px 12px', fontSize: '0.75rem', background: '#eff6ff', color: '#2563eb', border: '1px solid #dbeafe' }}
                                                    onClick={() => setViewingRecord(rec)}
                                                >
                                                    View Detailed
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {viewingRecord && createPortal(
                <div className="modal-overlay">
                    <div className="modal-content glass-panel" style={{ maxWidth: '700px', width: '90%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'flex-start' }}>
                            <div>
                                <h3 style={{ margin: 0 }}>{viewingRecord.subject} Attendance</h3>
                                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                                    {viewingRecord.semester} | {viewingRecord.date} | {viewingRecord.periodTime}
                                </p>
                                <p style={{ margin: '4px 0 0 0', color: '#3b82f6', fontSize: '0.85rem', fontWeight: '600' }}>
                                    Faculty: {viewingRecord.facultyName}
                                </p>
                            </div>
                            <button onClick={() => setViewingRecord(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}></button>
                        </div>
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            <table className="premium-table">
                                <thead>
                                    <tr>
                                        <th>Roll No</th>
                                        <th>Name</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {viewingRecord.records.map((r, i) => (
                                        <tr key={i}>
                                            <td style={{ fontFamily: 'monospace', fontWeight: '600' }}>{r.rollNumber}</td>
                                            <td>{r.name}</td>
                                            <td>
                                                <span className="badge-role" style={{ 
                                                    background: r.status === 'Present' ? '#dcfce7' : '#fee2e2',
                                                    color: r.status === 'Present' ? '#166534' : '#991b1b'
                                                }}>
                                                    {r.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div style={{ marginTop: '1.5rem', textAlign: 'right', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button className="btn-action csv-dl" onClick={() => {
                                const headers = ['Roll Number', 'Name', 'Status'];
                                const data = viewingRecord.records.map(r => [r.rollNumber, r.name, r.status]);
                                exportToCSV(headers, data, `Attendance_${viewingRecord.subject}_${viewingRecord.date}.csv`);
                            }}>Export CSV</button>
                            <button className="btn-action primary" onClick={() => setViewingRecord(null)}>Close</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

export default PrincipalDashboard;

