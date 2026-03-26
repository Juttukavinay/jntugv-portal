import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import API_BASE_URL from '../../config'
import '../../App.css'
import CommunicationCenter from '../../components/CommunicationCenter'
import GlobalLoader from '../../components/GlobalLoader'
import { exportToCSV } from '../../utils/exportUtils'

// --- ICONS (Inline SVG for Premium Look) ---
const Icons = {
    Home: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    GradCap: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>,
    Building: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M8 10h.01" /><path d="M16 10h.01" /><path d="M8 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M16 18h.01" /></svg>,
    Book: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>,
    Calendar: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
    LogOut: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0" /><line x1="12" y1="2" x2="12" y2="12" /></svg>,
    Users: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    Mail: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>,
    Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
    Edit: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
    Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
}

// --- MAIN HOD DASHBOARD ---
function HodDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [user, setUser] = useState({});
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [error, setError] = useState(null);
    const [existingClasses, setExistingClasses] = useState([]);
    const [upcomingClasses, setUpcomingClasses] = useState([]);
    const [allRooms, setAllRooms] = useState([]);
    const [quickAttendance, setQuickAttendance] = useState(null);

    const showToast = useCallback((message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
    }, []);

    useEffect(() => {
        const u = JSON.parse(localStorage.getItem('user'));
        if (u) setUser(u);
        setMobileMenuOpen(false); // Close menu on tab change
    }, [activeTab]);

    const fetchClasses = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/classes?hod=${encodeURIComponent(user.name || '')}`);
            if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                const now = new Date();
                setExistingClasses(data.filter(cls => new Date(cls.endTime) < now));
                setUpcomingClasses(data.filter(cls => new Date(cls.startTime) > now));
            } else {
                throw new Error('Unexpected API response format');
            }
        } catch (err) {
            console.error('Failed to fetch classes:', err);
            setError(err.message);
        }
    };

    const fetchAllRooms = useCallback(async () => {
        const deptParam = user.department ? `?department=${encodeURIComponent(user.department)}` : '';
        try {
            const res = await fetch(`${API_BASE_URL}/api/rooms${deptParam}`);
            const data = await res.json();
            setAllRooms(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Failed to fetch rooms:", e);
        }
    }, [user.department]);

    useEffect(() => {
        if (user.name) fetchClasses();
        if (user.department) fetchAllRooms();
    }, [user.name, user.department, fetchAllRooms]);

    const handleQuickAttendance = (params) => {
        setQuickAttendance(params);
        setActiveTab('attendance');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'students': return <StudentManager showToast={showToast} />;
            case 'faculty': return <FacultyManager showToast={showToast} />;
            case 'timetable': return <TimetableManager showToast={showToast} allFaculty={allFaculty} allRooms={allRooms} />;
            case 'subjects': return <SubjectsManager facultyList={allFaculty} showToast={showToast} />;
            case 'infrastructure': return <InfrastructureManager user={user} showToast={showToast} />;
            case 'attendance': return (
                <AttendanceManager 
                    showToast={showToast} 
                    initialParams={quickAttendance} 
                    onClearParams={() => setQuickAttendance(null)} 
                />
            );
            case 'notices': return <CommunicationCenter user={user} showToast={showToast} />;
            default: return (
                <HodOverview 
                    onNavigate={setActiveTab} 
                    onQuickAttendance={handleQuickAttendance}
                    user={user} 
                    totalFaculty={allFaculty.length} 
                />
            );
        }
    };

    // Global fetch for faculty to share across components
    const [allFaculty, setAllFaculty] = useState([]);
    useEffect(() => {
        fetch(`${API_BASE_URL}/api/faculty`).then(res => res.json()).then(setAllFaculty).catch(console.error);
    }, []);

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <aside className={`glass-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <img src="/jntugv-logo.png" alt="Logo" className="sidebar-logo" />
                    <div>
                        <div className="sidebar-title">JNTU-GV</div>
                        <div className="sidebar-role">HOD Portal</div>
                    </div>
                </div>

                <nav className="nav-menu">
                    <NavItem icon={<Icons.Home />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                    <NavItem icon={<Icons.Calendar />} label="Timetable Mgr" active={activeTab === 'timetable'} onClick={() => setActiveTab('timetable')} />
                    <NavItem icon={<Icons.Users />} label="Faculty Mgmt" active={activeTab === 'faculty'} onClick={() => setActiveTab('faculty')} />
                    <NavItem icon={<Icons.GradCap />} label="Students" active={activeTab === 'students'} onClick={() => setActiveTab('students')} />
                    <NavItem icon={<Icons.Book />} label="Curriculum" active={activeTab === 'subjects'} onClick={() => setActiveTab('subjects')} />
                    <NavItem icon={<Icons.Building />} label="Campus Infra" active={activeTab === 'infrastructure'} onClick={() => setActiveTab('infrastructure')} />
                    <NavItem icon={<Icons.Check />} label="My Attendance" active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} />
                    <NavItem icon={<Icons.Mail />} label="Communications" active={activeTab === 'notices'} onClick={() => setActiveTab('notices')} />
                </nav>

                <div className="sidebar-footer">
                    <div className="user-snippet">
                        <div className="user-avatar" title={user.name}>{user.name ? user.name.charAt(0) : 'H'}</div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name || 'HOD'}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Head of Dept</div>
                        </div>
                        <button
                            onClick={() => {
                                localStorage.removeItem('user');
                                window.location.href = '/login';
                            }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
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
                <header className="mobile-header">
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="mobile-menu-btn"
                        style={{ background: 'var(--primary)', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: '0.6rem', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '700' }}
                    >
                        <Icons.Home /> Menu
                    </button>
                    <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>HOD Dashboard</span>
                </header>

                {renderContent()}
            </main>

            {/* Premium Notification Toast */}
            {toast.show && (
                <div className="toast-notification fade-in-up" style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    background: '#fff',
                    padding: '1rem 1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    zIndex: 9999,
                    borderLeft: `5px solid ${toast.type === 'success' ? '#10b981' : '#ef4444'}`,
                    animation: 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                }}>
                    <div style={{ color: toast.type === 'success' ? '#10b981' : '#ef4444' }}>
                        {toast.type === 'success' ? <Icons.Check /> : '❌'}
                    </div>
                    <div style={{ fontWeight: '600', color: '#1e293b' }}>{toast.message}</div>
                </div>
            )}
        </div>
    );
}

function NavItem({ icon, label, active, onClick }) {
    return (
        <div className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>
            {icon}
            <span>{label}</span>
        </div>
    );
}


// Removed mid-file import to prevent SyntaxError


// --- OVERVIEW COMPONENT ---
function HodOverview({ onNavigate, onQuickAttendance, user }) {
    const [stats, setStats] = useState({ students: 0, faculty: 0, alerts: 0 });
    const [loading, setLoading] = useState(true);

    const [mySchedule, setMySchedule] = useState([]);

    useEffect(() => {
        setLoading(true);
        const dayMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = dayMap[new Date().getDay()];

        Promise.all([
            fetch(`${API_BASE_URL}/api/students`).then(res => res.json()),
            fetch(`${API_BASE_URL}/api/faculty`).then(res => res.json()),
            fetch(`${API_BASE_URL}/api/timetables?facultyName=${encodeURIComponent(user.name || '')}`).then(res => res.json())
        ]).then(([s, f, sched]) => {
            setStats({
                students: Array.isArray(s) ? s.length : 0,
                faculty: Array.isArray(f) ? f.length : 0,
                alerts: 2
            });

            if (Array.isArray(sched)) {
                setMySchedule(sched);
            }
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, [user.name]);

    const todayClasses = mySchedule.filter(c => c.day === (['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()]));

    return (
        <div>
            {loading && <GlobalLoader />}
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 className="title-gradient" style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>Welcome back, {user.name || 'HOD'} 👋</h1>
                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Manage your department's academics and resources efficiently.</p>
            </div>

            <div className="modern-stats-grid">
                <div className="premium-stat-card">
                    <div className="stat-icon-wrapper stat-blue"><Icons.GradCap /></div>
                    <div className="stat-content"><h5>Dept. Students</h5><h3>{stats.students}</h3><span className="badge-role">Active Enrollment</span></div>
                </div>
                <div className="premium-stat-card">
                    <div className="stat-icon-wrapper stat-orange"><Icons.Building /></div>
                    <div className="stat-content"><h5>Asset Capacity</h5><h3 onClick={() => onNavigate('infrastructure')} style={{ cursor: 'pointer' }}>Manage Spaces</h3><span className="badge-role">Department Grid</span></div>
                </div>
            </div>

            <div className="grid-split" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                <div className="glass-table-container" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0 }}>My Classes Today ({['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()]})</h3>
                        <button className="btn-action primary" onClick={() => onNavigate('attendance')} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>Mark Attendance</button>
                    </div>
                    {todayClasses.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {todayClasses.map((cls, i) => (
                                <div 
                                    key={i} 
                                    style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center', 
                                        padding: '1.25rem', 
                                        background: '#fff', 
                                        borderRadius: '16px', 
                                        boxShadow: 'var(--shadow-sm)', 
                                        borderLeft: `6px solid ${cls.type === 'Lab' ? 'var(--secondary)' : 'var(--primary)'}`,
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        border: '1px solid #f1f5f9'
                                    }}
                                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                                    onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                                >
                                    <div style={{ flex: 1 }}>
                                        <div 
                                            onClick={() => onQuickAttendance({
                                                semester: cls.semester,
                                                subject: cls.subject,
                                                time: cls.time
                                            })}
                                            style={{ 
                                                fontWeight: '800', 
                                                color: 'var(--primary)', 
                                                fontSize: '1.1rem',
                                                cursor: 'pointer',
                                                marginBottom: '4px',
                                                display: 'inline-block'
                                            }}
                                            onMouseOver={e => e.currentTarget.style.textDecoration = 'underline'}
                                            onMouseOut={e => e.currentTarget.style.textDecoration = 'none'}
                                        >
                                            {cls.subject}
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>
                                            {cls.semester} • <span style={{ color: 'var(--secondary)', fontWeight: '700' }}>{cls.room || 'TBD'}</span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                                        <div style={{ 
                                            background: '#f1f5f9', 
                                            padding: '4px 12px', 
                                            borderRadius: '8px', 
                                            fontSize: '0.85rem', 
                                            fontWeight: '700', 
                                            color: 'var(--accent-dark)' 
                                        }}>
                                            {cls.time}
                                        </div>
                                        <button 
                                            className="btn-action primary" 
                                            onClick={() => onQuickAttendance({
                                                semester: cls.semester,
                                                subject: cls.subject,
                                                time: cls.time
                                            })}
                                            style={{ fontSize: '0.75rem', padding: '6px 12px', borderRadius: '8px' }}
                                        >
                                            📝 Take Attendance
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No classes scheduled for you today.</div>
                    )}
                </div>

                <div className="glass-table-container" style={{ padding: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0' }}>Quick Management</h3>
                    <div className="grid-split" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="stat-card-mini" onClick={() => onNavigate('timetable')} style={{ cursor: 'pointer', padding: '1.25rem', background: 'var(--primary-light)', borderRadius: '16px', textAlign: 'center', transition: 'transform 0.2s', border: '1px solid var(--primary-hover)22' }}>
                            <div style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}><Icons.Calendar /></div>
                            <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>Timetable Engine</div>
                        </div>
                        <div className="stat-card-mini" onClick={() => onNavigate('faculty')} style={{ cursor: 'pointer', padding: '1.25rem', background: 'var(--secondary-light)', borderRadius: '16px', textAlign: 'center', transition: 'transform 0.2s', border: '1px solid var(--secondary-hover)22' }}>
                            <div style={{ color: 'var(--secondary)', marginBottom: '0.5rem' }}><Icons.Users /></div>
                            <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>Faculty Workload</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- PLACEHOLDER COMPONENTS (To be filled) ---
function StudentManager({ showToast }) {
    const [students, setStudents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('');
    const [currentStudent, setCurrentStudent] = useState(null);
    const [formData, setFormData] = useState({ rollNumber: '', name: '', year: '3', semester: '1', department: user.department || 'IT' });
    const [activeCourse, setActiveCourse] = useState('B.Tech');
    const [activeYear, setActiveYear] = useState('All');

    const fetchStudents = useCallback(() => {
        fetch(`${API_BASE_URL}/api/students`).then(res => res.json()).then(setStudents).catch(console.error);
    }, []);

    useEffect(() => { fetchStudents(); }, [fetchStudents]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = modalType === 'add' ? `${API_BASE_URL}/api/students` : `${API_BASE_URL}/api/students/${currentStudent._id}`;
        const method = modalType === 'add' ? 'POST' : 'PUT';
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
        if (res.ok) {
            showToast(`Student ${modalType === 'add' ? 'added' : 'updated'}!`);
            setIsModalOpen(false); fetchStudents();
        } else {
            showToast('Failed to save student', 'error');
        }
    };

    const confirmDelete = async () => {
        const res = await fetch(`${API_BASE_URL}/api/students/${currentStudent._id}`, { method: 'DELETE' });
        if (res.ok) {
            showToast('Student deleted');
            setIsModalOpen(false); fetchStudents();
        } else {
            showToast('Failed to delete student', 'error');
        }
    };

    const handleBulkUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData(); formData.append('file', file);
        try {
            const res = await fetch(`${API_BASE_URL}/api/students/upload`, { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) { showToast(data.message); fetchStudents(); }
            else showToast('Error: ' + data.message, 'error');
        } catch (err) { showToast('Upload failed', 'error'); }
        e.target.value = null;
    };

    const filtered = students.filter(s => {
        const matchesCourse = (s.course === activeCourse) || (!s.course && activeCourse === 'B.Tech' && (s.rollNumber || '').includes('1A'));
        const matchesYear = activeYear === 'All' || s.year?.toString() === activeYear;
        return matchesCourse && matchesYear;
    });

    return (
        <>
            <div className="glass-table-container">
                <div className="table-header-premium" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <h3 style={{ margin: 0 }}>Student Directory</h3>
                            <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '4px' }}>
                                {['B.Tech', 'M.Tech', 'MCA'].map(c => (
                                    <button key={c} onClick={() => setActiveCourse(c)} style={{ padding: '6px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: activeCourse === c ? '#fff' : 'transparent', color: activeCourse === c ? '#0f172a' : '#64748b', fontWeight: '600', fontSize: '0.85rem', boxShadow: activeCourse === c ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>{c}</button>
                                ))}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <label className="btn-action" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                📂 CSV
                                <input type="file" accept=".csv" onChange={handleBulkUpload} style={{ display: 'none' }} />
                            </label>
                            <button className="btn-action primary" onClick={() => { setModalType('add'); setFormData({ rollNumber: '', name: '', year: '3', semester: '1', department: user.department || 'IT' }); setIsModalOpen(true); }}>+ Add Student</button>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>Year:</span>
                        {['All', '1', '2', '3', '4'].map(y => (
                            <button key={y} onClick={() => setActiveYear(y)} style={{ padding: '4px 10px', borderRadius: '20px', border: '1px solid ' + (activeYear === y ? '#3b82f6' : '#e2e8f0'), background: activeYear === y ? '#eff6ff' : 'transparent', color: activeYear === y ? '#2563eb' : '#64748b', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}>{y === 'All' ? 'All' : y}</button>
                        ))}
                    </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="premium-table">
                        <thead><tr><th>Roll No</th><th>Name</th><th>Course</th><th>Year/Sem</th><th>Action</th></tr></thead>
                        <tbody>
                            {filtered.map(s => (
                                <tr key={s._id}>
                                    <td style={{ fontWeight: '600', fontFamily: 'monospace' }}>{s.rollNumber}</td>
                                    <td>{s.name}</td>
                                    <td>{s.course}</td>
                                    <td>{s.year}-{s.semester}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => { setModalType('edit'); setCurrentStudent(s); setFormData(s); setIsModalOpen(true); }} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #e2e8f0', background: '#fff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} title="Edit"><Icons.Edit /></button>
                                            <button onClick={() => { setModalType('delete'); setCurrentStudent(s); setIsModalOpen(true); }} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #fee2e2', background: '#fff', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} title="Delete"><Icons.Trash /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && createPortal(
                <div className="modal-overlay">
                    <div className="modal-content glass-panel" style={{ maxWidth: '400px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0 }}>{modalType === 'delete' ? 'Confirm Delete' : (modalType === 'add' ? 'Add Student' : 'Edit Student')}</h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
                        </div>
                        {modalType === 'delete' ? (
                            <div>
                                <p>Delete {currentStudent?.name}?</p>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                                    <button className="btn-action" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button className="btn-action primary" style={{ background: '#ef4444' }} onClick={confirmDelete}>Delete</button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                                <input className="search-input-premium" placeholder="Roll Number" value={formData.rollNumber} onChange={e => setFormData({ ...formData, rollNumber: e.target.value })} required />
                                <input className="search-input-premium" placeholder="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <input className="search-input-premium" placeholder="Year" value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} required />
                                    <input className="search-input-premium" placeholder="Semester" value={formData.semester} onChange={e => setFormData({ ...formData, semester: e.target.value })} required />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                                    <button type="button" className="btn-action" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-action primary">Save</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
function FacultyManager({ showToast }) {
    const [faculty, setFaculty] = useState([]);
    const [workloads, setWorkloads] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('');
    const [currentFac, setCurrentFac] = useState(null);
    const [formData, setFormData] = useState({});

    const fetchFacultyData = useCallback(() => {
        setLoading(true);
        Promise.all([
            fetch(`${API_BASE_URL}/api/faculty`).then(res => res.json()),
            fetch(`${API_BASE_URL}/api/timetables/workload`).then(res => res.json())
        ]).then(([facultyData, workloadData]) => {
            setFaculty(Array.isArray(facultyData) ? facultyData : []);
            setWorkloads(Array.isArray(workloadData) ? workloadData : []);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        fetchFacultyData();
    }, [fetchFacultyData]);

    const getWorkload = (name) => {
        const w = workloads.find(w => w.facultyName === name);
        if (!w) return { totalHours: 0, theoryHours: 0, labHours: 0, targetHours: 16, percentage: 0 };
        const targetHours = 16;
        const percentage = Math.round((w.totalHours / targetHours) * 100);
        return { ...w, targetHours, percentage };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = modalType === 'add' ? `${API_BASE_URL}/api/faculty` : `${API_BASE_URL}/api/faculty/${currentFac._id}`;
        const method = modalType === 'add' ? 'POST' : 'PUT';
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
        if (res.ok) { showToast(`Faculty ${modalType === 'add' ? 'added' : 'updated'}!`); setIsModalOpen(false); fetch(`${API_BASE_URL}/api/faculty`).then(res => res.json()).then(setFaculty); }
    };

    const confirmDelete = async () => {
        const res = await fetch(`${API_BASE_URL}/api/faculty/${currentFac._id}`, { method: 'DELETE' });
        if (res.ok) { showToast('Faculty record deleted'); setIsModalOpen(false); fetch(`${API_BASE_URL}/api/faculty`).then(res => res.json()).then(setFaculty); }
    };

    const handleBulkUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData(); formData.append('file', file);
        try {
            const res = await fetch(`${API_BASE_URL}/api/faculty/upload`, { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) { showToast(data.message); fetch(`${API_BASE_URL}/api/faculty`).then(res => res.json()).then(setFaculty); }
            else showToast('Error: ' + data.message, 'error');
        } catch (err) { showToast('Upload failed', 'error'); }
        e.target.value = null;
    };

    return (
        <>
            <div className="glass-table-container">
                <div className="table-header-premium">
                    <h3>Faculty Management (IT)</h3>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <label className="btn-action" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            📂 CSV
                            <input type="file" accept=".csv" onChange={handleBulkUpload} style={{ display: 'none' }} />
                        </label>
                        <button className="btn-action primary" onClick={() => { setModalType('add'); setFormData({ sNo: faculty.length + 1, name: '', email: '', mobileNumber: '', designation: 'Assistant Professor', type: 'Regular', department: user.department || 'IT' }); setIsModalOpen(true); }}>+ Add Faculty</button>
                    </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="premium-table">
                        <thead><tr><th>Name</th><th>Designation</th><th>Workload (Target)</th><th>Availability</th><th>Action</th></tr></thead>
                        <tbody>
                            {faculty.map(f => {
                                const work = getWorkload(f.name);
                                return (
                                    <tr key={f._id}>
                                        <td style={{ fontWeight: '600' }}>{f.name}</td>
                                        <td><div style={{ fontSize: '0.85rem' }}>{f.designation}</div><div style={{ fontSize: '0.7rem', color: '#64748b' }}>{f.type}</div></td>
                                        <td style={{ minWidth: '150px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                                                <span>{work.totalHours} / {work.targetHours} Hrs (L:{work.labHours})</span>
                                                <span style={{ fontWeight: 'bold', color: work.percentage > 100 ? '#ef4444' : '#16a34a' }}>{work.percentage}%</span>
                                            </div>
                                            <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ width: `${Math.min(work.percentage, 100)}%`, height: '100%', background: work.percentage > 100 ? '#ef4444' : 'var(--primary)', transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', background: work.totalHours < work.targetHours ? '#dcfce7' : '#fee2e2', color: work.totalHours < work.targetHours ? '#166534' : '#991b1b' }}>
                                                {work.totalHours < work.targetHours ? 'Available' : 'Occupied'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => { setModalType('edit'); setCurrentFac(f); setFormData(f); setIsModalOpen(true); }} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #e2e8f0', background: '#fff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} title="Edit"><Icons.Edit /></button>
                                                <button onClick={() => { setModalType('delete'); setCurrentFac(f); setIsModalOpen(true); }} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #fee2e2', background: '#fff', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} title="Delete"><Icons.Trash /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && createPortal(
                <div className="modal-overlay">
                    <div className="modal-content glass-panel" style={{ maxWidth: '500px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0 }}>{modalType === 'delete' ? 'Confirm Delete' : (modalType === 'add' ? 'Add Faculty' : 'Edit Faculty')}</h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
                        </div>
                        {modalType === 'delete' ? (
                            <div>
                                <p>Delete {currentFac?.name}?</p>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                    <button className="btn-action" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button className="btn-action primary" style={{ background: '#ef4444' }} onClick={confirmDelete}>Delete</button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <input className="search-input-premium" placeholder="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                    <input className="search-input-premium" placeholder="Mobile" value={formData.mobileNumber} onChange={e => setFormData({ ...formData, mobileNumber: e.target.value })} required />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <input className="search-input-premium" placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                    <input className="search-input-premium" placeholder="Designation" value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} required />
                                </div>
                                <select className="search-input-premium" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                    <option>Regular</option><option>Contract</option>
                                </select>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                    <button type="button" className="btn-action" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-action primary">Save</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
function TimetableManager({ showToast, allFaculty, allRooms }) {
    const [timetable, setTimetable] = useState(null)
    const [loading, setLoading] = useState(false)
    const [selectedSemester, setSelectedSemester] = useState('I-B.Tech I Sem')
    const [showPreview, setShowPreview] = useState(false)
    const [previewData, setPreviewData] = useState({ theory: [], labs: [] })
    const [showSettings, setShowSettings] = useState(false)
    const [genOptions, setGenOptions] = useState({ slotMode: 'dynamic', labPlacement: 'afternoon', lunchTime: '12:30' })
    const [activeCourse, setActiveCourse] = useState('B.Tech');
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingSlot, setBookingSlot] = useState(null);

    useEffect(() => {
        if (activeCourse === 'B.Tech') setSelectedSemester('I-B.Tech I Sem');
        else if (activeCourse === 'M.Tech') setSelectedSemester('I-M.Tech I Sem');
        else if (activeCourse === 'MCA') setSelectedSemester('I-MCA I Sem');
    }, [activeCourse]);

    const fetchTimetable = useCallback(() => {
        setTimetable(null)
        fetch(`${API_BASE_URL}/api/timetables?semester=${encodeURIComponent(selectedSemester)}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) setTimetable(data[0])
                else if (data && data.schedule) setTimetable(data)
                else setTimetable(null)
            })
            .catch(console.error)
    }, [selectedSemester])

    useEffect(() => { fetchTimetable() }, [fetchTimetable]);

    const generateTimetable = async () => {
        setLoading(true)
        try {
            const res = await fetch(`${API_BASE_URL}/api/timetables/generate`, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ 
                    semester: selectedSemester, 
                    options: genOptions,
                    department: user.department 
                }) 
            })
            const data = await res.json()
            if (res.ok) {
                if (data.unallocated?.length > 0) showToast(`Generated with warnings: ${data.unallocated.length} slots skipped`, 'error');
                else showToast("Timetable Generated Successfully!");
                fetchTimetable();
            }
            else showToast("Error: " + data.message, 'error')
        } catch (err) { showToast("Failed to connect", 'error'); } finally { setLoading(false) }
    }
    const updateCell = (dayIndex, periodIndex) => {
        const day = timetable.schedule[dayIndex];
        const period = day.periods[periodIndex];
        setBookingSlot({
            dayIndex,
            periodIndex,
            day: day.day,
            time: period.time,
            currentSubject: (period.subject === '-' || !period.subject) ? '' : period.subject,
            faculty: period.faculty || '',
            assistants: period.assistants || [],
            room: period.room || '',
            wing: period.wing || ''
        });
        setShowBookingModal(true);
    }

    const createBlankTimetable = async () => {
        setLoading(true)
        try {
            const res = await fetch(`${API_BASE_URL}/api/timetables/manual`, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ semester: selectedSemester }) 
            })
            const data = await res.json()
            if (res.ok) {
                showToast("Blank Timetable Created Successfully!");
                fetchTimetable();
            }
            else showToast("Error: " + data.message, 'error')
        } catch (err) { showToast("Failed to connect", 'error'); } finally { setLoading(false) }
    }

    const handleConfirmBooking = async (details) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/timetables/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dayIndex: bookingSlot.dayIndex,
                    periodIndex: bookingSlot.periodIndex,
                    subject: details.subject || '-',
                    faculty: details.faculty,
                    assistants: details.assistants,
                    room: details.room,
                    wing: details.wing,
                    semester: selectedSemester,
                    updateAll: details.updateAll,
                    originalSubject: bookingSlot.currentSubject
                })
            });
            if (res.ok) {
                showToast(details.updateAll ? 'All subject slots updated!' : 'Slot Updated!');
                setShowBookingModal(false);
                fetchTimetable();
            }
            else showToast('Error: ' + (await res.json()).message, 'error');
        } catch (e) { showToast('Failed to update slot', 'error'); }
    }

    return (
        <>
            <div className="glass-table-container">
                <div className="table-header-premium" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <h3>Timetable Manager</h3>
                            <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '4px' }}>
                                {['B.Tech', 'M.Tech', 'MCA'].map(c => (
                                    <button key={c} onClick={() => setActiveCourse(c)} style={{ padding: '6px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: activeCourse === c ? '#fff' : 'transparent', color: activeCourse === c ? '#0f172a' : '#64748b', fontWeight: '600', fontSize: '0.85rem', boxShadow: activeCourse === c ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>{c}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
                        <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} className="search-input-premium" style={{ width: '250px' }}>
                            <option value="I-B.Tech I Sem">I Year - I Sem</option><option value="I-B.Tech II Sem">I Year - II Sem</option>
                            <option value="II-B.Tech I Sem">II Year - I Sem</option><option value="II-B.Tech II Sem">II Year - II Sem</option>
                            <option value="III-B.Tech I Sem">III Year - I Sem</option><option value="III-B.Tech II Sem">III Year - II Sem</option>
                            <option value="IV-B.Tech I Sem">IV Year - I Sem</option><option value="IV-B.Tech II Sem">IV Year - II Sem</option>
                            <option value="I-M.Tech I Sem">M.Tech I-I</option><option value="I-M.Tech II Sem">M.Tech I-II</option>
                            <option value="I-MCA I Sem">MCA I-I</option><option value="I-MCA II Sem">MCA I-II</option>
                        </select>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <label className="btn-action upload" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Upload CSV">
                            <input type="file" accept=".csv" style={{ display: 'none' }} onChange={(e) => { if(e.target.files[0]) alert('CSV Upload triggered for ' + e.target.files[0].name); }} />
                            📤 Upload CSV
                        </label>
                        <button className="btn-action csv-dl" onClick={() => {
                                if (!timetable || !timetable.schedule) return;
                                const headers = ['Day', '09:30-10:30', '10:30-11:30', '11:30-12:30', '02:00-03:00', '03:00-04:00', '04:00-05:00'];
                                const data = timetable.schedule.map(d => {
                                    const row = [d.day];
                                    // Assuming periods are ordered and correspond to the headers, skipping lunch
                                    const periodMap = {};
                                    d.periods.forEach(p => {
                                        periodMap[p.time] = `${p.subject || '-'} (${p.faculty || 'NA'})`;
                                    });
                                    row.push(periodMap['09:30-10:30'] || '-');
                                    row.push(periodMap['10:30-11:30'] || '-');
                                    row.push(periodMap['11:30-12:30'] || '-');
                                    row.push(periodMap['02:00-03:00'] || '-');
                                    row.push(periodMap['03:00-04:00'] || '-');
                                    row.push(periodMap['04:00-05:00'] || '-');
                                    return row;
                                });
                                exportToCSV(headers, data, `Timetable_${selectedSemester}.csv`);
                            }} title="Export CSV">📄 CSV</button>
                        <button className="btn-action excel" onClick={() => {
                                if (!timetable || !timetable.schedule) return;
                                const headers = ['Day', '09:30-10:30', '10:30-11:30', '11:30-12:30', '02:00-03:00', '03:00-04:00', '04:00-05:00'];
                                const data = timetable.schedule.map(d => {
                                    const row = [d.day];
                                    // Assuming periods are ordered and correspond to the headers, skipping lunch
                                    const periodMap = {};
                                    d.periods.forEach(p => {
                                        periodMap[p.time] = `${p.subject || '-'} (${p.faculty || 'NA'})`;
                                    });
                                    row.push(periodMap['09:30-10:30'] || '-');
                                    row.push(periodMap['10:30-11:30'] || '-');
                                    row.push(periodMap['11:30-12:30'] || '-');
                                    row.push(periodMap['02:00-03:00'] || '-');
                                    row.push(periodMap['03:00-04:00'] || '-');
                                    row.push(periodMap['04:00-05:00'] || '-');
                                    return row;
                                });
                                exportToCSV(headers, data, `Timetable_${selectedSemester}.csv`);
                            }} title="Export Excel">📊 Excel</button>
                            <button className="btn-action pdf" onClick={() => window.print()} title="Generate PDF Report">📕 PDF</button>
                            <button className="btn-action" onClick={() => setShowSettings(true)}>⚙️ Settings</button>
                            <button className="btn-action primary" onClick={generateTimetable} disabled={loading}>{loading ? 'Generating...' : '⚡ Auto-Generate'}</button>
                            <button className="btn-action" style={{ background: '#fff', color: 'var(--primary)', border: '1px solid var(--primary)' }} onClick={createBlankTimetable} disabled={loading}>📝 Create Blank</button>
                            {timetable && (
                                <button className="btn-action" style={{ color: '#ef4444', borderColor: '#fee2e2', background: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={async () => { if (confirm('Delete ENTIRE timetable for this semester?')) { await fetch(`${API_BASE_URL}/api/timetables?semester=${encodeURIComponent(selectedSemester)}`, { method: 'DELETE' }); fetchTimetable(); } }}>
                                    <Icons.Trash /> Delete Timetable
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
                    {timetable ? (
                        <table className="premium-table" style={{ textAlign: 'center', minWidth: '1200px' }}>
                            <thead><tr><th>Day</th><th>09:30-10:30</th><th>10:30-11:30</th><th>11:30-12:30</th><th style={{ background: '#f8fafc' }}>Lunch</th><th>02:00-03:00</th><th>03:00-04:00</th><th>04:00-05:00</th></tr></thead>
                            <tbody>
                                {timetable.schedule.map((day, dIndex) => {
                                    const morning = day.periods.filter(p => !p.time.includes('12:30') && !p.time.startsWith('02') && !p.time.startsWith('03') && !p.time.startsWith('04'));
                                    const afternoon = day.periods.filter(p => p.time.startsWith('02') || p.time.startsWith('03') || p.time.startsWith('04'));
                                    const renderBlock = (periods) => (
                                        <div style={{ display: 'flex', gap: '4px', height: '100%' }}>
                                            {periods.map((p, i) => (
                                                <div key={i} onClick={() => updateCell(dIndex, day.periods.indexOf(p))} style={{ flex: p.credits || 1, background: p.type === 'Lab' ? '#eff6ff' : (p.type === 'Theory' ? '#fffbeb' : '#f4f4f5'), padding: '6px', borderRadius: '6px', border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '0.8rem' }}>
                                                    <div style={{ fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.subject}</div>
                                                    {p.subject && <div style={{ fontSize: '0.65rem', color: '#16a34a', fontWeight: '800', marginTop: '2px' }}>🏢 {p.room || (p.type === 'Lab' ? 'Lab' : 'LH')}</div>}
                                                    {p.faculty && <div style={{ fontSize: '0.65rem', color: '#2563eb', fontWeight: '700' }}>{p.faculty} (M)</div>}
                                                    {p.assistants?.length > 0 && (
                                                        <div style={{ fontSize: '0.6rem', color: '#64748b' }}>
                                                            + {p.assistants.join(', ')}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    );
                                    return (
                                        <tr key={dIndex} style={{ height: '70px' }}>
                                            <td style={{ fontWeight: 'bold' }}>{day.day}</td>
                                            <td colSpan={3} style={{ padding: '4px' }}>{renderBlock(morning)}</td>
                                            <td style={{ background: '#f1f5f9', fontWeight: 'bold', fontSize: '0.8rem', color: '#64748b' }}>BREAK</td>
                                            <td colSpan={3} style={{ padding: '4px' }}>{renderBlock(afternoon)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No timetable found. Click Auto-Generate to create one.</div>
                    )}
                </div>
            </div>

            {showBookingModal && bookingSlot && createPortal(
                <div className="modal-overlay">
                    <div className="modal-content glass-panel" style={{ maxWidth: '600px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0 }}>Edit Slot: {bookingSlot.day} ({bookingSlot.time})</h3>
                            <button onClick={() => setShowBookingModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
                        </div>
                        <BookingForm initialData={bookingSlot} facultyList={allFaculty} roomList={allRooms} onSubmit={handleConfirmBooking} onCancel={() => setShowBookingModal(false)} />
                    </div>
                </div>, document.body
            )}

            {showSettings && createPortal(
                <div className="modal-overlay">
                    <div className="modal-content glass-panel" style={{ maxWidth: '400px' }}>
                        <h3>Generation Settings</h3>
                        <div style={{ margin: '1rem 0' }}>
                            <label>Slot Mode</label>
                            <select className="search-input-premium" value={genOptions.slotMode} onChange={e => setGenOptions({ ...genOptions, slotMode: e.target.value })}>
                                <option value="dynamic">Dynamic</option><option value="1h">1 Hour Fixed</option>
                            </select>
                        </div>
                        <button className="btn-action primary" onClick={() => setShowSettings(false)}>Done</button>
                    </div>
                </div>, document.body
            )}
        </>
    );
}
function SubjectsManager({ facultyList, showToast }) {
    const [subjects, setSubjects] = useState([]);
    const [regulation, setRegulation] = useState('R23');
    const [activeCourse, setActiveCourse] = useState('B.Tech');
    const [courseName, setCourseName] = useState('B.Tech');
    const [semesterName, setSemesterName] = useState('I-B.Tech I Sem');
    const [editRows, setEditRows] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    const fetchSubjects = useCallback(() => { fetch(`${API_BASE_URL}/api/subjects?t=${Date.now()}`).then(res => res.json()).then(setSubjects).catch(console.error); }, []);
    useEffect(() => { fetchSubjects(); }, [fetchSubjects]);

    useEffect(() => {
        const safeSubjects = Array.isArray(subjects) ? subjects : [];
        const current = safeSubjects.filter(s => s && s.semester === semesterName);
        if (current.length > 0) setEditRows(current.map(s => ({ ...s, assignedFaculty: s.assignedFaculty || '', assignedAssistants: s.assignedAssistants || [] })));
        else setEditRows([{ sNo: 1, category: 'PC', courseCode: '', courseName: '', L: '', T: '', P: '', credits: '', semester: semesterName, assignedFaculty: '', assignedAssistants: [] }]);
    }, [subjects, semesterName]);

    const handleSubjectChange = (index, field, value) => { const newRows = [...editRows]; newRows[index] = { ...newRows[index], [field]: value }; setEditRows(newRows); }
    const addSubjectRow = () => setEditRows([...editRows, { sNo: editRows.length + 1, category: 'PC', semester: semesterName, assignedFaculty: '', assignedAssistants: [] }]);

    const saveSubjects = async () => {
        const validRows = editRows.filter(r => r.courseName);
        if (validRows.length === 0) return showToast("Please fill at least one subject", 'error');
        const res = await fetch(`${API_BASE_URL}/api/courses/save`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ regulation, activeCourse, courseName, department: 'IT', subjects: validRows.map(r => ({ ...r, semester: semesterName })) }) });
        if ((await res.json()).success) { showToast('Saved Successfully!'); fetchSubjects(); }
        else showToast('Failed to save', 'error');
    }

    const deleteSubject = async (index) => {
        const row = editRows[index];
        if (row._id) {
            if (!confirm("Are you sure you want to permanently delete this subject?")) return;
            try {
                const res = await fetch(`${API_BASE_URL}/api/courses/subject/${row._id}`, { method: 'DELETE' });
                if (res.ok) {
                    showToast('Subject deleted');
                    setEditRows(editRows.filter((_, idx) => idx !== index));
                    fetchSubjects(); // Sync with global state
                } else {
                    showToast("Failed to delete subject", 'error');
                }
            } catch (e) {
                console.error(e);
                showToast("Error deleting subject", 'error');
            }
        } else {
            // Local delete only
            setEditRows(editRows.filter((_, idx) => idx !== index));
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploading(true);
        const formData = new FormData(); formData.append('file', file);
        try {
            const res = await fetch(`${API_BASE_URL}/api/courses/preview`, { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) {
                setEditRows(data.subjects.map((s, i) => ({ sNo: s.sNo || i + 1, category: s.category || 'PC', courseCode: s.courseCode || '', courseName: s.courseName || '', L: s.L || 0, T: s.T || 0, P: s.P || 0, credits: s.credits || 0, semester: semesterName })));
                showToast('✅ Syllabus Parsed! Review and save.');
            } else showToast('❌ Failed to parse: ' + data.message, 'error');
        } catch (err) { showToast('Error uploading file', 'error'); } finally { setIsUploading(false); e.target.value = null; }
    }

    return (
        <div className="glass-table-container">
            <div className="table-header-premium" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <h3>Curriculum Manager</h3>
                        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '4px' }}>
                            {['B.Tech', 'M.Tech', 'MCA'].map(c => (
                                <button key={c} onClick={() => { setActiveCourse(c); if (c === 'B.Tech') setSemesterName('I-B.Tech I Sem'); else if (c === 'M.Tech') setSemesterName('I-M.Tech I Sem'); else setSemesterName('I-MCA I Sem'); }} style={{ padding: '6px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: activeCourse === c ? '#fff' : 'transparent', color: activeCourse === c ? '#0f172a' : '#64748b', fontWeight: '600', fontSize: '0.85rem', boxShadow: activeCourse === c ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>{c}</button>
                            ))}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <label className="btn-action" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {isUploading ? '⏳...' : '📄 UP/CSV'}
                            <input type="file" accept=".pdf, .csv" onChange={handleFileUpload} style={{ display: 'none' }} disabled={isUploading} />
                        </label>
                        <label className="btn-action upload" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Upload CSV">
                            <input type="file" accept=".csv" style={{ display: 'none' }} onChange={(e) => { if(e.target.files[0]) alert('CSV Upload triggered for ' + e.target.files[0].name); }} />
                            📤 Upload CSV
                        </label>
                        <button className="btn-action csv-dl" onClick={() => {
                            const headers = ['S.No', 'Category', 'Course Code', 'Course Name', 'L', 'T', 'P', 'Credits', 'Semester'];
                            const data = editRows.map(r => [r.sNo, r.category, r.courseCode, r.courseName, r.L, r.T, r.P, r.credits, r.semester]);
                            exportToCSV(headers, data, `Subjects_${semesterName}.csv`);
                        }} title="Export CSV">📄 CSV</button>
                        <button className="btn-action excel" onClick={() => {
                            const headers = ['S.No', 'Category', 'Course Code', 'Course Name', 'L', 'T', 'P', 'Credits', 'Semester'];
                            const data = editRows.map(r => [r.sNo, r.category, r.courseCode, r.courseName, r.L, r.T, r.P, r.credits, r.semester]);
                            exportToCSV(headers, data, `Subjects_${semesterName}.csv`);
                        }} title="Export Excel">📊 Excel</button>
                        <button className="btn-action pdf" onClick={() => window.print()} title="Generate PDF Report">📕 PDF</button>
                        <button className="btn-action primary" onClick={saveSubjects}>💾 Save Changes</button>
                    </div>
                </div>
                <div style={{ width: '100%' }}>
                    <select value={semesterName} onChange={e => setSemesterName(e.target.value)} className="search-input-premium" style={{ width: '250px' }}>
                        <option value="I-B.Tech I Sem">I Year - I Sem</option><option value="I-B.Tech II Sem">I Year - II Sem</option>
                        <option value="II-B.Tech I Sem">II Year - I Sem</option><option value="II-B.Tech II Sem">II Year - II Sem</option>
                        <option value="III-B.Tech I Sem">III Year - I Sem</option><option value="III-B.Tech II Sem">III Year - II Sem</option>
                        <option value="IV-B.Tech I Sem">IV Year - I Sem</option><option value="IV-B.Tech II Sem">IV Year - II Sem</option>
                        <option value="I-M.Tech I Sem">M.Tech I-I</option><option value="I-M.Tech II Sem">M.Tech I-II</option>
                        <option value="I-MCA I Sem">MCA I-I</option><option value="I-MCA II Sem">MCA I-II</option>
                    </select>
                </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table className="premium-table">
                    <thead><tr><th style={{ width: '50px' }}>S.No</th><th>Category</th><th>Code</th><th>Title</th><th>L</th><th>T</th><th>P</th><th>C</th><th>Action</th></tr></thead>
                    <tbody>
                        {editRows.map((row, i) => (
                            <tr key={i} style={{ background: '#fff' }}>
                                <td><input value={row.sNo || ''} onChange={e => handleSubjectChange(i, 'sNo', e.target.value)} className="modern-input" style={{ width: '100%', padding: '4px' }} /></td>
                                <td>
                                    <select value={row.category || 'PC'} onChange={e => handleSubjectChange(i, 'category', e.target.value)} className="modern-input" style={{ padding: '4px' }}>
                                        <option value="PC">PC</option><option value="BS">BS</option><option value="ES">ES</option><option value="MC">MC</option>
                                    </select>
                                </td>
                                <td><input value={row.courseCode || ''} onChange={e => handleSubjectChange(i, 'courseCode', e.target.value)} className="modern-input" style={{ width: '100%', padding: '4px' }} /></td>
                                <td><input value={row.courseName || ''} onChange={e => handleSubjectChange(i, 'courseName', e.target.value)} className="modern-input" style={{ width: '100%', padding: '4px' }} /></td>
                                <td><input value={row.L || ''} onChange={e => handleSubjectChange(i, 'L', e.target.value)} className="modern-input" style={{ width: '40px', textAlign: 'center', padding: '4px' }} /></td>
                                <td><input value={row.T || ''} onChange={e => handleSubjectChange(i, 'T', e.target.value)} className="modern-input" style={{ width: '40px', textAlign: 'center', padding: '4px' }} /></td>
                                <td><input value={row.P || ''} onChange={e => handleSubjectChange(i, 'P', e.target.value)} className="modern-input" style={{ width: '40px', textAlign: 'center', padding: '4px' }} /></td>
                                <td><input value={row.credits || ''} onChange={e => handleSubjectChange(i, 'credits', e.target.value)} className="modern-input" style={{ width: '40px', textAlign: 'center', padding: '4px', fontWeight: 'bold' }} /></td>
                                <td>
                                    <button
                                        onClick={() => deleteSubject(i)}
                                        className="btn-action"
                                        style={{ color: '#fff', background: '#ef4444', border: 'none', cursor: 'pointer', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                        title="Delete Subject"
                                    >
                                        <Icons.Trash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button onClick={addSubjectRow} style={{ width: '100%', padding: '12px', marginTop: '10px', border: '2px dashed #cbd5e1', borderRadius: '8px', color: '#64748b', cursor: 'pointer', background: '#f8fafc', fontWeight: '600' }}>+ Add Row</button>
            </div >
        </div >
    );
}
function BookingForm({ initialData, facultyList, onSubmit, onCancel }) {
    const [subject, setSubject] = useState(initialData.currentSubject);
    const [mainFaculty, setMainFaculty] = useState(initialData.faculty);
    const [assistants, setAssistants] = useState(initialData.assistants || []);
    const [room, setRoom] = useState(initialData.room || '');
    const [wing, setWing] = useState(initialData.wing || '');
    const [updateAll, setUpdateAll] = useState(true);
    const isLab = (subject || '').toLowerCase().includes('lab') || (subject || '').toLowerCase().includes('project');

    const contractFaculty = facultyList.filter(f => f.type === 'Contract');
    const regularFaculty = facultyList.filter(f => f.type !== 'Contract');
    const renderOpts = (list) => list.map(f => <option key={f._id} value={f.name}>{f.name}</option>);

    const handleAssistantChange = (e) => {
        const selected = Array.from(e.target.selectedOptions, option => option.value);
        setAssistants(selected);
    };

    return (
        <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
                <label style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem', display: 'block' }}>Subject Name</label>
                <input className="search-input-premium" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Enter subject or '-'" />
            </div>
            <div>
                <label style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem', display: 'block' }}>
                    {isLab ? 'Main Permanent Faculty (Professor)' : 'Assigned Faculty'}
                </label>
                <select className="search-input-premium" value={mainFaculty} onChange={e => setMainFaculty(e.target.value)}>
                    <option value="">-- Select --</option>
                    <optgroup label="Regular / Permanent Professors">{renderOpts(regularFaculty)}</optgroup>
                    <optgroup label="Contract Faculty">{renderOpts(contractFaculty)}</optgroup>
                </select>
            </div>
            {isLab && (
                <div>
                    <label style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem', display: 'block' }}>
                        Lab Assistants (2 Contract Faculty)
                    </label>
                    <select multiple className="search-input-premium" style={{ height: '120px' }} value={assistants} onChange={handleAssistantChange}>
                        <optgroup label="Contract Faculty (Preferred)">{renderOpts(contractFaculty)}</optgroup>
                        <optgroup label="Regular Faculty">{renderOpts(regularFaculty)}</optgroup>
                    </select>
                </div>
            )}
            <div>
                <label style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem', display: 'block' }}>Allotted Room / Lab</label>
                <select className="search-input-premium" value={room} onChange={e => setRoom(e.target.value)}>
                    <option value="">-- Select Room --</option>
                    {roomList.map(r => (
                        <option key={r._id} value={r.name}>{r.name} ({r.type} - {r.wing})</option>
                    ))}
                </select>
            </div>
            {isLab && (
                <div>
                    <label style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem', display: 'block' }}>Laboratory Wing</label>
                    <select className="search-input-premium" value={wing} onChange={e => setWing(e.target.value)}>
                        <option value="">-- Select Wing --</option>
                        <option value="Wing 1">Wing 1</option>
                        <option value="Wing 2">Wing 2</option>
                    </select>
                </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', background: '#f8fafc', borderRadius: '8px' }}>
                <input type="checkbox" checked={updateAll} onChange={e => setUpdateAll(e.target.checked)} id="syncAll" />
                <label htmlFor="syncAll" style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>Apply this faculty to ALL slots of this subject</label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                <button
                    className="btn-action"
                    style={{ color: '#ef4444', borderColor: '#fee2e2', background: '#fef2f2' }}
                    onClick={() => {
                        if (confirm('Clear this slot?')) onSubmit({ subject: '-', faculty: '', assistants: [], updateAll: false });
                    }}
                >
                    Clear Slot
                </button>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-action" onClick={onCancel}>Cancel</button>
                    <button className="btn-action primary" onClick={() => onSubmit({ subject, faculty: mainFaculty, assistants, wing, room, updateAll })}>Save</button>
                </div>
            </div>
        </div>
    );
}

function AttendanceManager({ showToast, initialParams, onClearParams }) {
    const [user, setUser] = useState({});
    const [selectedSemester, setSelectedSemester] = useState('');
    const [semesterSubjects, setSemesterSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedTime, setSelectedTime] = useState('');

    useEffect(() => {
        if (initialParams) {
            setSelectedSemester(initialParams.semester);
            setSelectedSubject(initialParams.subject);
            setSelectedTime(initialParams.time);
            onClearParams();
        }
    }, [initialParams, onClearParams]);
    const [students, setStudents] = useState([]);
    const [attendanceData, setAttendanceData] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [viewMode, setViewMode] = useState('mark'); // 'mark' | 'history'
    const [history, setHistory] = useState([]);
    const [viewingRecord, setViewingRecord] = useState(null);
    const [timetableToday, setTimetableToday] = useState([]);
    const [attendanceExists, setAttendanceExists] = useState(false);
    const [existingId, setExistingId] = useState(null);

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
        const deptParam = user?.department ? `department=${encodeURIComponent(user.department)}` : '';
        fetch(`${API_BASE_URL}/api/attendance?${deptParam}`)
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setHistory(data); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user?.department]);

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

    // AUTO-LOAD LOGIC: Effect to fetch students when semester + subject are selected
    useEffect(() => {
        const fetchStudentsAndRecords = async () => {
            if (!selectedSemester || !selectedSubject) return;
            
            // Auto-set time from timetable if available
            const autoTime = selectedTime || 'N/A';
            
            setLoading(true);
            setAttendanceExists(false);
            setExistingId(null);
            
            try {
                // 1. Check if attendance already exists for today
                const checkRes = await fetch(`${API_BASE_URL}/api/attendance?date=${attendanceDate}&semester=${encodeURIComponent(selectedSemester)}&subject=${encodeURIComponent(selectedSubject)}`);
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
                    // 2. Fetch student list for marking
                    const deptParam = user?.department ? `&department=${encodeURIComponent(user.department)}` : '';
                    const studentRes = await fetch(`${API_BASE_URL}/api/attendance/students?semester=${encodeURIComponent(selectedSemester)}${deptParam}`);
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
    }, [selectedSemester, selectedSubject, attendanceDate, user?.department]);

    const toggleStatus = (studentId) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present'
        }));
    };

    const submitAttendance = async () => {
        if (!selectedSemester || !selectedSubject) return;
        
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
                department: user?.department,
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
        <div className="fade-in-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ margin: 0, color: 'var(--accent-dark)' }}>Attendance Gateway</h2>
                    <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Strategic academic tracking for {user.department} department.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', background: 'white', padding: '0.5rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                    <button 
                        className={`btn-action ${viewMode === 'mark' ? 'primary' : ''}`} 
                        onClick={() => { setViewMode('mark'); setStudents([]); }}
                        style={{ padding: '8px 20px', fontSize: '0.85rem' }}
                    >
                        Mark Attendance
                    </button>
                    <button 
                        className={`btn-action ${viewMode === 'history' ? 'primary' : ''}`} 
                        onClick={() => setViewMode('history')}
                        style={{ padding: '8px 20px', fontSize: '0.85rem' }}
                    >
                        View Reports
                    </button>
                </div>
            </div>

            {viewMode === 'mark' ? (
                <>
                <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', borderRadius: '20px', border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                        <div style={{ width: '40px', height: '40px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icons.Check />
                        </div>
                        <h3 style={{ margin: 0 }}>Strategic Filter Interface</h3>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                        <div className="input-group">
                            <label className="input-label">Academic Semester</label>
                            <select 
                                className="modern-input" 
                                style={{ width: '100%', borderRadius: '12px' }}
                                value={selectedSemester}
                                onChange={e => { setSelectedSemester(e.target.value); setSelectedSubject(''); }}
                            >
                                <option value="">-- Select Semester --</option>
                                {semesters.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        
                        <div className="input-group">
                            <label className="input-label">Subject / Laboratory</label>
                            <select 
                                className="modern-input" 
                                style={{ width: '100%', borderRadius: '12px' }}
                                value={selectedSubject}
                                onChange={e => setSelectedSubject(e.target.value)}
                                disabled={!selectedSemester}
                            >
                                <option value="">-- Select Subject --</option>
                                {[...new Set(semesterSubjects.map(s => s.courseName))].map(courseName => (
                                    <option key={courseName} value={courseName}>{courseName}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {loading && (
                        <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                            <div className="pulse-soft" style={{ fontSize: '1rem', color: 'var(--primary)' }}>🔍 Loading students...</div>
                        </div>
                    )}
                </div>

                {students.length > 0 ? (
                    <div className="glass-table-container fade-in-up" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                        <div className="table-header-premium" style={{ background: '#f8fafc', padding: '1.5rem 2rem' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{attendanceExists ? 'Reviewing Record' : 'Attendance Registry'}</h3>
                                    {attendanceExists && (
                                        <span style={{ 
                                            background: '#dcfce7', color: '#16a34a', fontSize: '0.7rem', 
                                            padding: '2px 10px', borderRadius: '99px', fontWeight: 800,
                                            border: '1px solid #bbf7d0', textTransform: 'uppercase', letterSpacing: '0.5px'
                                        }}>Recorded</span>
                                    )}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                                    {selectedSubject} • {selectedTime} • <span style={{ fontWeight: 600 }}>{students.length} Students Detected</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', background: 'white', borderRadius: '12px', padding: '4px', border: '1px solid var(--border-light)', marginRight: '0.5rem' }}>
                                    <button onClick={() => markAll('Present')} style={{ padding: '6px 14px', border: 'none', background: 'transparent', color: '#16a34a', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer' }}>✓ All P</button>
                                    <button onClick={() => markAll('Absent')} style={{ padding: '6px 14px', border: 'none', background: 'transparent', color: '#ef4444', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer' }}>✗ All A</button>
                                </div>
                                <div style={{ background: 'var(--accent-dark)', color: 'white', padding: '8px 16px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '600', display: 'flex', gap: '12px' }}>
                                    <span>P: {presentCount}</span>
                                    <span style={{ opacity: 0.3 }}>|</span>
                                    <span>A: {absentCount}</span>
                                </div>
                            </div>
                        </div>
                        <div style={{ padding: '0 1rem' }}>
                            <table className="premium-table">
                                <thead>
                                    <tr>
                                        <th style={{ paddingLeft: '2rem' }}>Candidate Roll</th>
                                        <th>Student Name</th>
                                        <th style={{ textAlign: 'center' }}>Portal Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((s, idx) => (
                                        <tr key={s._id} style={{ animation: `fadeIn 0.3s ease-out ${idx * 0.01}s backwards` }}>
                                            <td style={{ paddingLeft: '2rem', fontFamily: "'JetBrains Mono', monospace", fontWeight: '700', color: 'var(--accent-dark)' }}>{s.rollNumber}</td>
                                            <td style={{ fontWeight: 500 }}>{s.name}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <div 
                                                    style={{ 
                                                        display: 'inline-flex', 
                                                        background: attendanceData[s._id] === 'Present' ? '#dcfce7' : '#fee2e2', 
                                                        borderRadius: '30px', 
                                                        padding: '4px', 
                                                        cursor: 'pointer', 
                                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                                                        width: '110px', 
                                                        position: 'relative',
                                                        border: `1px solid ${attendanceData[s._id] === 'Present' ? '#bbf7d0' : '#fecaca'}`
                                                    }} 
                                                    onClick={() => toggleStatus(s._id)}
                                                >
                                                    <div style={{ 
                                                        position: 'absolute', 
                                                        top: '4px', 
                                                        left: attendanceData[s._id] === 'Present' ? '60px' : '4px', 
                                                        width: '42px', 
                                                        height: '30px', 
                                                        background: attendanceData[s._id] === 'Present' ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #ef4444, #dc2626)', 
                                                        borderRadius: '20px', 
                                                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                                    }}></div>
                                                    <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'space-between', padding: '0 15px', alignItems: 'center', height: '30px', fontSize: '0.75rem', fontWeight: '800', zIndex: 2, userSelect: 'none' }}>
                                                        <span style={{ color: attendanceData[s._id] === 'Present' ? '#166534' : '#fff' }}>ABSENT</span>
                                                        <span style={{ color: attendanceData[s._id] === 'Present' ? '#fff' : '#991b1b' }}>PRESENT</span>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div style={{ padding: '2rem', textAlign: 'right', background: '#f8fafc', borderTop: '1px solid var(--border-light)' }}>
                            <button
                                className="btn-action primary"
                                style={{ width: '220px', padding: '12px' }}
                                onClick={submitAttendance}
                                disabled={submitting}
                            >
                                {submitting ? '🔒 Finalizing...' : (attendanceExists ? '🛠️ Update Portal Record' : '🚀 Finalize Attendance')}
                            </button>
                        </div>
                    </div>
                ) : (
                    selectedSemester && selectedSubject && !loading && (
                        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8', borderRadius: '24px' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                            <h3 style={{ color: 'var(--accent-dark)', marginBottom: '0.5rem' }}>No Students Found</h3>
                            <p>We couldn't find any students for {selectedSemester} in {user.department}.<br/>Please verify the filters or check the student directory.</p>
                        </div>
                    )
                )}
                </>
            ) : (
                <AttendanceCalendarView history={history} loading={loading} fetchHistory={fetchHistory} setViewingRecord={setViewingRecord} />
            )}

            {viewingRecord && createPortal(
                <div className="modal-overlay">
                    <div className="modal-content glass-panel" style={{ maxWidth: '700px', width: '90%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'flex-start' }}>
                            <div>
                                <h3 style={{ margin: 0 }}>{viewingRecord.subject} Attendance</h3>
                                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                                    {viewingRecord.semester} • {viewingRecord.date} • {viewingRecord.periodTime}
                                </p>
                                <p style={{ margin: '4px 0 0 0', color: '#3b82f6', fontSize: '0.85rem', fontWeight: '600' }}>
                                    Faculty: {viewingRecord.facultyName}
                                </p>
                            </div>
                            <button onClick={() => setViewingRecord(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
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
                            }}>📄 Export CSV</button>
                            <button className="btn-action primary" onClick={() => setViewingRecord(null)}>Close</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

function AttendanceCalendarView({ history, loading, fetchHistory, setViewingRecord }) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

    // Build a map: dateStr -> array of records
    const dateMap = {};
    (history || []).forEach(rec => {
        const d = rec.date; // e.g. "2026-03-18" or "18-03-2026"
        if (d) {
            // Normalize to YYYY-MM-DD
            let normalized = d;
            if (d.match(/^\d{2}-\d{2}-\d{4}$/)) {
                const [dd, mm, yyyy] = d.split('-');
                normalized = `${yyyy}-${mm}-${dd}`;
            }
            if (!dateMap[normalized]) dateMap[normalized] = [];
            dateMap[normalized].push(rec);
        }
    });

    const pad = n => String(n).padStart(2, '0');
    const todayStr = `${new Date().getFullYear()}-${pad(new Date().getMonth()+1)}-${pad(new Date().getDate())}`;

    const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

    const selectedDateStr = selectedDate;
    const selectedRecords = selectedDateStr ? (dateMap[selectedDateStr] || []) : [];

    // Count total attendance days this month
    const daysWithAttendance = Object.keys(dateMap).filter(d => {
        const [y, m] = d.split('-');
        return parseInt(y) === year && parseInt(m) === month + 1;
    }).length;

    return (
        <div className="fade-in-up">
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                        <h3 style={{ margin: 0 }}>📅 Attendance Calendar</h3>
                        <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                            {daysWithAttendance} day(s) with attendance this month
                        </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button onClick={fetchHistory} className="btn-action" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>🔄 Refresh</button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '6px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                            <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 10px', fontSize: '1rem', color: '#64748b' }}>◀</button>
                            <span style={{ fontWeight: 700, fontSize: '1rem', minWidth: '160px', textAlign: 'center', color: 'var(--accent-dark)' }}>{monthNames[month]} {year}</span>
                            <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 10px', fontSize: '1rem', color: '#64748b' }}>▶</button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <div className="pulse-soft" style={{ fontSize: '1.1rem' }}>Loading calendar...</div>
                    </div>
                ) : (
                    <div>
                        {/* Day Headers */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
                            {dayNames.map(d => (
                                <div key={d} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', padding: '8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{d}</div>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                            {/* Empty slots before 1st */}
                            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                                <div key={`e-${i}`} style={{ aspectRatio: '1', borderRadius: '14px' }}></div>
                            ))}
                            {/* Day Cells */}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const dayNum = i + 1;
                                const dateStr = `${year}-${pad(month + 1)}-${pad(dayNum)}`;
                                const hasRecords = !!dateMap[dateStr];
                                const recordCount = dateMap[dateStr]?.length || 0;
                                const isToday = dateStr === todayStr;
                                const isSelected = dateStr === selectedDate;
                                const isSunday = new Date(year, month, dayNum).getDay() === 0;

                                return (
                                    <div
                                        key={dayNum}
                                        onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                                        style={{
                                            aspectRatio: '1',
                                            borderRadius: '14px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            background: isSelected ? 'var(--primary)' : isToday ? '#FFF1F2' : hasRecords ? '#F0FDF4' : isSunday ? '#fef2f2' : 'white',
                                            color: isSelected ? 'white' : isToday ? 'var(--primary)' : isSunday ? '#ef4444' : 'var(--accent-dark)',
                                            border: isSelected ? '2px solid var(--primary)' : isToday ? '2px solid var(--primary)' : '1px solid #f1f5f9',
                                            fontWeight: isToday || isSelected ? 800 : 500,
                                            fontSize: '0.95rem',
                                            position: 'relative',
                                            transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                                            boxShadow: isSelected ? '0 4px 15px rgba(255,107,107,0.3)' : 'none'
                                        }}
                                    >
                                        {dayNum}
                                        {hasRecords && (
                                            <div style={{
                                                display: 'flex',
                                                gap: '2px',
                                                marginTop: '2px',
                                            }}>
                                                {Array.from({ length: Math.min(recordCount, 3) }).map((_, di) => (
                                                    <div key={di} style={{
                                                        width: '5px',
                                                        height: '5px',
                                                        borderRadius: '50%',
                                                        background: isSelected ? 'white' : '#22c55e'
                                                    }} />
                                                ))}
                                                {recordCount > 3 && <span style={{ fontSize: '0.5rem', color: isSelected ? 'white' : '#16a34a', fontWeight: 700 }}>+{recordCount - 3}</span>}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', justifyContent: 'center', fontSize: '0.75rem', color: '#64748b' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e' }} /> Attendance Taken</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '10px', height: '10px', borderRadius: '3px', border: '2px solid var(--primary)', background: '#FFF1F2' }} /> Today</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)' }} /> Selected</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Records for selected date */}
            {selectedDate && (
                <div className="glass-table-container fade-in-up" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                    <div className="table-header-premium" style={{ background: '#f8fafc', padding: '1.25rem 2rem' }}>
                        <div>
                            <h3 style={{ margin: 0 }}>Records for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h3>
                            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.85rem' }}>{selectedRecords.length} session(s) recorded</p>
                        </div>
                    </div>
                    {selectedRecords.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📭</div>
                            <p>No attendance was taken on this date.</p>
                        </div>
                    ) : (
                        <div style={{ padding: '1rem' }}>
                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                {selectedRecords.map((rec, idx) => {
                                    const p = rec.records?.filter(r => r.status === 'Present').length || 0;
                                    const total = rec.records?.length || 0;
                                    const pct = total > 0 ? Math.round((p / total) * 100) : 0;
                                    return (
                                        <div key={idx} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '1rem 1.5rem',
                                            background: 'white',
                                            borderRadius: '16px',
                                            border: '1px solid #f1f5f9',
                                            transition: 'all 0.2s',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => setViewingRecord(rec)}
                                        onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; }}
                                        onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{
                                                    width: '44px', height: '44px', borderRadius: '12px',
                                                    background: rec.subject?.toLowerCase().includes('lab') ? '#F5F3FF' : '#EFF6FF',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '1.2rem'
                                                }}>
                                                    {rec.subject?.toLowerCase().includes('lab') ? '🔬' : '📖'}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700, color: 'var(--accent-dark)' }}>{rec.subject}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{rec.semester} • {rec.periodTime || 'N/A'} • {rec.facultyName}</div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontWeight: 800, color: pct >= 75 ? '#16a34a' : pct >= 50 ? '#d97706' : '#ef4444', fontSize: '1.1rem' }}>{pct}%</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{p}/{total} present</div>
                                                </div>
                                                <div style={{ 
                                                    width: '40px', height: '40px', borderRadius: '50%', 
                                                    background: `conic-gradient(${pct >= 75 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444'} ${pct}%, #f1f5f9 0%)`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'white' }} />
                                                </div>
                                                <span style={{ color: '#94a3b8', fontSize: '1.2rem' }}>→</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function InfrastructureManager({ user, showToast }) {
    const [rooms, setRooms] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [addCount, setAddCount] = useState(1);
    const [filterDept, setFilterDept] = useState(user.department || 'IT');
    const [batch, setBatch] = useState('2024-2028');

    const fetchRooms = useCallback(async () => {
        const deptParam = user.department ? `?department=${encodeURIComponent(user.department)}` : '';
        const res = await fetch(`${API_BASE_URL}/api/rooms${deptParam}`);
        const data = await res.json();
        setRooms(Array.isArray(data) ? data : []);
    }, [user.department]);

    useEffect(() => { fetchRooms(); }, [fetchRooms]);

    const handleRoomChange = (roomObj, field, value) => {
        setRooms(prev => prev.map(r => {
            if (r === roomObj) {
                const updated = { ...r, [field]: value };
                if (field === 'type') {
                    updated.wing = value === 'Lab' ? 'LAB 1' : 'AB1';
                }
                return updated;
            }
            return r;
        }));
    };

    const addRoomsBulk = (type) => {
        const count = parseInt(addCount) || 1;
        const newBatch = [];
        const existingClassCount = rooms.filter(r => r.type === 'Classroom').length;
        const existingLabCount = rooms.filter(r => r.type === 'Lab').length;

        for (let i = 0; i < count; i++) {
            newBatch.push({
                name: type === 'Lab' ? `LAB-${(existingLabCount + i + 1).toString().padStart(2, '0')}` : `LH-${(existingClassCount + i + 1).toString().padStart(2, '0')}`,
                type: type,
                wing: type === 'Lab' ? 'LAB BLOCK' : 'AB1',
                year: '1st Year',
                semester: '1st Sem',
                batch: batch || '2024-2028',
                section: 'Section A',
                morningSession: 'Available',
                afternoonSession: 'Available',
                department: user.department || 'IT'
            });
        }
        setRooms([...rooms, ...newBatch]);
        showToast(`Locally added ${count} ${type}(s). Click Save to sync.`);
    };

    const deleteRoom = (roomObj) => {
        setRooms(prev => prev.filter(r => r !== roomObj));
    };

    const saveRooms = async () => {
        setIsSaving(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/rooms/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rooms })
            });
            if (response.ok) {
                showToast('Infrastructure saved successfully!');
                fetchRooms();
            } else {
                showToast('Failed to save infrastructure data.', 'error');
            }
        } catch (e) {
            showToast('Error saving data', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredRooms = rooms.filter(r => filterDept === 'All' || r.department === filterDept);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} className="fade-in-up">
            <div className="glass-table-container">
                <div className="table-header-premium" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div>
                            <h3>University Infrastructure Manager</h3>
                            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Define and Manage Physical Assets (Classes & Labs)</p>
                        </div>
                        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '12px', padding: '0.5rem', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase' }}>Dept: {user.department || 'IT'}</span>
                        </div>
                        <div style={{ marginLeft: '1rem' }}>
                            <label style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold' }}>Current Batch</label>
                            <input 
                                className="modern-input" 
                                style={{ width: '120px', padding: '6px' }} 
                                value={batch} 
                                onChange={e => setBatch(e.target.value)} 
                                placeholder="e.g. 2024-2028"
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ padding: '0.75rem 1.25rem', background: 'var(--primary-light)', borderRadius: '12px', border: '1px solid var(--primary-hover)44' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase' }}>Classes Created</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary)' }}>{rooms.filter(r => r.type === 'Classroom').length} <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>/ Goal: Auto</span></div>
                        </div>
                        <div style={{ padding: '0.75rem 1.25rem', background: 'var(--secondary-light)', borderRadius: '12px', border: '1px solid var(--secondary-hover)44' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase' }}>Labs Created</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--secondary)' }}>{rooms.filter(r => r.type === 'Lab').length} <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>/ Min: 2</span></div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginLeft: '1rem' }}>
                            <label style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold' }}>Batch Size</label>
                            <input
                                type="number"
                                min="1"
                                max="20"
                                value={addCount}
                                onChange={e => setAddCount(e.target.value)}
                                className="modern-input"
                                style={{ width: '70px', padding: '8px', color: '#1e293b', border: '2px solid var(--border-light)' }}
                            />
                        </div>
                        <button onClick={() => addRoomsBulk('Classroom')} className="btn-action primary" style={{ background: 'var(--primary)' }}>+ Classes</button>
                        <button onClick={() => addRoomsBulk('Lab')} className="btn-action primary" style={{ background: 'var(--secondary)' }}>+ Labs</button>
                        <button onClick={saveRooms} className="btn-action primary" disabled={isSaving} style={{ background: 'var(--accent-dark)' }}>
                            {isSaving ? '⏳ Saving...' : '💾 Save Infrastructure'}
                        </button>
                    </div>
                </div>
                <div style={{ padding: '1rem' }}>
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Identifier (e.g. LH-36)</th>
                                <th style={{ width: '120px' }}>Type</th>
                                <th style={{ width: '110px' }}>Mapping</th>
                                <th style={{ width: '110px' }}>Sem</th>
                                <th style={{ width: '120px' }}>Batch</th>
                                <th style={{ width: '120px' }}>Section</th>
                                <th style={{ width: '120px' }}>Wing</th>
                                <th>Morning (FN)</th>
                                <th>Afternoon (AN)</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRooms.length > 0 ? filteredRooms.map((r, i) => (
                                <tr key={r._id || i}>
                                    <td>
                                        <input
                                            value={r.name}
                                            onChange={e => handleRoomChange(r, 'name', e.target.value)}
                                            className="modern-input"
                                            style={{ fontWeight: '700', width: '120px' }}
                                        />
                                    </td>
                                    <td>
                                        <select
                                            value={r.type}
                                            onChange={e => handleRoomChange(r, 'type', e.target.value)}
                                            className="modern-input"
                                            style={{ padding: '6px' }}
                                        >
                                            <option value="Classroom">Classroom</option>
                                            <option value="Lab">Lab</option>
                                        </select>
                                    </td>
                                    <td>
                                        <select
                                            value={r.year || '1st Year'}
                                            onChange={e => handleRoomChange(r, 'year', e.target.value)}
                                            className="modern-input"
                                            style={{ padding: '4px', fontSize: '0.75rem' }}
                                        >
                                            <option value="1st Year">1st Year</option>
                                            <option value="2nd Year">2nd Year</option>
                                            <option value="3rd Year">3rd Year</option>
                                            <option value="4th Year">4th Year</option>
                                        </select>
                                    </td>
                                    <td>
                                        <select
                                            value={r.semester || '1st Sem'}
                                            onChange={e => handleRoomChange(r, 'semester', e.target.value)}
                                            className="modern-input"
                                            style={{ padding: '4px', fontSize: '0.75rem' }}
                                        >
                                            <option value="1st Sem">1st Sem</option><option value="2nd Sem">2nd Sem</option>
                                            <option value="3rd Sem">3rd Sem</option><option value="4th Sem">4th Sem</option>
                                            <option value="5th Sem">5th Sem</option><option value="6th Sem">6th Sem</option>
                                            <option value="7th Sem">7th Sem</option><option value="8th Sem">8th Sem</option>
                                        </select>
                                    </td>
                                    <td>
                                        <input
                                            value={r.batch || '2024-2028'}
                                            onChange={e => handleRoomChange(r, 'batch', e.target.value)}
                                            className="modern-input"
                                            style={{ padding: '4px', fontSize: '0.75rem', width: '90px' }}
                                        />
                                    </td>
                                    <td>
                                        <select
                                            value={r.section || 'All'}
                                            onChange={e => handleRoomChange(r, 'section', e.target.value)}
                                            className="modern-input"
                                            style={{ padding: '4px', fontSize: '0.75rem' }}
                                        >
                                            <option value="Section A">Section A</option>
                                            <option value="Section B">Section B</option>
                                            <option value="Wing 1">Wing 1</option>
                                            <option value="Wing 2">Wing 2</option>
                                            <option value="All">All</option>
                                        </select>
                                    </td>
                                    <td>
                                        <input
                                            value={r.wing}
                                            onChange={e => handleRoomChange(r, 'wing', e.target.value)}
                                            className="modern-input"
                                            style={{ width: '100px', fontSize: '0.75rem' }}
                                        />
                                    </td>
                                    <td>
                                        <select
                                            value={r.morningSession}
                                            onChange={e => handleRoomChange(r, 'morningSession', e.target.value)}
                                            className="modern-input"
                                            style={{
                                                color: r.morningSession === 'Available' ? '#10b981' : '#ef4444',
                                                fontWeight: 'bold',
                                                padding: '6px'
                                            }}
                                        >
                                            <option value="Available">🟢 Available</option>
                                            <option value="Occupied">🔴 Occupied</option>
                                            <option value="Maintenance">🟠 Maintenance</option>
                                        </select>
                                    </td>
                                    <td>
                                        <select
                                            value={r.afternoonSession}
                                            onChange={e => handleRoomChange(r, 'afternoonSession', e.target.value)}
                                            className="modern-input"
                                            style={{
                                                color: r.afternoonSession === 'Available' ? '#10b981' : '#ef4444',
                                                fontWeight: 'bold',
                                                padding: '6px'
                                            }}
                                        >
                                            <option value="Available">🟢 Available</option>
                                            <option value="Occupied">🔴 Occupied</option>
                                            <option value="Maintenance">🟠 Maintenance</option>
                                        </select>
                                    </td>
                                    <td>
                                        <button onClick={() => deleteRoom(r)} className="btn-action" style={{ color: '#ef4444' }}>
                                            <Icons.Trash />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="11" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                        No infrastructure data found. Add assets to get started. 🚀
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}



export default HodDashboard;
