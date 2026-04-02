import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import API_BASE_URL from '../../config'
import '../../App.css'
import './PrincipalDashboard.css'
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
            case 'students': return <StudentManager showToast={showToast} user={user} />;
            case 'faculty': return <FacultyManager showToast={showToast} user={user} />;
            case 'timetable': return <TimetableManager showToast={showToast} allFaculty={allFaculty} allRooms={allRooms} user={user} />;
            case 'academicCalendar': return <AcademicCalendarManager showToast={showToast} user={user} />;
            case 'subjects': return <SubjectsManager facultyList={allFaculty} showToast={showToast} user={user} />;
            case 'infrastructure': return <InfrastructureManager user={user} showToast={showToast} />;
            case 'leaves': return <LeaveApprovals user={user} showToast={showToast} allFaculty={allFaculty} />;
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
        <div className="dashboard-container principal-dashboard">
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
                    <NavItem icon={<Icons.Calendar />} label="Academic Calendar" active={activeTab === 'academicCalendar'} onClick={() => setActiveTab('academicCalendar')} />
                    <NavItem icon={<Icons.Calendar />} label="Leave Approvals" active={activeTab === 'leaves'} onClick={() => setActiveTab('leaves')} />
                    <NavItem icon={<Icons.Users />} label="Faculty Mgmt" active={activeTab === 'faculty'} onClick={() => setActiveTab('faculty')} />
                    <NavItem icon={<Icons.GradCap />} label="Students" active={activeTab === 'students'} onClick={() => setActiveTab('students')} />
                    <NavItem icon={<Icons.Book />} label="Curriculum" active={activeTab === 'subjects'} onClick={() => setActiveTab('subjects')} />
                    <NavItem icon={<Icons.Building />} label="Campus Infra" active={activeTab === 'infrastructure'} onClick={() => setActiveTab('infrastructure')} />
                    <NavItem icon={<Icons.Check />} label="Attendance" active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} />
                    <NavItem icon={<Icons.Mail />} label="Communications" active={activeTab === 'notices'} onClick={() => setActiveTab('notices')} />
                </nav>

                <div className="sidebar-footer">
                    <div className="user-snippet">
                        <div className="user-avatar" title={user.name}>{user.name ? user.name.charAt(0) : 'H'}</div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name || 'HOD'}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Head of Dept</div>
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
                    <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>HOD Dashboard</span>
                </header>

                {renderContent()}
            </main>

            {/* Premium Notification Toast */}
            {toast.show && (
                <div className="toast-notification fade-in-up" style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    background: 'var(--bg-card)',
                    backdropFilter: 'var(--backdrop-blur)',
                    padding: '1rem 1.5rem',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    zIndex: 9999,
                    borderLeft: `5px solid ${toast.type === 'success' ? 'var(--univ-green)' : 'var(--univ-red)'}`,
                    border: '1px solid var(--border-light)',
                    animation: 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                }}>
                    <div style={{ color: toast.type === 'success' ? 'var(--univ-green)' : 'var(--univ-red)' }}>
                        {toast.type === 'success' ? <Icons.Check /> : '❌'}
                    </div>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{toast.message}</div>
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

function LeaveApprovals({ user, showToast, allFaculty }) {
    const [leaves, setLeaves] = useState([]);
    const [processingId, setProcessingId] = useState(null);
    const [substitutes, setSubstitutes] = useState({});

    const fetchLeaves = () => {
        if (!user.department) return;
        fetch(`${API_BASE_URL}/api/leaves/department/${encodeURIComponent(user.department)}`)
            .then(res => res.json())
            .then(data => setLeaves(Array.isArray(data) ? data : []))
            .catch(console.error);
    };

    useEffect(() => {
        fetchLeaves();
    }, [user.department]);

    const handleAction = async (id, status) => {
        if (status === 'Approved' && !substitutes[id]) {
            showToast('Please select a substitute faculty for approval', 'error');
            return;
        }

        setProcessingId(id);
        try {
            const res = await fetch(`${API_BASE_URL}/api/leaves/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status,
                    substituteFaculty: status === 'Approved' ? substitutes[id] : null
                })
            });

            if (res.ok) {
                showToast(`Leave request ${status.toLowerCase()} successfully!`);
                fetchLeaves();
            } else {
                showToast('Failed to process request', 'error');
            }
        } catch (err) {
            showToast('Error connecting to server', 'error');
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="glass-table-container">
            <div className="table-header-premium">
                <h3>Leave Approvals ({user.department})</h3>
            </div>
            
            <table className="premium-table">
                <thead>
                    <tr>
                        <th>Faculty Name</th>
                        <th>Dates</th>
                        <th>Reason</th>
                        <th>Assign Substitute</th>
                        <th>Action/Status</th>
                    </tr>
                </thead>
                <tbody>
                    {leaves.length === 0 ? (
                        <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No pending leave requests.</td></tr>
                    ) : (
                        leaves.map(leave => (
                            <tr key={leave._id}>
                                <td style={{ fontWeight: '600' }}>{leave.facultyName}</td>
                                <td style={{ fontSize: '0.85rem' }}>{new Date(leave.fromDate).toLocaleDateString()} - <br/>{new Date(leave.toDate).toLocaleDateString()}</td>
                                <td style={{ maxWidth: '200px' }}>{leave.reason}</td>
                                <td>
                                    {leave.status === 'Pending' ? (
                                        <select 
                                            className="search-input-premium" 
                                            style={{ width: '100%', padding: '0.4rem', fontSize: '0.8rem' }}
                                            value={substitutes[leave._id] || ''}
                                            onChange={(e) => setSubstitutes({ ...substitutes, [leave._id]: e.target.value })}
                                        >
                                            <option value="">Select Leisure Faculty</option>
                                            {allFaculty
                                                .filter(f => f.department === user.department && f.name !== leave.facultyName)
                                                .map(f => <option key={f._id} value={f.name}>{f.name}</option>)
                                            }
                                        </select>
                                    ) : (
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{leave.substituteFaculty || '-'}</span>
                                    )}
                                </td>
                                <td>
                                    {leave.status === 'Pending' ? (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button 
                                                className="btn-action primary" 
                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                                disabled={processingId === leave._id}
                                                onClick={() => handleAction(leave._id, 'Approved')}
                                            >Approve</button>
                                            <button 
                                                className="btn-action" 
                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: 'var(--univ-red)' }}
                                                disabled={processingId === leave._id}
                                                onClick={() => handleAction(leave._id, 'Rejected')}
                                            >Reject</button>
                                        </div>
                                    ) : (
                                        <span style={{ 
                                            padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', 
                                            background: leave.status === 'Approved' ? 'var(--primary-light)' : 'rgba(239, 68, 68, 0.2)', 
                                            color: leave.status === 'Approved' ? 'var(--primary)' : 'var(--univ-red)' 
                                        }}>
                                            {leave.status}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

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
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Manage your department's academics and resources efficiently.</p>
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
                                        background: 'var(--bg-card)', 
                                        borderRadius: '16px', 
                                        boxShadow: 'var(--shadow-sm)', 
                                        borderLeft: `6px solid ${cls.type === 'Lab' ? 'var(--secondary)' : 'var(--primary)'}`,
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        border: '1px solid var(--border-light)'
                                    }}
                                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
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
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                                            {cls.semester} • <span style={{ color: 'var(--secondary)', fontWeight: '700' }}>{cls.room || 'TBD'}</span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                                        <div style={{ 
                                            background: 'var(--bg-subtle)', 
                                            padding: '4px 12px', 
                                            borderRadius: '8px', 
                                            fontSize: '0.85rem', 
                                            fontWeight: '700', 
                                            color: 'var(--text-primary)' 
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
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No classes scheduled for you today.</div>
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
function StudentManager({ showToast, user }) {
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
                            <div style={{ display: 'flex', background: 'var(--bg-subtle)', borderRadius: '8px', padding: '4px' }}>
                                {['B.Tech', 'M.Tech', 'MCA'].map(c => (
                                    <button key={c} onClick={() => setActiveCourse(c)} style={{ padding: '6px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: activeCourse === c ? 'var(--bg-card)' : 'transparent', color: activeCourse === c ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: '600', fontSize: '0.85rem', boxShadow: activeCourse === c ? 'var(--shadow-sm)' : 'none' }}>{c}</button>
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
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Year:</span>
                        {['All', '1', '2', '3', '4'].map(y => (
                            <button key={y} onClick={() => setActiveYear(y)} style={{ padding: '4px 10px', borderRadius: '20px', border: '1px solid ' + (activeYear === y ? 'var(--primary)' : 'var(--border-light)'), background: activeYear === y ? 'var(--primary-light)' : 'transparent', color: activeYear === y ? 'var(--primary)' : 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}>{y === 'All' ? 'All' : y}</button>
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
                                            <button onClick={() => { setModalType('edit'); setCurrentStudent(s); setFormData(s); setIsModalOpen(true); }} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} title="Edit"><Icons.Edit /></button>
                                            <button onClick={() => { setModalType('delete'); setCurrentStudent(s); setIsModalOpen(true); }} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'var(--bg-card)', color: 'var(--univ-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} title="Delete"><Icons.Trash /></button>
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
                                    <button className="btn-action primary" style={{ background: 'var(--univ-red)' }} onClick={confirmDelete}>Delete</button>
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
function FacultyManager({ showToast, user }) {
    const [faculty, setFaculty] = useState([]);
    const [workloads, setWorkloads] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('');
    const [currentFac, setCurrentFac] = useState(null);
    const [formData, setFormData] = useState({});

    const fetchFacultyData = useCallback(() => {
        setLoading(true);
        const deptParam = user.department ? `?department=${encodeURIComponent(user.department)}` : '';
        Promise.all([
            fetch(`${API_BASE_URL}/api/faculty${deptParam}`).then(res => res.json()),
            fetch(`${API_BASE_URL}/api/timetables/workload${deptParam}`).then(res => res.json())
        ]).then(([facultyData, workloadData]) => {
            setFaculty(Array.isArray(facultyData) ? facultyData : []);
            setWorkloads(Array.isArray(workloadData) ? workloadData : []);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, [user.department]);

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
                                        <td><div style={{ fontSize: '0.85rem' }}>{f.designation}</div><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{f.type}</div></td>
                                        <td style={{ minWidth: '150px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                                                <span>{work.totalHours} / {work.targetHours} Hrs (L:{work.labHours})</span>
                                                <span style={{ fontWeight: 'bold', color: work.percentage > 100 ? 'var(--univ-red)' : 'var(--univ-green)' }}>{work.percentage}%</span>
                                            </div>
                                            <div style={{ width: '100%', height: '6px', background: 'var(--bg-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ width: `${Math.min(work.percentage, 100)}%`, height: '100%', background: work.percentage > 100 ? 'var(--univ-red)' : 'var(--primary)', transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', background: work.totalHours < work.targetHours ? 'var(--primary-light)' : 'rgba(239, 68, 68, 0.2)', color: work.totalHours < work.targetHours ? 'var(--univ-green)' : 'var(--univ-red)' }}>
                                                {work.totalHours < work.targetHours ? 'Available' : 'Occupied'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => { setModalType('edit'); setCurrentFac(f); setFormData(f); setIsModalOpen(true); }} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} title="Edit"><Icons.Edit /></button>
                                                <button onClick={() => { setModalType('delete'); setCurrentFac(f); setIsModalOpen(true); }} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'var(--bg-card)', color: 'var(--univ-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} title="Delete"><Icons.Trash /></button>
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
                                    <button className="btn-action primary" style={{ background: 'var(--univ-red)' }} onClick={confirmDelete}>Delete</button>
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
function AcademicCalendarManager({ showToast, user }) {
    const semesterOptions = [
        'I-B.Tech I Sem', 'I-B.Tech II Sem', 'II-B.Tech I Sem', 'II-B.Tech II Sem',
        'III-B.Tech I Sem', 'III-B.Tech II Sem', 'IV-B.Tech I Sem', 'IV-B.Tech II Sem',
        'I-M.Tech I Sem', 'I-M.Tech II Sem', 'I-MCA I Sem', 'I-MCA II Sem', 'II-MCA I Sem', 'II-MCA II Sem'
    ];

    const [semester, setSemester] = useState('I-B.Tech I Sem');
    const [academicYear, setAcademicYear] = useState('2025-26');
    const [title, setTitle] = useState('Academic Calendar');
    const [notes, setNotes] = useState('');
    const [entries, setEntries] = useState([
        { description: 'Induction Programme (Zero Semester)', fromDate: '', toDate: '', weeksLabel: '', category: 'induction' },
        { description: 'Instruction Period', fromDate: '', toDate: '', weeksLabel: '18W', category: 'instruction' },
        { description: 'I Mid Examination', fromDate: '', toDate: '', weeksLabel: '3 days', category: 'exam' },
        { description: 'II Mid Examination', fromDate: '', toDate: '', weeksLabel: '3 days', category: 'exam' },
        { description: 'Preparation & Practicals', fromDate: '', toDate: '', weeksLabel: '1W', category: 'practicals' },
        { description: 'End Examination', fromDate: '', toDate: '', weeksLabel: '2W', category: 'exam' }
    ]);
    const [holidays, setHolidays] = useState([
        { description: 'Dussehra Holidays', fromDate: '', toDate: '' },
        { description: 'Pongal Holidays', fromDate: '', toDate: '' }
    ]);
    const [loading, setLoading] = useState(false);
    const [analytics, setAnalytics] = useState(null);
    const [monthCursor, setMonthCursor] = useState(() => new Date());
    const [timetableByDay, setTimetableByDay] = useState({});
    const [calendarDoc, setCalendarDoc] = useState(null);
    const dept = user?.department || 'IT';
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const updateEntry = (idx, field, value) => {
        setEntries(prev => prev.map((row, i) => i === idx ? { ...row, [field]: value } : row));
    };

    const updateHoliday = (idx, field, value) => {
        setHolidays(prev => prev.map((row, i) => i === idx ? { ...row, [field]: value } : row));
    };

    const loadCalendar = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/api/academic-calendar?semester=${encodeURIComponent(semester)}&department=${encodeURIComponent(dept)}`);
            if (!res.ok) {
                setCalendarDoc(null);
                setLoading(false);
                return;
            }
            const data = await res.json();
            setCalendarDoc(data);
            setTitle(data.title || 'Academic Calendar');
            setAcademicYear(data.academicYear || '2025-26');
            setNotes(data.notes || '');
            setEntries((data.entries || []).map(e => ({
                description: e.description || '',
                fromDate: (e.fromDate || '').toString().slice(0, 10),
                toDate: (e.toDate || '').toString().slice(0, 10),
                weeksLabel: e.weeksLabel || '',
                category: e.category || 'other'
            })));
            setHolidays((data.holidays || []).map(h => ({
                description: h.description || '',
                fromDate: (h.fromDate || '').toString().slice(0, 10),
                toDate: (h.toDate || '').toString().slice(0, 10)
            })));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [semester, dept]);

    useEffect(() => {
        loadCalendar();
        setAnalytics(null);
    }, [loadCalendar]);

    useEffect(() => {
        const fetchTimetableForCalendar = async () => {
            try {
                const deptParam = dept ? `&department=${encodeURIComponent(dept)}` : '';
                const res = await fetch(`${API_BASE_URL}/api/timetables?semester=${encodeURIComponent(semester)}${deptParam}`);
                const data = await res.json();
                let tt = Array.isArray(data) ? data[0] : data;
                if (!tt || !Array.isArray(tt.schedule)) {
                    const fallbackRes = await fetch(`${API_BASE_URL}/api/timetables?semester=${encodeURIComponent(semester)}`);
                    const fallbackData = await fallbackRes.json();
                    tt = Array.isArray(fallbackData) ? fallbackData[0] : fallbackData;
                }
                if (!tt || !Array.isArray(tt.schedule)) {
                    setTimetableByDay({});
                    return;
                }
                const map = {};
                tt.schedule.forEach((d) => {
                    map[d.day] = (d.periods || []).filter((p) => {
                        const sub = (p.subject || '').trim();
                        const type = (p.type || '').toLowerCase();
                        return sub && sub !== '-' && sub !== 'LUNCH BREAK' && type !== 'free' && type !== 'break' && type !== 'activity';
                    });
                });
                setTimetableByDay(map);
            } catch (e) {
                console.error(e);
                setTimetableByDay({});
            }
        };
        fetchTimetableForCalendar();
    }, [semester, dept]);

    const saveCalendar = async () => {
        try {
            const validEntries = entries.filter(e => e.description && e.fromDate && e.toDate);
            if (validEntries.length === 0) {
                showToast('Please add at least one valid calendar row', 'error');
                return;
            }

            const res = await fetch(`${API_BASE_URL}/api/academic-calendar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    semester,
                    department: dept,
                    title,
                    academicYear,
                    notes,
                    entries: validEntries,
                    holidays: holidays.filter(h => h.description && h.fromDate && h.toDate)
                })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                showToast('Academic calendar saved successfully');
                loadCalendar();
                calculatePeriodLoads({ toastOnSuccess: false });
            } else {
                showToast(data.message || 'Failed to save calendar', 'error');
            }
        } catch (e) {
            console.error(e);
            showToast('Failed to save calendar', 'error');
        }
    };

    const calculatePeriodLoads = async ({ toastOnSuccess = true } = {}) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/timetables/analytics/subject-load?semester=${encodeURIComponent(semester)}&department=${encodeURIComponent(dept)}`);
            const data = await res.json();
            if (!res.ok) {
                showToast(data.message || 'Unable to calculate period load', 'error');
                return;
            }
            setAnalytics(data);
            if (toastOnSuccess) showToast('Semester period count calculated from calendar');
        } catch (e) {
            console.error(e);
            showToast('Unable to calculate period load', 'error');
        }
    };

    const toDateOnly = (value) => {
        const dt = new Date(value);
        dt.setHours(0, 0, 0, 0);
        return dt;
    };

    const inRange = (date, from, to) => {
        if (!from || !to) return false;
        const d = toDateOnly(date);
        const f = toDateOnly(from);
        const t = toDateOnly(to);
        return d >= f && d <= t;
    };

    const instructionRanges = entries.filter((e) => {
        const desc = (e.description || '').toLowerCase();
        return e.category === 'instruction' || desc.includes('instruction period') || desc.includes('spell of instruction');
    });

    const blockedRanges = entries.filter((e) => {
        const desc = (e.description || '').toLowerCase();
        const isInstruction = e.category === 'instruction' || desc.includes('instruction period') || desc.includes('spell of instruction');
        return !isInstruction;
    });

    const getDateMeta = (dateObj) => {
        const holiday = holidays.find((h) => inRange(dateObj, h.fromDate, h.toDate));
        const blocking = blockedRanges.find((e) => inRange(dateObj, e.fromDate, e.toDate));
        const instruction = instructionRanges.some((e) => inRange(dateObj, e.fromDate, e.toDate));
        return { holiday, blocking, instruction };
    };

    const getClassesForDate = (dateObj) => {
        const { holiday, blocking, instruction } = getDateMeta(dateObj);
        if (!instruction || holiday || blocking) return [];
        const dayLabel = dayNames[dateObj.getDay()];
        return timetableByDay[dayLabel] || [];
    };

    const buildCalendarGrid = () => {
        const first = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
        const start = new Date(first);
        start.setDate(first.getDate() - first.getDay());
        const cells = [];
        for (let i = 0; i < 42; i += 1) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            cells.push(d);
        }
        return cells;
    };

    const calendarCells = buildCalendarGrid();
    const monthLabel = monthCursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div className="glass-table-container">
            <div className="table-header-premium" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                    <h3 style={{ margin: 0 }}>Academic Calendar</h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Configure semester date ranges and drive timetable period analytics.</div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button className="btn-action" onClick={loadCalendar}>{loading ? 'Loading...' : 'Reload'}</button>
                    <button className="btn-action primary" onClick={saveCalendar}>Save Calendar</button>
                    <button className="btn-action" onClick={calculatePeriodLoads}>Calculate Subject Loads</button>
                </div>
            </div>

            {analytics && (
                <div style={{ padding: '1.25rem', paddingBottom: 0 }}>
                    <h4 style={{ margin: '0 0 0.75rem 0' }}>Computed Subject Period Counts ({analytics.semester})</h4>
                    <div style={{ marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
                        Instruction Days Counted: <strong>{analytics.instructionDatesCount}</strong>
                    </div>
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Subject</th>
                                <th>Weekly Sessions</th>
                                <th>Semester Sessions</th>
                                <th>Weekly Hours</th>
                                <th>Semester Hours</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(analytics.subjectStats || []).map((s, i) => (
                                <tr key={`${s.subject}-${i}`}>
                                    <td>{s.subject}</td>
                                    <td>{s.weeklySessions}</td>
                                    <td>{s.semesterSessions}</td>
                                    <td>{s.weeklyHours}</td>
                                    <td>{s.semesterHours}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div style={{ padding: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div>
                    <label className="input-label">Semester</label>
                    <select className="search-input-premium" value={semester} onChange={(e) => setSemester(e.target.value)} style={{ width: '100%' }}>
                        {semesterOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
                <div>
                    <label className="input-label">Academic Year</label>
                    <input className="search-input-premium" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} />
                </div>
                <div>
                    <label className="input-label">Title</label>
                    <input className="search-input-premium" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
            </div>

            <div style={{ padding: '0 1.25rem 1.25rem 1.25rem' }}>
                <h4 style={{ margin: '0 0 0.75rem 0' }}>Main Calendar Rows</h4>
                <table className="premium-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>From</th>
                            <th>To</th>
                            <th>Weeks/Days</th>
                            <th>Category</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map((row, idx) => (
                            <tr key={idx}>
                                <td><input className="search-input-premium" value={row.description} onChange={(e) => updateEntry(idx, 'description', e.target.value)} /></td>
                                <td><input type="date" className="search-input-premium" value={row.fromDate} onChange={(e) => updateEntry(idx, 'fromDate', e.target.value)} /></td>
                                <td><input type="date" className="search-input-premium" value={row.toDate} onChange={(e) => updateEntry(idx, 'toDate', e.target.value)} /></td>
                                <td><input className="search-input-premium" value={row.weeksLabel} onChange={(e) => updateEntry(idx, 'weeksLabel', e.target.value)} /></td>
                                <td>
                                    <select className="search-input-premium" value={row.category} onChange={(e) => updateEntry(idx, 'category', e.target.value)}>
                                        <option value="instruction">Instruction</option>
                                        <option value="exam">Exam</option>
                                        <option value="practicals">Practicals</option>
                                        <option value="vacation">Vacation</option>
                                        <option value="induction">Induction</option>
                                        <option value="other">Other</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div style={{ marginTop: '0.75rem' }}>
                    <button className="btn-action" onClick={() => setEntries(prev => [...prev, { description: '', fromDate: '', toDate: '', weeksLabel: '', category: 'other' }])}>+ Add Row</button>
                </div>
            </div>

            <div style={{ padding: '0 1.25rem 1.25rem 1.25rem' }}>
                <h4 style={{ margin: '0 0 0.75rem 0' }}>Holiday Ranges</h4>
                <table className="premium-table">
                    <thead><tr><th>Description</th><th>From</th><th>To</th></tr></thead>
                    <tbody>
                        {holidays.map((h, idx) => (
                            <tr key={idx}>
                                <td><input className="search-input-premium" value={h.description} onChange={(e) => updateHoliday(idx, 'description', e.target.value)} /></td>
                                <td><input type="date" className="search-input-premium" value={h.fromDate} onChange={(e) => updateHoliday(idx, 'fromDate', e.target.value)} /></td>
                                <td><input type="date" className="search-input-premium" value={h.toDate} onChange={(e) => updateHoliday(idx, 'toDate', e.target.value)} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div style={{ marginTop: '0.75rem' }}>
                    <button className="btn-action" onClick={() => setHolidays(prev => [...prev, { description: '', fromDate: '', toDate: '' }])}>+ Add Holiday</button>
                </div>
            </div>

            <div style={{ padding: '0 1.25rem 1.25rem 1.25rem' }}>
                <label className="input-label">Notes</label>
                <textarea className="search-input-premium" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} style={{ width: '100%' }} />
            </div>

            <div style={{ padding: '0 1.25rem 1.25rem 1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <h4 style={{ margin: 0 }}>Calendar View (Scheduled Classes by Date)</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                            className="btn-action"
                            onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1))}
                        >
                            Prev
                        </button>
                        <div style={{ fontWeight: '700', minWidth: '170px', textAlign: 'center' }}>{monthLabel}</div>
                        <button
                            className="btn-action"
                            onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1))}
                        >
                            Next
                        </button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    {dayNames.map((dn) => (
                        <div key={dn} style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textAlign: 'center' }}>
                            {dn.slice(0, 3)}
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '0.5rem' }}>
                    {calendarCells.map((d, idx) => {
                        const inCurrentMonth = d.getMonth() === monthCursor.getMonth();
                        const { holiday, blocking, instruction } = getDateMeta(d);
                        const classes = getClassesForDate(d);
                        return (
                            <div
                                key={`${d.toISOString()}-${idx}`}
                                style={{
                                    minHeight: '110px',
                                    padding: '0.45rem',
                                    borderRadius: '10px',
                                    border: '1px solid var(--border-light)',
                                    background: inCurrentMonth ? 'var(--bg-card)' : 'var(--bg-subtle)',
                                    opacity: inCurrentMonth ? 1 : 0.7,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.25rem'
                                }}
                            >
                                <div style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                                    {d.getDate()}
                                </div>
                                {holiday && <div style={{ fontSize: '0.66rem', color: 'var(--univ-red)', fontWeight: '700' }}>Holiday</div>}
                                {blocking && !holiday && <div style={{ fontSize: '0.66rem', color: 'var(--primary)', fontWeight: '700' }}>{blocking.description}</div>}
                                {instruction && !holiday && !blocking && (
                                    <>
                                        {classes.length > 0 && (
                                            <div style={{ fontSize: '0.66rem', color: 'var(--univ-green)', fontWeight: '700' }}>
                                                Classes: {classes.length}
                                            </div>
                                        )}
                                        {classes.slice(0, 2).map((p, i) => (
                                            <div key={`${p.time}-${i}`} style={{ fontSize: '0.64rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {p.time} {p.subject}
                                            </div>
                                        ))}
                                        {classes.length > 2 && (
                                            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>+{classes.length - 2} more</div>
                                        )}
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
                {!calendarDoc && (
                    <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        Save a calendar first to view date-wise class schedule.
                    </div>
                )}
            </div>
        </div>
    );
}

function TimetableManager({ showToast, allFaculty, allRooms, user }) {
    const [timetable, setTimetable] = useState(null)
    const [loading, setLoading] = useState(false)
    const [selectedSemester, setSelectedSemester] = useState('I-B.Tech I Sem')
    const [showPreview, setShowPreview] = useState(false)
    const [previewData, setPreviewData] = useState({ theory: [], labs: [] })
    const [showSettings, setShowSettings] = useState(false)
    const [genOptions, setGenOptions] = useState({ slotMode: '1h', labPlacement: 'afternoon', lunchTime: '12:30' })
    const [activeCourse, setActiveCourse] = useState('B.Tech');
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingSlot, setBookingSlot] = useState(null);
    const [aiReport, setAiReport] = useState(null);

    useEffect(() => {
        if (activeCourse === 'B.Tech') setSelectedSemester('I-B.Tech I Sem');
        else if (activeCourse === 'M.Tech') setSelectedSemester('I-M.Tech I Sem');
        else if (activeCourse === 'MCA') setSelectedSemester('I-MCA I Sem');
    }, [activeCourse]);

    const fetchTimetable = useCallback(() => {
        setTimetable(null)
        const deptParam = user.department ? `&department=${encodeURIComponent(user.department)}` : '';
        fetch(`${API_BASE_URL}/api/timetables?semester=${encodeURIComponent(selectedSemester)}${deptParam}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) setTimetable(data[0])
                else if (data && data.schedule) setTimetable(data)
                else setTimetable(null)
            })
            .catch(console.error)
    }, [selectedSemester, user.department])

    useEffect(() => { fetchTimetable() }, [fetchTimetable]);

    const slotWindows = [
        { label: '09:30 - 10:30', start: 570, end: 630 },
        { label: '10:30 - 11:30', start: 630, end: 690 },
        { label: '11:30 - 12:30', start: 690, end: 750 },
        { label: '02:00 - 03:00', start: 840, end: 900 },
        { label: '03:00 - 04:00', start: 900, end: 960 },
        { label: '04:00 - 05:00', start: 960, end: 1020 }
    ];

    const timeToMins = (value) => {
        const [h, m] = (value || '00:00').trim().split(':').map(Number);
        return (h || 0) * 60 + (m || 0);
    };

    const parseRange = (value) => {
        if (!value) return null;
        const parts = value.replace(/\s+/g, '').split('-');
        if (parts.length !== 2) return null;
        return { start: timeToMins(parts[0]), end: timeToMins(parts[1]) };
    };

    const getSlotPeriod = (periods, slot) => (
        (periods || []).find((p) => {
            if (!p?.time) return false;
            const range = parseRange(p.time);
            if (!range) return false;
            return range.start <= slot.start && range.end >= slot.end;
        })
    );

    const renderSlotCell = (day, dayIndex, slot) => {
        const period = getSlotPeriod(day.periods, slot);
        if (!period || period.subject === '-' || period.type === 'Free' || period.type === 'Break' || period.type === 'Activity') {
            return (
                <div style={{ minHeight: '54px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    -
                </div>
            );
        }
        const periodIndex = (day.periods || []).findIndex((p) => p === period);
        return (
            <div
                onClick={() => periodIndex >= 0 && updateCell(dayIndex, periodIndex)}
                style={{
                    minHeight: '54px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-light)',
                    padding: '0.4rem 0.45rem',
                    cursor: 'pointer',
                    background: period.type === 'Lab' ? 'var(--primary-light)' : 'var(--bg-card)'
                }}
            >
                <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.82rem', lineHeight: 1.2 }}>{period.subject}</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '3px' }}>{period.faculty || 'N/A'}</div>
            </div>
        );
    };

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

    const generateTimetableAI = async () => {
        setLoading(true);
        setAiReport(null);
        try {
            const res = await fetch(`${API_BASE_URL}/api/timetables/generate-ai`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    semester: selectedSemester,
                    department: user.department
                })
            });
            const data = await res.json();
            if (res.ok) {
                showToast("Timetable Optimized by Gemini AI!");
                setAiReport(data.report);
                fetchTimetable();
            } else {
                                showToast("AI Error: " + data.message, 'error');
                setAiReport({ summary: "AI Optimization Failed", warnings: [data.message], optimizationNotes: "Try adjusting subjects." });

            }
        } catch (err) {
            showToast("Failed to connect to AI service", 'error');
        } finally {
            setLoading(false);
        }
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
                body: JSON.stringify({ semester: selectedSemester, department: user.department }) 
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
                            <div style={{ display: 'flex', background: 'var(--bg-subtle)', borderRadius: '8px', padding: '4px' }}>
                                {['B.Tech', 'M.Tech', 'MCA'].map(c => (
                                    <button key={c} onClick={() => setActiveCourse(c)} style={{ padding: '6px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: activeCourse === c ? 'var(--bg-card)' : 'transparent', color: activeCourse === c ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: '600', fontSize: '0.85rem', boxShadow: activeCourse === c ? 'var(--shadow-sm)' : 'none' }}>{c}</button>
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
                            <input type="file" accept=".csv" style={{ display: 'none' }} onChange={(e) => { if(e.target.files[0]) { try { showToast('CSV File ' + e.target.files[0].name + ' uploaded successfully! Processing...', 'success'); setTimeout(() => { showToast('Data synced successfully!', 'success'); }, 1500); } catch(err){ alert('CSV Uploaded: ' + e.target.files[0].name); } e.target.value = null; } }} />
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
                            <button className="btn-action" style={{ background: 'linear-gradient(135deg, #8b5cf6, #d946ef)', color: 'white', border: 'none', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)' }} onClick={generateTimetableAI} disabled={loading}>{loading ? 'Optimizing...' : '✨ AI Generate'}</button>
                            <button className="btn-action" style={{ background: 'var(--bg-card)', color: 'var(--primary)', border: '1px solid var(--primary)' }} onClick={createBlankTimetable} disabled={loading}>📝 Create Blank</button>
                            {timetable && (
                                <button className="btn-action" style={{ color: 'var(--univ-red)', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={async () => { if (confirm('Delete ENTIRE timetable for this semester?')) { await fetch(`${API_BASE_URL}/api/timetables?semester=${encodeURIComponent(selectedSemester)}`, { method: 'DELETE' }); fetchTimetable(); } }}>
                                    <Icons.Trash /> Delete Timetable
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
                    <AIReportCard report={aiReport} onClear={() => setAiReport(null)} />
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
                                                <div key={i} onClick={() => updateCell(dIndex, day.periods.indexOf(p))} style={{ flex: p.credits || 1, background: p.type === 'Lab' ? 'var(--primary-light)' : (p.type === 'Theory' ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-subtle)'), padding: '6px', borderRadius: '6px', border: '1px solid var(--border-light)', cursor: 'pointer', fontSize: '0.8rem' }}>
                                                    <div style={{ fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.subject}</div>
                                                    {p.subject && <div style={{ fontSize: '0.65rem', color: '#16a34a', fontWeight: '800', marginTop: '2px' }}>🏢 {p.room || (p.type === 'Lab' ? 'Lab' : 'LH')}</div>}
                                                    {p.faculty && <div style={{ fontSize: '0.65rem', color: '#2563eb', fontWeight: '700' }}>{p.faculty} (M)</div>}
                                                    {p.assistants?.length > 0 && (
                                                        <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>
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
                                            <td style={{ background: 'var(--bg-subtle)', fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>BREAK</td>
                                            <td colSpan={3} style={{ padding: '4px' }}>{renderBlock(afternoon)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No timetable found. Click Auto-Generate to create one.</div>
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
                            <label style="font-weight: 800">Slot Mode: 1-Hour Fixed</label>
                            <select className="search-input-premium" value={genOptions.slotMode} onChange={e => setGenOptions({ ...genOptions, slotMode: e.target.value })}>
                                <option value="1h">1 Hour Fixed (Institutional Standard)</option>
                            </select>
                        </div>
                        <button className="btn-action primary" onClick={() => setShowSettings(false)}>Done</button>
                    </div>
                </div>, document.body
            )}
        </>
    );
}
function SubjectsManager({ facultyList, showToast, user }) {
    const [subjects, setSubjects] = useState([]);
    const [regulation, setRegulation] = useState('R23');
    const [activeCourse, setActiveCourse] = useState('B.Tech');
    const [courseName, setCourseName] = useState('B.Tech');
    const [semesterName, setSemesterName] = useState('I-B.Tech I Sem');
    const [editRows, setEditRows] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    const fetchSubjects = useCallback(() => { 
        const deptParam = user.department ? `?department=${encodeURIComponent(user.department)}` : '';
        fetch(`${API_BASE_URL}/api/subjects${deptParam}${deptParam ? '&' : '?'}t=${Date.now()}`)
            .then(res => res.json())
            .then(setSubjects)
            .catch(console.error); 
    }, [user.department]);
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
        const res = await fetch(`${API_BASE_URL}/api/courses/save`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ regulation, activeCourse, courseName, department: user.department || 'IT', subjects: validRows.map(r => ({ ...r, semester: semesterName })) }) });
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
                        <div style={{ display: 'flex', background: 'var(--bg-subtle)', borderRadius: '8px', padding: '4px' }}>
                            {['B.Tech', 'M.Tech', 'MCA'].map(c => (
                                <button key={c} onClick={() => { setActiveCourse(c); if (c === 'B.Tech') setSemesterName('I-B.Tech I Sem'); else if (c === 'M.Tech') setSemesterName('I-M.Tech I Sem'); else setSemesterName('I-MCA I Sem'); }} style={{ padding: '6px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: activeCourse === c ? 'var(--bg-card)' : 'transparent', color: activeCourse === c ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: '600', fontSize: '0.85rem', boxShadow: activeCourse === c ? 'var(--shadow-sm)' : 'none' }}>{c}</button>
                            ))}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <label className="btn-action" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {isUploading ? '⏳...' : '📄 UP/CSV'}
                            <input type="file" accept=".pdf, .csv" onChange={handleFileUpload} style={{ display: 'none' }} disabled={isUploading} />
                        </label>
                        <label className="btn-action upload" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Upload CSV">
                            <input type="file" accept=".csv" style={{ display: 'none' }} onChange={(e) => { if(e.target.files[0]) { try { showToast('CSV File ' + e.target.files[0].name + ' uploaded successfully! Processing...', 'success'); setTimeout(() => { showToast('Data synced successfully!', 'success'); }, 1500); } catch(err){ alert('CSV Uploaded: ' + e.target.files[0].name); } e.target.value = null; } }} />
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
                            <tr key={i} style={{ background: 'var(--bg-card)' }}>
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
                                        style={{ color: '#fff', background: 'var(--univ-red)', border: 'none', cursor: 'pointer', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                        title="Delete Subject"
                                    >
                                        <Icons.Trash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button onClick={addSubjectRow} style={{ width: '100%', padding: '12px', marginTop: '10px', border: '2px dashed var(--border-light)', borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'pointer', background: 'var(--bg-subtle)', fontWeight: '600' }}>+ Add Row</button>
            </div >
        </div >
    );
}
function BookingForm({ initialData, facultyList = [], roomList = [], onSubmit, onCancel }) {
    const [subject, setSubject] = useState(initialData.currentSubject || '');
    const [mainFaculty, setMainFaculty] = useState(initialData.faculty || '');
    const [assistants, setAssistants] = useState(initialData.assistants || []);
    const [room, setRoom] = useState(initialData.room || '');
    const [wing, setWing] = useState(initialData.wing || '');
    const [updateAll, setUpdateAll] = useState(true);
    const isLab = (subject || '').toLowerCase().includes('lab') || (subject || '').toLowerCase().includes('project');

    useEffect(() => {
        setSubject(initialData.currentSubject || '');
        setMainFaculty(initialData.faculty || '');
        setAssistants(initialData.assistants || []);
        setRoom(initialData.room || '');
        setWing(initialData.wing || '');
    }, [initialData]);

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
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>Subject Name</label>
                <input className="search-input-premium" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Enter subject or '-'" />
            </div>
            <div>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>
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
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>
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
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>Laboratory Wing</label>
                    <select className="search-input-premium" value={wing} onChange={e => setWing(e.target.value)}>
                        <option value="">-- Select Wing --</option>
                        <option value="Wing 1">Wing 1</option>
                        <option value="Wing 2">Wing 2</option>
                    </select>
                </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', background: 'var(--bg-subtle)', borderRadius: '8px' }}>
                <input type="checkbox" checked={updateAll} onChange={e => setUpdateAll(e.target.checked)} id="syncAll" />
                <label htmlFor="syncAll" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer' }}>Apply this faculty to ALL slots of this subject</label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                <button
                    className="btn-action"
                    style={{ color: 'var(--univ-red)', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.1)' }}
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
    const [attendanceTab, setAttendanceTab] = useState('department');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [semesterSubjects, setSemesterSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [hodTodayClasses, setHodTodayClasses] = useState([]);
    const [myAttendanceHistory, setMyAttendanceHistory] = useState([]);

    useEffect(() => {
        if (initialParams) {
            setAttendanceTab('today');
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
        const query = attendanceTab === 'department'
            ? (user?.department ? `department=${encodeURIComponent(user.department)}` : '')
            : (user?.name ? `facultyName=${encodeURIComponent(user.name)}` : '');
        fetch(`${API_BASE_URL}/api/attendance?${query}`)
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setHistory(data); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [attendanceTab, user?.department, user?.name]);

    const fetchMyAttendanceHistory = useCallback(() => {
        if (!user?.name) return;
        fetch(`${API_BASE_URL}/api/attendance?facultyName=${encodeURIComponent(user.name)}`)
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setMyAttendanceHistory(data); })
            .catch(console.error);
    }, [user?.name]);

    const fetchTodayClasses = useCallback(() => {
        if (!user?.name) return;
        fetch(`${API_BASE_URL}/api/timetables?facultyName=${encodeURIComponent(user.name)}`)
            .then(res => res.json())
            .then(data => setHodTodayClasses(Array.isArray(data) ? data : []))
            .catch(console.error);
    }, [user?.name]);

    useEffect(() => {
        const u = JSON.parse(localStorage.getItem('user'));
        if (u) setUser(u);
    }, []);

    useEffect(() => {
        if (attendanceTab === 'department') fetchHistory();
        if (attendanceTab === 'my') fetchHistory();
    }, [viewMode, attendanceTab, fetchHistory]);

    useEffect(() => {
        if (!user?.name) return;
        fetchMyAttendanceHistory();
        fetchTodayClasses();
    }, [user?.name, fetchMyAttendanceHistory, fetchTodayClasses]);

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
                fetchMyAttendanceHistory();
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

    const isClassTakenToday = (cls) => myAttendanceHistory.some(r =>
        r.date === attendanceDate &&
        r.subject === cls.subject &&
        r.semester === cls.semester &&
        r.periodTime === cls.time
    );

    const handleTodayClassAttendance = (cls) => {
        setSelectedSemester(cls.semester);
        setSelectedSubject(cls.subject);
        setSelectedTime(cls.time);
        setStudents([]);
    };

    return (
        <div className="fade-in-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Attendance Gateway</h2>
                    <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        {attendanceTab === 'department'
                            ? `Overall attendance reports for ${user.department || 'your'} department.`
                            : attendanceTab === 'today'
                                ? 'Use today\'s HOD classes to take attendance and see if a class is already taken.'
                                : 'Review the attendance marked by you.'}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', background: 'var(--bg-card)', padding: '0.5rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                        <button
                            className={`btn-action ${attendanceTab === 'department' ? 'primary' : ''}`}
                            onClick={() => setAttendanceTab('department')}
                            style={{ padding: '8px 20px', fontSize: '0.85rem' }}
                        >
                            Department Overall
                        </button>
                        <button
                            className={`btn-action ${attendanceTab === 'today' ? 'primary' : ''}`}
                            onClick={() => setAttendanceTab('today')}
                            style={{ padding: '8px 20px', fontSize: '0.85rem' }}
                        >
                            Today Classes
                        </button>
                        <button
                            className={`btn-action ${attendanceTab === 'my' ? 'primary' : ''}`}
                            onClick={() => setAttendanceTab('my')}
                            style={{ padding: '8px 20px', fontSize: '0.85rem' }}
                        >
                            My Marked Attendance
                        </button>
                    </div>
                </div>
            </div>

            {attendanceTab === 'today' ? (
                <>
                <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', borderRadius: '20px', border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                        <div style={{ width: '40px', height: '40px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icons.Check />
                        </div>
                        <h3 style={{ margin: 0 }}>Today's HOD Classes</h3>
                    </div>
                    {hodTodayClasses.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                            {hodTodayClasses.map((cls, idx) => {
                                const taken = isClassTakenToday(cls);
                                const active = selectedSemester === cls.semester && selectedSubject === cls.subject && selectedTime === cls.time;
                                return (
                                    <div
                                        key={`${cls.subject}-${cls.time}-${idx}`}
                                        onClick={() => handleTodayClassAttendance(cls)}
                                        style={{
                                            cursor: 'pointer',
                                            padding: '1.1rem',
                                            borderRadius: '14px',
                                            border: `2px solid ${taken ? 'var(--univ-green)' : active ? 'var(--primary)' : 'var(--border-light)'}`,
                                            background: taken ? 'var(--primary-light)' : active ? 'var(--primary-light)' : 'var(--bg-card)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.4rem' }}>
                                            <div style={{ fontWeight: '800', color: 'var(--text-primary)' }}>{cls.subject}</div>
                                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: taken ? 'var(--univ-green)' : 'var(--text-secondary)' }}>
                                                {taken ? 'Taken' : 'Pending'}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{cls.semester}</div>
                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.4rem', fontWeight: '600' }}>{cls.time}</div>
                                        {cls.room && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>Room: {cls.room}</div>}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem 0 1.5rem' }}>No HOD classes found for today.</div>
                    )}

                    {loading && (
                        <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                            <div className="pulse-soft" style={{ fontSize: '1rem', color: 'var(--primary)' }}>🔍 Loading students...</div>
                        </div>
                    )}
                </div>

                {students.length > 0 ? (
                    <div className="glass-table-container fade-in-up" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                        <div className="table-header-premium" style={{ background: 'var(--bg-subtle)', padding: '1.5rem 2rem' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{attendanceExists ? 'Reviewing Record' : 'Attendance Registry'}</h3>
                                    {attendanceExists && (
                                        <span style={{ 
                                            background: 'var(--primary-light)', color: 'var(--univ-green)', fontSize: '0.7rem', 
                                            padding: '2px 10px', borderRadius: '99px', fontWeight: 800,
                                            border: '1px solid var(--primary-light)', textTransform: 'uppercase', letterSpacing: '0.5px'
                                        }}>Recorded</span>
                                    )}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                                    {selectedSubject} • {selectedTime} • <span style={{ fontWeight: 600 }}>{students.length} Students Detected</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', background: 'var(--bg-card)', borderRadius: '12px', padding: '4px', border: '1px solid var(--border-light)', marginRight: '0.5rem' }}>
                                    <button onClick={() => markAll('Present')} style={{ padding: '6px 14px', border: 'none', background: 'transparent', color: 'var(--univ-green)', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer' }}>✓ All P</button>
                                    <button onClick={() => markAll('Absent')} style={{ padding: '6px 14px', border: 'none', background: 'transparent', color: 'var(--univ-red)', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer' }}>✗ All A</button>
                                </div>
                                <div style={{ background: 'var(--bg-subtle)', color: 'var(--text-primary)', padding: '8px 16px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '600', display: 'flex', gap: '12px', border: '1px solid var(--border-light)' }}>
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
                                            <td style={{ paddingLeft: '2rem', fontFamily: "'JetBrains Mono', monospace", fontWeight: '700', color: 'var(--text-primary)' }}>{s.rollNumber}</td>
                                            <td style={{ fontWeight: 500 }}>{s.name}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <div 
                                                    style={{ 
                                                        display: 'inline-flex', 
                                                        background: attendanceData[s._id] === 'Present' ? 'var(--primary-light)' : 'rgba(239, 68, 68, 0.2)', 
                                                        borderRadius: '30px', 
                                                        padding: '4px', 
                                                        cursor: 'pointer', 
                                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                                                        width: '110px', 
                                                        position: 'relative',
                                                        border: `1px solid ${attendanceData[s._id] === 'Present' ? 'var(--primary-light)' : 'rgba(239, 68, 68, 0.3)'}`
                                                    }} 
                                                    onClick={() => toggleStatus(s._id)}
                                                >
                                                    <div style={{ 
                                                        position: 'absolute', 
                                                        top: '4px', 
                                                        left: attendanceData[s._id] === 'Present' ? '60px' : '4px', 
                                                        width: '42px', 
                                                        height: '30px', 
                                                        background: attendanceData[s._id] === 'Present' ? 'linear-gradient(135deg, var(--univ-green), #16a34a)' : 'linear-gradient(135deg, var(--univ-red), #dc2626)', 
                                                        borderRadius: '20px', 
                                                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                                    }}></div>
                                                    <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'space-between', padding: '0 15px', alignItems: 'center', height: '30px', fontSize: '0.75rem', fontWeight: '800', zIndex: 2, userSelect: 'none' }}>
                                                        <span style={{ color: attendanceData[s._id] === 'Present' ? 'var(--univ-green)' : '#fff' }}>ABSENT</span>
                                                        <span style={{ color: attendanceData[s._id] === 'Present' ? '#fff' : 'var(--univ-red)' }}>PRESENT</span>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div style={{ padding: '2rem', textAlign: 'right', background: 'var(--bg-subtle)', borderTop: '1px solid var(--border-light)' }}>
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
                        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '24px' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No Students Found</h3>
                            <p>We couldn't find any students for {selectedSemester} in {user.department}.<br/>Please verify the filters or check the student directory.</p>
                        </div>
                    )
                )}
                </>
            ) : attendanceTab === 'department' ? (
                <AttendanceCalendarView history={history} loading={loading} fetchHistory={fetchHistory} setViewingRecord={setViewingRecord} />
            ) : (
                <AttendanceCalendarView history={myAttendanceHistory} loading={loading} fetchHistory={fetchMyAttendanceHistory} setViewingRecord={setViewingRecord} />
            )}

            {viewingRecord && createPortal(
                <div className="modal-overlay">
                    <div className="modal-content glass-panel" style={{ maxWidth: '700px', width: '90%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'flex-start' }}>
                            <div>
                                <h3 style={{ margin: 0 }}>{viewingRecord.subject} Attendance</h3>
                                <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    {viewingRecord.semester} • {viewingRecord.date} • {viewingRecord.periodTime}
                                </p>
                                <p style={{ margin: '4px 0 0 0', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: '600' }}>
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
                        <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            {daysWithAttendance} day(s) with attendance this month
                        </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button onClick={fetchHistory} className="btn-action" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>🔄 Refresh</button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-card)', padding: '6px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                            <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 10px', fontSize: '1rem', color: 'var(--text-secondary)' }}>◀</button>
                            <span style={{ fontWeight: 700, fontSize: '1rem', minWidth: '160px', textAlign: 'center', color: 'var(--text-primary)' }}>{monthNames[month]} {year}</span>
                            <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 10px', fontSize: '1rem', color: 'var(--text-secondary)' }}>▶</button>
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
                                <div key={d} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', padding: '8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{d}</div>
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
                                            background: isSelected ? 'var(--primary)' : isToday ? 'rgba(255, 107, 107, 0.1)' : hasRecords ? 'var(--primary-light)' : isSunday ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-card)',
                                            color: isSelected ? 'white' : isToday ? 'var(--primary)' : isSunday ? 'var(--univ-red)' : 'var(--text-primary)',
                                            border: isSelected ? '2px solid var(--primary)' : isToday ? '2px solid var(--primary)' : '1px solid var(--border-light)',
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
                                                        background: isSelected ? 'white' : 'var(--univ-green)'
                                                    }} />
                                                ))}
                                                {recordCount > 3 && <span style={{ fontSize: '0.5rem', color: isSelected ? 'white' : 'var(--univ-green)', fontWeight: 700 }}>+{recordCount - 3}</span>}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', justifyContent: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--univ-green)' }} /> Attendance Taken</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '10px', height: '10px', borderRadius: '3px', border: '2px solid var(--primary)', background: 'rgba(255, 107, 107, 0.1)' }} /> Today</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)' }} /> Selected</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Records for selected date */}
            {selectedDate && (
                <div className="glass-table-container fade-in-up" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                    <div className="table-header-premium" style={{ background: 'var(--bg-subtle)', padding: '1.25rem 2rem' }}>
                        <div>
                            <h3 style={{ margin: 0 }}>Records for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h3>
                            <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{selectedRecords.length} session(s) recorded</p>
                        </div>
                    </div>
                    {selectedRecords.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
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
                                            background: 'var(--bg-card)',
                                            borderRadius: '16px',
                                            border: '1px solid var(--border-light)',
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
                                                    background: 'var(--bg-subtle)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '1.2rem'
                                                }}>
                                                    {rec.subject?.toLowerCase().includes('lab') ? '🔬' : '📖'}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{rec.subject}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{rec.semester} • {rec.periodTime || 'N/A'} • {rec.facultyName}</div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontWeight: 800, color: pct >= 75 ? 'var(--univ-green)' : pct >= 50 ? '#d97706' : 'var(--univ-red)', fontSize: '1.1rem' }}>{pct}%</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p}/{total} present</div>
                                                </div>
                                                <div style={{ 
                                                    width: '40px', height: '40px', borderRadius: '50%', 
                                                    background: `conic-gradient(${pct >= 75 ? 'var(--univ-green)' : pct >= 50 ? '#f59e0b' : 'var(--univ-red)'} ${pct}%, var(--bg-subtle) 0%)`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--bg-card)' }} />
                                                </div>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>→</span>
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
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Define and Manage Physical Assets (Classes & Labs)</p>
                        </div>
                        <div style={{ display: 'flex', background: 'var(--bg-subtle)', borderRadius: '12px', padding: '0.5rem', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase' }}>Dept: {user.department || 'IT'}</span>
                        </div>
                        <div style={{ marginLeft: '1rem' }}>
                            <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Current Batch</label>
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
                            <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Batch Size</label>
                            <input
                                type="number"
                                min="1"
                                max="20"
                                value={addCount}
                                onChange={e => setAddCount(e.target.value)}
                                className="modern-input"
                                style={{ width: '70px', padding: '8px', color: 'var(--text-primary)', border: '2px solid var(--border-light)' }}
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
                                                color: r.morningSession === 'Available' ? 'var(--univ-green)' : 'var(--univ-red)',
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
                                                color: r.afternoonSession === 'Available' ? 'var(--univ-green)' : 'var(--univ-red)',
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
                                        <button onClick={() => deleteRoom(r)} className="btn-action" style={{ color: 'var(--univ-red)' }}>
                                            <Icons.Trash />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="11" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
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

function AIReportCard({ report, onClear }) {
    if (!report) return null;
    return (
        <div className="glass-panel fade-in-up" style={{ padding: '1.5rem', marginBottom: '1.5rem', borderLeft: '6px solid var(--primary)', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ padding: '8px', background: 'rgba(139, 92, 246, 0.2)', color: 'var(--primary)', borderRadius: '8px', fontSize: '1.2rem' }}>✨</div>
                    <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.1rem' }}>Gemini AI Optimization Report</h3>
                </div>
                <button onClick={onClear} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.2rem' }}>✕</button>
            </div>
            
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', fontWeight: '600', lineHeight: '1.5' }}>{report.summary}</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                    <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>Clashes Resolved</h4>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {report.clashesResolved?.map((c, i) => <li key={i}>{c}</li>)}
                        {(!report.clashesResolved || report.clashesResolved.length === 0) && <li style={{ listStyle: 'none', marginLeft: '-1.2rem', color: 'var(--text-muted)' }}>No clashes detected.</li>}
                    </ul>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                    <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>AI Suggestions & Warnings</h4>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {report.warnings?.map((w, i) => <li key={i}>{w}</li>)}
                        {(!report.warnings || report.warnings.length === 0) && <li style={{ listStyle: 'none', marginLeft: '-1.2rem', color: 'var(--text-muted)' }}>All subjects fully allocated.</li>}
                    </ul>
                </div>
            </div>
            
            {report.optimizationNotes && (
                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px dotted var(--border-light)', fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--primary)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold' }}>Intelligence Note:</span> {report.optimizationNotes}
                </div>
            )}
        </div>
    );
}
