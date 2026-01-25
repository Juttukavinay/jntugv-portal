import { useState, useEffect } from 'react'
import API_BASE_URL from '../../config'
import { useNavigate } from 'react-router-dom'
import '../../App.css'
import GlobalLoader from '../../components/GlobalLoader'

// --- ICONS ---
const Icons = {
    Home: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    Calendar: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
    Book: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>,
    Award: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>,
    LogOut: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
    Clock: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
}

function StudentDashboard() {
    const navigate = useNavigate()
    const [currentUser, setCurrentUser] = useState(null)
    const [myTimetable, setMyTimetable] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('overview')
    const [currentClass, setCurrentClass] = useState(null)
    const [currentTime, setCurrentTime] = useState(new Date())
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user')) || { name: 'Student', role: 'student', email: '21131A0501', semester: 'III-B.Tech I Sem' }
        setCurrentUser(user)
        fetchMySchedule(user.semester || 'III-B.Tech I Sem')

        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, [])

    useEffect(() => {
        if (myTimetable.length > 0) determineCurrentClass();
    }, [myTimetable, currentTime])

    const determineCurrentClass = () => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = days[currentTime.getDay()];
        const daySchedule = myTimetable.find(d => d.day === today);

        if (daySchedule) {
            const currentHour = currentTime.getHours();
            // Mock logic for demo purposes as before
            if (currentHour >= 9 && currentHour <= 16) {
                setCurrentClass(daySchedule.periods[Math.floor(Math.random() * daySchedule.periods.length)] || null)
            } else {
                setCurrentClass(null)
            }
        }
    }

    const fetchMySchedule = (semester) => {
        setLoading(true)
        fetch(`${API_BASE_URL}/api/timetables?semester=${encodeURIComponent(semester)}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    setMyTimetable(data[0].schedule || [])
                } else if (data && data.schedule) {
                    setMyTimetable(data.schedule)
                } else {
                    setMyTimetable([])
                }
                setLoading(false)
            })
            .catch(err => { console.error(err); setLoading(false) })
    }

    const logout = () => {
        localStorage.removeItem('user')
        navigate('/login', { replace: true })
    }



    // --- SUB-COMPONENTS ---
    const OverviewTab = () => (
        <div className="fade-in-up">
            {loading && <GlobalLoader />}
            <div className="modern-stats-grid" style={{ marginBottom: '2rem' }}>
                <div className="premium-stat-card" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ opacity: 0.8, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Average Attendance</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800' }}>85%</div>
                            <div style={{ fontSize: '0.8rem', color: '#4ade80' }}>On Track</div>
                        </div>
                        <div style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '50%', background: 'conic-gradient(#3b82f6 85%, rgba(255,255,255,0.1) 0)' }}>
                            <div style={{ position: 'absolute', inset: '6px', background: '#0f172a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icons.Award />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="premium-stat-card">
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div className="stat-icon-wrapper" style={{ background: '#eff6ff', color: '#3b82f6' }}><Icons.Clock /></div>
                        <div>
                            <h5 style={{ margin: 0, color: '#64748b' }}>Current Session</h5>
                            {currentClass ? (
                                <div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0f172a' }}>{currentClass.subject}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{currentClass.room || 'Room 304'}</div>
                                </div>
                            ) : (
                                <div style={{ fontSize: '1rem', fontWeight: '600', color: '#94a3b8' }}>No active class</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="premium-stat-card">
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div className="stat-icon-wrapper" style={{ background: '#f0fdf4', color: '#16a34a' }}><Icons.Award /></div>
                        <div>
                            <h5 style={{ margin: 0, color: '#64748b' }}>Overall CGPA</h5>
                            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a' }}>8.4</div>
                            <span style={{ fontSize: '0.75rem', color: '#16a34a' }}>+0.2 from last sem</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-table-container">
                <div className="table-header-premium">
                    <h3>My Subjects (Current Sem)</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', padding: '1rem' }}>
                    {['Data Structures', 'Cloud Computing', 'Machine Learning', 'English'].map((s, i) => (
                        <div key={i} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: ['#eff6ff', '#f0fdf4', '#fff7ed', '#f3e8ff'][i], color: ['#3b82f6', '#16a34a', '#ea580c', '#9333ea'][i], display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                {s.charAt(0)}
                            </div>
                            <div>
                                <div style={{ fontWeight: '600', color: '#1e293b' }}>{s}</div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>3 Credits</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )

    const TimetableTab = () => (
        <div className="glass-table-container fade-in-up">
            <div className="table-header-premium">
                <h3>Weekly Class Schedule</h3>
                <span className="badge-role" style={{ background: '#eff6ff', color: '#3b82f6' }}>{currentUser?.semester}</span>
            </div>
            {loading ? <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div> : (
                <div style={{ overflowX: 'auto' }}>
                    <table className="premium-table" style={{ width: '100%', minWidth: '800px' }}>
                        <thead>
                            <tr>
                                <th style={{ width: '100px' }}>Day</th>
                                {['09:00', '10:00', '11:00', '12:00', '02:00', '03:00', '04:00'].map(t => <th key={t}>{t}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {myTimetable.map((day, i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: '700', color: '#0f172a' }}>{day.day}</td>
                                    {day.periods.map((p, j) => (
                                        <td key={j}>
                                            <div style={{
                                                background: p.type === 'Lab' ? '#eff6ff' : '#fff',
                                                padding: '8px',
                                                borderRadius: '6px',
                                                border: p.type === 'Lab' ? '1px solid #bfdbfe' : '1px solid #f1f5f9',
                                                fontSize: '0.85rem'
                                            }}>
                                                <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '2px' }}>{p.subject}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.room || 'Room 101'}</div>
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )

    const ResultsTab = () => (
        <div className="glass-table-container fade-in-up">
            <div className="table-header-premium">
                <h3>Exam Results</h3>
            </div>
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📊</div>
                <p>No results have been published for the current semester yet.</p>
                <button className="btn-action primary" style={{ marginTop: '1rem' }}>View History</button>
            </div>
        </div>
    )

    const LibraryTab = () => (
        <div className="glass-table-container fade-in-up">
            <div className="table-header-premium">
                <h3>Library Books</h3>
                <button className="btn-action">+ Request Book</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table className="premium-table">
                    <thead><tr><th>Book Title</th><th>Author</th><th>Due Date</th><th>Status</th></tr></thead>
                    <tbody>
                        <tr>
                            <td style={{ fontWeight: '600' }}>Into to Algorithms</td>
                            <td>Cormen</td>
                            <td>25 Jan 2026</td>
                            <td><span className="badge-role" style={{ background: '#fef3c7', color: '#d97706' }}>Due Soon</span></td>
                        </tr>
                        <tr>
                            <td>Clean Code</td>
                            <td>Uncle Bob</td>
                            <td>02 Feb 2026</td>
                            <td><span className="badge-role" style={{ background: '#dcfce7', color: '#16a34a' }}>Borrowed</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )

    const renderContent = () => {
        switch (activeTab) {
            case 'timetable': return <TimetableTab />;
            case 'results': return <ResultsTab />;
            case 'library': return <LibraryTab />;
            default: return <OverviewTab />;
        }
    }

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <aside className={`glass-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <img src="/jntugv-logo.png" alt="Logo" className="sidebar-logo" />
                    <div>
                        <div className="sidebar-title">JNTU-GV</div>
                        <div className="sidebar-role">Student Portal</div>
                    </div>
                </div>

                <nav className="nav-menu">
                    <NavItem icon={<Icons.Home />} label="Overview" active={activeTab === 'overview'} onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); }} />
                    <NavItem icon={<Icons.Calendar />} label="My Timetable" active={activeTab === 'timetable'} onClick={() => { setActiveTab('timetable'); setMobileMenuOpen(false); }} />
                    <NavItem icon={<Icons.Award />} label="Exam Results" active={activeTab === 'results'} onClick={() => { setActiveTab('results'); setMobileMenuOpen(false); }} />
                    <NavItem icon={<Icons.Book />} label="Library Books" active={activeTab === 'library'} onClick={() => { setActiveTab('library'); setMobileMenuOpen(false); }} />
                </nav>

                <div className="sidebar-footer">
                    <div className="user-snippet">
                        <div className="user-avatar" style={{ background: '#3b82f6' }}>{currentUser?.name?.charAt(0) || 'S'}</div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser?.name || 'Student'}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{currentUser?.email}</div>
                        </div>
                        <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} title="Logout">
                            <Icons.LogOut />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {mobileMenuOpen && <div className="sidebar-overlay open" onClick={() => setMobileMenuOpen(false)} />}

            {/* Main Content */}
            <main className="dashboard-main-area">
                <header className="mobile-header">
                    <button onClick={() => setMobileMenuOpen(true)} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                    </button>
                    <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>Student Dashboard</span>
                </header>

                <div className="fade-in-up">
                    <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1 className="title-gradient" style={{ fontSize: '1.8rem', margin: '0 0 0.5rem 0' }}>
                                {activeTab === 'overview' ? 'Hello, Student 👋' :
                                    activeTab === 'timetable' ? 'Your Schedule' :
                                        activeTab === 'results' ? 'Your Results' : 'Library'}
                            </h1>
                            <p style={{ color: '#64748b', margin: 0 }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                        </div>
                        <div style={{ background: 'white', padding: '10px', borderRadius: '50%', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>🔔</div>
                    </div>
                    {renderContent()}
                </div>
            </main>
        </div>
    )
}

function NavItem({ icon, label, active, onClick }) {
    return (
        <div className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>
            {icon}
            <span>{label}</span>
        </div>
    );
}

export default StudentDashboard
