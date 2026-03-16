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

    useEffect(() => {
        if (user.name) fetchClasses();
    }, [user.name]);

    const renderContent = () => {
        switch (activeTab) {
            case 'students': return <StudentManager showToast={showToast} />;
            case 'faculty': return <FacultyManager showToast={showToast} />;
            case 'timetable': return <TimetableManager showToast={showToast} />;
            case 'subjects': return <SubjectsManager facultyList={allFaculty} showToast={showToast} />;
            case 'infrastructure': return <InfrastructureManager showToast={showToast} />;
            case 'attendance': return <AttendanceManager showToast={showToast} />;
            case 'notices': return <CommunicationCenter user={user} showToast={showToast} />;
            default: return <HodOverview onNavigate={setActiveTab} user={user} totalFaculty={allFaculty.length} />;
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
                        <div className="user-avatar" style={{ background: '#3b82f6' }} title={user.name}>{user.name ? user.name.charAt(0) : 'H'}</div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name || 'HOD'}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Head of Dept</div>
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
                        style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                    </button>
                    <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>HOD Dashboard</span>
                </header>

                <section>
                    <h2>Existing Classes</h2>
                    {existingClasses.length > 0 ? (
                        <ul>
                            {existingClasses.map(cls => (
                                <li key={cls.id}>{cls.subject} - {cls.students.length} students</li>
                            ))}
                        </ul>
                    ) : (
                        <p>No existing classes.</p>
                    )}
                </section>

                <section>
                    <h2>Upcoming Classes</h2>
                    {upcomingClasses.length > 0 ? (
                        <ul>
                            {upcomingClasses.map(cls => (
                                <li key={cls.id}>{cls.subject} - {cls.students.length} students</li>
                            ))}
                        </ul>
                    ) : (
                        <p>No upcoming classes.</p>
                    )}
                </section>
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
                    borderLeft: `5px solid ${toast.type === 'success' ? '#10b981' : '#ef4444'}`
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
function HodOverview({ onNavigate, user }) {
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
                    <div className="stat-icon-wrapper" style={{ background: '#eff6ff', color: '#2563eb' }}><Icons.GradCap /></div>
                    <div className="stat-content"><h5>Dept. Students</h5><h3>{stats.students}</h3><span className="stat-trend trend-up">Registered</span></div>
                </div>
                <div className="premium-stat-card">
                    <div className="stat-icon-wrapper" style={{ background: '#f5f3ff', color: '#7c3aed' }}><Icons.Building /></div>
                    <div className="stat-content"><h5>Infrastructure</h5><h3 onClick={() => onNavigate('infrastructure')} style={{ cursor: 'pointer' }}>Manage Rooms</h3><span className="stat-trend trend-neutral">Department Grid</span></div>
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
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '12px', borderLeft: `4px solid ${cls.type === 'Lab' ? '#3b82f6' : '#10b981'}` }}>
                                    <div>
                                        <div style={{ fontWeight: '700', color: '#0f172a' }}>{cls.subject}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{cls.semester} • {cls.room || 'TBD'}</div>
                                    </div>
                                    <div style={{ fontWeight: '600', color: '#334155' }}>{cls.time}</div>
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
                        <div className="stat-card-mini" onClick={() => onNavigate('timetable')} style={{ cursor: 'pointer', padding: '1rem', background: '#eff6ff', borderRadius: '12px', textAlign: 'center' }}>
                            <div style={{ color: '#2563eb', marginBottom: '0.5rem' }}><Icons.Calendar /></div>
                            <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>Manage Timetables</div>
                        </div>
                        <div className="stat-card-mini" onClick={() => onNavigate('faculty')} style={{ cursor: 'pointer', padding: '1rem', background: '#f5f3ff', borderRadius: '12px', textAlign: 'center' }}>
                            <div style={{ color: '#7c3aed', marginBottom: '0.5rem' }}><Icons.Users /></div>
                            <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>Faculty Workload</div>
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
    const [formData, setFormData] = useState({ rollNumber: '', name: '', year: '3', semester: '1', department: 'IT' });
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
                            <button className="btn-action primary" onClick={() => { setModalType('add'); setFormData({ rollNumber: '', name: '', year: '3', semester: '1', department: 'IT' }); setIsModalOpen(true); }}>+ Add Student</button>
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
                        <button className="btn-action primary" onClick={() => { setModalType('add'); setFormData({ sNo: faculty.length + 1, name: '', email: '', mobileNumber: '', designation: 'Assistant Professor', type: 'Regular', department: 'IT' }); setIsModalOpen(true); }}>+ Add Faculty</button>
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
                                                <div style={{ width: `${Math.min(work.percentage, 100)}%`, height: '100%', background: work.percentage > 100 ? '#ef4444' : '#3b82f6', transition: 'width 0.3s ease' }} />
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
function TimetableManager({ showToast }) {
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
    const [allFaculty, setAllFaculty] = useState([]);

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
    useEffect(() => { fetch(`${API_BASE_URL}/api/faculty`).then(res => res.json()).then(setAllFaculty).catch(console.error); }, []);

    const generateTimetable = async () => {
        setLoading(true)
        try {
            const res = await fetch(`${API_BASE_URL}/api/timetables/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ semester: selectedSemester, options: genOptions }) })
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
            wing: period.wing || ''
        });
        setShowBookingModal(true);
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
                    wing: details.wing,
                    semester: selectedSemester,
                    updateAll: details.updateAll, // Pass propagation flag
                    originalSubject: bookingSlot.currentSubject // Pass original subject for better propagation
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
                                                    {p.faculty && <div style={{ fontSize: '0.65rem', color: '#2563eb', fontWeight: '700' }}>{p.faculty} (M)</div>}
                                                    {p.wing && <div style={{ fontSize: '0.6rem', color: '#16a34a', fontWeight: 'bold', marginTop: '2px' }}>📍 {p.wing}</div>}
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
                        <BookingForm initialData={bookingSlot} facultyList={allFaculty} onSubmit={handleConfirmBooking} onCancel={() => setShowBookingModal(false)} />
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
                    <button className="btn-action primary" onClick={() => onSubmit({ subject, faculty: mainFaculty, assistants, wing, updateAll })}>Save</button>
                </div>
            </div>
        </div>
    );
}

function AttendanceManager() {
    const [selectedSec, setSelectedSec] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedRoom, setSelectedRoom] = useState('');
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState([]);
    const [attendanceData, setAttendanceData] = useState({}); // { studentId: 'Present' | 'Absent' }
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [user, setUser] = useState({});

    useEffect(() => {
        const u = JSON.parse(localStorage.getItem('user'));
        if (u) setUser(u);
    }, []);

    const loadStudents = async () => {
        if (!selectedSec) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/attendance/students?semester=${encodeURIComponent(selectedSec)}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setStudents(data);
                // Initialize all as Present by default
                const initial = {};
                data.forEach(s => {
                    initial[s._id] = 'Present';
                });
                setAttendanceData(initial);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = (studentId) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present'
        }));
    };

    const submitAttendance = async () => {
        if (!selectedSec || !selectedSubject || !selectedTime) {
            alert('Please fill all required fields');
            return;
        }
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
                semester: selectedSec,
                room: selectedRoom,
                facultyId: user?.id || user?._id,
                facultyName: user?.name,
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
                setSelectedSec('');
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
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', borderRadius: '16px' }}>
                <h3 style={{ marginTop: 0 }}>Mark Attendance (My Classes)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
                    <div>
                        <label className="input-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>Select Class</label>
                        <select className="search-input-premium" value={selectedSec} onChange={(e) => setSelectedSec(e.target.value)} style={{ width: '100%' }}>
                            <option value="">-- Choose Class --</option>
                            <option value="I-B.Tech I Sem">I Year - I Sem (B.Tech)</option>
                            <option value="I-B.Tech II Sem">I Year - II Sem (B.Tech)</option>
                            <option value="II-B.Tech I Sem">II Year - I Sem (B.Tech)</option>
                            <option value="II-B.Tech II Sem">II Year - II Sem (B.Tech)</option>
                            <option value="III-B.Tech I Sem">III Year - I Sem (B.Tech)</option>
                            <option value="III-B.Tech II Sem">III Year - II Sem (B.Tech)</option>
                            <option value="IV-B.Tech I Sem">IV Year - I Sem (B.Tech)</option>
                            <option value="IV-B.Tech II Sem">IV Year - II Sem (B.Tech)</option>
                            <optgroup label="M.Tech">
                                <option value="I-M.Tech I Sem">I Year - I Sem (M.Tech)</option>
                                <option value="I-M.Tech II Sem">I Year - II Sem (M.Tech)</option>
                                <option value="II-M.Tech I Sem">II Year - I Sem (M.Tech)</option>
                                <option value="II-M.Tech II Sem">II Year - II Sem (M.Tech)</option>
                            </optgroup>
                            <optgroup label="MCA">
                                <option value="I-MCA I Sem">I Year - I Sem (MCA)</option>
                                <option value="I-MCA II Sem">I Year - II Sem (MCA)</option>
                                <option value="II-MCA I Sem">II Year - I Sem (MCA)</option>
                                <option value="II-MCA II Sem">II Year - II Sem (MCA)</option>
                            </optgroup>
                        </select>
                    </div>
                    <div>
                        <label className="input-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>Subject</label>
                        <input
                            placeholder="e.g. Operating Systems"
                            className="search-input-premium"
                            value={selectedSubject}
                            onChange={e => setSelectedSubject(e.target.value)}
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div>
                        <label className="input-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>Period/Time</label>
                        <input
                            placeholder="e.g. 09:30-10:30"
                            className="search-input-premium"
                            value={selectedTime}
                            onChange={e => setSelectedTime(e.target.value)}
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div>
                        <label className="input-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>Date</label>
                        <input
                            type="date"
                            className="search-input-premium"
                            style={{ width: '100%' }}
                            value={attendanceDate}
                            onChange={e => setAttendanceDate(e.target.value)}
                        />
                    </div>
                    <button
                        className="btn-action primary"
                        onClick={loadStudents}
                        disabled={loading || !selectedSec}
                    >
                        {loading ? 'Processing...' : 'Load Students'}
                    </button>
                </div>
            </div>

            {students.length > 0 && (
                <div className="glass-table-container">
                    <div className="table-header-premium">
                        <h3>Attendance Sheet: {selectedSec}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button className="btn-action" style={{ background: '#dcfce7', color: '#166534', fontWeight: '600', border: '1px solid #bbf7d0' }} onClick={() => markAll('Present')}>✓ Mark All Present</button>
                            <button className="btn-action" style={{ background: '#fee2e2', color: '#991b1b', fontWeight: '600', border: '1px solid #fecaca' }} onClick={() => markAll('Absent')}>✗ Mark All Absent</button>
                            <div style={{ background: '#f8fafc', padding: '6px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.85rem', fontWeight: '600' }}>
                                <span style={{ marginRight: '1rem', color: '#16a34a' }}>Present: {presentCount}</span>
                                <span style={{ color: '#ef4444' }}>Absent: {absentCount}</span>
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
                        <tbody style={{ textAlign: 'center' }}>
                            {students.map(s => (
                                <tr key={s._id}>
                                    <td style={{ fontFamily: 'monospace', fontWeight: '600' }}>{s.rollNumber}</td>
                                    <td>{s.name}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div style={{ display: 'inline-flex', background: attendanceData[s._id] === 'Present' ? '#dcfce7' : '#fee2e2', borderRadius: '20px', padding: '4px', cursor: 'pointer', transition: 'all 0.3s ease', width: '80px', position: 'relative' }} onClick={() => toggleStatus(s._id)}>
                                            <div style={{ position: 'absolute', top: '4px', left: attendanceData[s._id] === 'Present' ? '44px' : '4px', width: '32px', height: '26px', background: attendanceData[s._id] === 'Present' ? '#22c55e' : '#ef4444', borderRadius: '16px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
                                            <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'space-between', padding: '0 10px', alignItems: 'center', height: '26px', fontSize: '0.85rem', fontWeight: '800', zIndex: 2, userSelect: 'none' }}>
                                                <span style={{ color: attendanceData[s._id] === 'Present' ? '#166534' : '#fff' }}>A</span>
                                                <span style={{ color: attendanceData[s._id] === 'Present' ? '#fff' : '#991b1b' }}>P</span>
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
                            {submitting ? 'Submitting...' : 'Submit Attendance'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}



function InfrastructureManager({ showToast }) {
    const [rooms, setRooms] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [addCount, setAddCount] = useState(1);
    const [filterDept, setFilterDept] = useState('IT');

    const fetchRooms = useCallback(async () => {
        const res = await fetch(`${API_BASE_URL}/api/rooms`);
        const data = await res.json();
        setRooms(data);
    }, []);

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
                name: type === 'Lab' ? `Lab ${existingLabCount + i + 1}` : `Room ${existingClassCount + i + 101}`,
                type: type,
                wing: type === 'Lab' ? 'LAB 1' : 'AB1',
                morningSession: 'Available',
                afternoonSession: 'Available',
                department: filterDept === 'All' ? 'IT' : filterDept
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
                        <select
                            value={filterDept}
                            onChange={e => setFilterDept(e.target.value)}
                            className="search-input-premium"
                            style={{ width: '150px', padding: '6px' }}
                        >
                            <option value="All">All Depts</option>
                            <option value="IT">IT</option>
                            <option value="CSE">CSE</option>
                            <option value="ECE">ECE</option>
                            <option value="MECH">MECH</option>
                            <option value="CIVIL">CIVIL</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <label style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold' }}>Count</label>
                            <input
                                type="number"
                                min="1"
                                max="20"
                                value={addCount}
                                onChange={e => setAddCount(e.target.value)}
                                className="modern-input"
                                style={{ width: '60px', padding: '6px', color: '#1e293b' }}
                            />
                        </div>
                        <button onClick={() => addRoomsBulk('Classroom')} className="btn-action primary" style={{ background: '#10b981' }}>+ Add Classes</button>
                        <button onClick={() => addRoomsBulk('Lab')} className="btn-action primary" style={{ background: '#3b82f6' }}>+ Add Labs</button>
                        <button onClick={saveRooms} className="btn-action primary" disabled={isSaving}>
                            {isSaving ? '⏳ Saving...' : '💾 Save Changes'}
                        </button>
                    </div>
                </div>
                <div style={{ padding: '1rem' }}>
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Name / Identifier</th>
                                <th style={{ width: '150px' }}>Type</th>
                                <th style={{ width: '200px' }}>Location / Block</th>
                                <th style={{ width: '150px' }}>Department</th>
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
                                            style={{ fontWeight: '700', width: '130px' }}
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
                                        {r.type === 'Classroom' ? (
                                            <select
                                                value={r.wing}
                                                onChange={e => handleRoomChange(r, 'wing', e.target.value)}
                                                className="modern-input"
                                                style={{ padding: '6px' }}
                                            >
                                                <option value="AB1">AB1</option>
                                                <option value="AB2">AB2</option>
                                                <option value="1ST YEAR">1ST YEAR</option>
                                                <option value="PHARAMCY BLOCK">PHARAMCY BLOCK</option>
                                            </select>
                                        ) : (
                                            <select
                                                value={r.wing}
                                                onChange={e => handleRoomChange(r, 'wing', e.target.value)}
                                                className="modern-input"
                                                style={{ padding: '6px' }}
                                            >
                                                <option value="LAB 1">LAB 1</option>
                                                <option value="LAB 2">LAB 2</option>
                                                <option value="LAB 3">LAB 3</option>
                                                <option value="LAB 4">LAB 4</option>
                                            </select>
                                        )}
                                    </td>
                                    <td>
                                        <select
                                            value={r.department || 'IT'}
                                            onChange={e => handleRoomChange(r, 'department', e.target.value)}
                                            className="modern-input"
                                            style={{ padding: '6px' }}
                                        >
                                            <option value="IT">IT</option>
                                            <option value="CSE">CSE</option>
                                            <option value="ECE">ECE</option>
                                            <option value="MECH">MECH</option>
                                            <option value="CIVIL">CIVIL</option>
                                        </select>
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
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                        No infrastructure data found. Add assets to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="glass-table-container" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>💡 Asset Strategy</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div style={{ background: '#fff', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h5 style={{ color: '#3b82f6', marginBottom: '0.5rem' }}>Laboratory Usage</h5>
                        <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.5' }}>
                            Labs can be tracked for separate FN and AN sessions. Use Lab 1 or Lab 2 for specialized equipment tracking.
                        </p>
                    </div>
                    <div style={{ background: '#fff', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h5 style={{ color: '#10b981', marginBottom: '0.5rem' }}>Classroom Blocks</h5>
                        <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.5' }}>
                            Assign classes to blocks like AB1, AB2 or Pharmacy for better department-wise organization.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}



export default HodDashboard;
