import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import API_BASE_URL from '../../config'
import '../../App.css'

// --- ICONS (Inline SVG for Premium Look) ---
const Icons = {
    Home: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    Users: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    GradCap: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>,
    Building: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M8 10h.01" /><path d="M16 10h.01" /><path d="M8 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M16 18h.01" /></svg>,
    Book: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>,
    Calendar: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
    LogOut: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
}

// --- MAIN HOD DASHBOARD ---
function HodDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [user, setUser] = useState({});

    useEffect(() => {
        const u = JSON.parse(localStorage.getItem('user'));
        if (u) setUser(u);
        setMobileMenuOpen(false); // Close menu on tab change
    }, [activeTab]);

    const renderContent = () => {
        switch (activeTab) {
            case 'students': return <StudentManager />;
            case 'faculty': return <FacultyManager />;
            case 'timetable': return <TimetableManager />;
            case 'subjects': return <SubjectsManager />;
            default: return <HodOverview onNavigate={setActiveTab} user={user} />;
        }
    };

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
                                navigate('/login', { replace: true });
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

                <div className="fade-in-up">
                    {renderContent()}
                </div>
            </main>
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

// --- OVERVIEW COMPONENT ---
function HodOverview({ onNavigate, user }) {
    const [stats, setStats] = useState({ students: 0, faculty: 0, alerts: 0 });

    useEffect(() => {
        Promise.all([
            fetch(`${API_BASE_URL}/api/students`).then(res => res.json()),
            fetch(`${API_BASE_URL}/api/faculty`).then(res => res.json())
        ]).then(([s, f]) => {
            // In real app, filter s & f by HOD Department if API doesn't do it
            // Assuming API returns all, and we display stats. 
            // Better to show "My Dept" counts, but for now Total counts or mocked "My Dept" logic
            // We'll use total counts for visual impact as per previous Dashboard
            setStats({
                students: Array.isArray(s) ? s.length : 0,
                faculty: Array.isArray(f) ? f.length : 0,
                alerts: 2
            });
        }).catch(console.error);
    }, []);

    return (
        <div>
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 className="title-gradient" style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>Welcome back, {user.name || 'HOD'} 👋</h1>
                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Manage your department's academics and resources efficiently.</p>
            </div>

            <div className="modern-stats-grid">
                <div className="premium-stat-card">
                    <div className="stat-icon-wrapper" style={{ background: '#eff6ff', color: '#2563eb' }}><Icons.GradCap /></div>
                    <div className="stat-content"><h5>Total Students</h5><h3>{stats.students}</h3><span className="stat-trend trend-up">Enrolled</span></div>
                </div>
                <div className="premium-stat-card">
                    <div className="stat-icon-wrapper" style={{ background: '#f3e8ff', color: '#9333ea' }}><Icons.Users /></div>
                    <div className="stat-content"><h5>Faculty Members</h5><h3>{stats.faculty}</h3><span className="stat-trend trend-neutral">Active</span></div>
                </div>
                <div className="premium-stat-card">
                    <div className="stat-icon-wrapper" style={{ background: '#fff7ed', color: '#ea580c' }}><Icons.Calendar /></div>
                    <div className="stat-content"><h5>Timetables</h5><h3>Active</h3><span className="stat-trend">Updated</span></div>
                </div>
            </div>

            <div className="grid-split" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <div className="premium-stat-card" onClick={() => onNavigate('timetable')} style={{ cursor: 'pointer', display: 'block', transition: 'transform 0.2s', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '10px', background: '#eff6ff', borderRadius: '10px', color: '#2563eb' }}><Icons.Calendar /></div>
                        <h3 style={{ margin: 0 }}>Timetable Manager</h3>
                    </div>
                    <p style={{ color: '#64748b' }}>Generate and manage weekly schedules for all years.</p>
                </div>
                <div className="premium-stat-card" onClick={() => onNavigate('subjects')} style={{ cursor: 'pointer', display: 'block', transition: 'transform 0.2s', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '10px', background: '#fff7ed', borderRadius: '10px', color: '#ea580c' }}><Icons.Book /></div>
                        <h3 style={{ margin: 0 }}>Curriculum</h3>
                    </div>
                    <p style={{ color: '#64748b' }}>Update subject lists, credits, and electives.</p>
                </div>
                <div className="premium-stat-card" onClick={() => onNavigate('students')} style={{ cursor: 'pointer', display: 'block', transition: 'transform 0.2s', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '10px', background: '#f0fdf4', borderRadius: '10px', color: '#16a34a' }}><Icons.GradCap /></div>
                        <h3 style={{ margin: 0 }}>Students</h3>
                    </div>
                    <p style={{ color: '#64748b' }}>Manage student directory and performance.</p>
                </div>
            </div>
        </div>
    );
}

// --- PLACEHOLDER COMPONENTS (To be filled) ---
function StudentManager() {
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
        await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
        setIsModalOpen(false); fetchStudents();
    };

    const confirmDelete = async () => {
        await fetch(`${API_BASE_URL}/api/students/${currentStudent._id}`, { method: 'DELETE' });
        setIsModalOpen(false); fetchStudents();
    };

    const handleBulkUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData(); formData.append('file', file);
        try {
            const res = await fetch(`${API_BASE_URL}/api/students/upload`, { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) { alert(data.message); fetchStudents(); }
            else alert('Error: ' + data.message);
        } catch (err) { alert('Upload failed'); }
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
                                            <button className="btn-action" onClick={() => { setModalType('edit'); setCurrentStudent(s); setFormData(s); setIsModalOpen(true); }}>Edit</button>
                                            <button className="btn-action" style={{ color: '#ef4444', borderColor: '#fee2e2' }} onClick={() => { setModalType('delete'); setCurrentStudent(s); setIsModalOpen(true); }}>Del</button>
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
function FacultyManager() {
    const [faculty, setFaculty] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('');
    const [currentFac, setCurrentFac] = useState(null);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/faculty`).then(res => res.json()).then(setFaculty).catch(console.error);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = modalType === 'add' ? `${API_BASE_URL}/api/faculty` : `${API_BASE_URL}/api/faculty/${currentFac._id}`;
        const method = modalType === 'add' ? 'POST' : 'PUT';
        await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
        setIsModalOpen(false); fetch(`${API_BASE_URL}/api/faculty`).then(res => res.json()).then(setFaculty);
    };

    const confirmDelete = async () => {
        await fetch(`${API_BASE_URL}/api/faculty/${currentFac._id}`, { method: 'DELETE' });
        setIsModalOpen(false); fetch(`${API_BASE_URL}/api/faculty`).then(res => res.json()).then(setFaculty);
    };

    const handleBulkUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData(); formData.append('file', file);
        try {
            const res = await fetch(`${API_BASE_URL}/api/faculty/upload`, { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) { alert(data.message); fetch(`${API_BASE_URL}/api/faculty`).then(res => res.json()).then(setFaculty); }
            else alert('Error: ' + data.message);
        } catch (err) { alert('Upload failed'); }
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
                        <thead><tr><th>Name</th><th>Designation</th><th>Mobile</th><th>Type</th><th>Action</th></tr></thead>
                        <tbody>
                            {faculty.map(f => (
                                <tr key={f._id}>
                                    <td style={{ fontWeight: '600' }}>{f.name}</td>
                                    <td>{f.designation}</td>
                                    <td>{f.mobileNumber}</td>
                                    <td><span className="badge-role">{f.type}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="btn-action" onClick={() => { setModalType('edit'); setCurrentFac(f); setFormData(f); setIsModalOpen(true); }}>Edit</button>
                                            <button className="btn-action" style={{ color: '#ef4444' }} onClick={() => { setModalType('delete'); setCurrentFac(f); setIsModalOpen(true); }}>Del</button>
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
function TimetableManager() {
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
            const res = await fetch('/api/timetables/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ semester: selectedSemester, options: genOptions }) })
            const data = await res.json()
            if (res.ok) { alert(data.unallocated?.length > 0 ? `⚠️ Warnings:\n${data.unallocated.join('\n')}` : "✅ Success!"); fetchTimetable(); }
            else alert("Error: " + data.message)
        } catch (err) { alert("Failed to connect"); } finally { setLoading(false) }
    }

    const updateCell = (dayIndex, periodIndex) => {
        const day = timetable.schedule[dayIndex];
        const period = day.periods[periodIndex];
        setBookingSlot({ dayIndex, periodIndex, day: day.day, time: period.time, currentSubject: period.subject === '-' ? '' : period.subject, faculty: period.faculty || '', assistants: period.assistants || [] });
        setShowBookingModal(true);
    }

    const handleConfirmBooking = async (details) => {
        try {
            const res = await fetch('/api/timetables/update', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dayIndex: bookingSlot.dayIndex, periodIndex: bookingSlot.periodIndex, subject: details.subject || '-', faculty: details.faculty, assistants: details.assistants, semester: selectedSemester }) });
            if (res.ok) { alert('Slot Updated!'); setShowBookingModal(false); fetchTimetable(); }
            else alert('Error: ' + (await res.json()).message);
        } catch (e) { alert('Failed to update slot'); }
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
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn-action" onClick={() => setShowSettings(true)}>⚙️ Settings</button>
                            <button className="btn-action primary" onClick={generateTimetable} disabled={loading}>{loading ? 'Generating...' : '⚡ Auto-Generate'}</button>
                            {timetable && <button className="btn-action" style={{ color: 'red' }} onClick={async () => { if (confirm('Delete?')) { await fetch(`${API_BASE_URL}/api/timetables?semester=${encodeURIComponent(selectedSemester)}`, { method: 'DELETE' }); fetchTimetable(); } }}>🗑️</button>}
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
                                                    {p.faculty && <div style={{ fontSize: '0.7rem', color: '#3b82f6' }}>{p.faculty}</div>}
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
            function SubjectsManager() {
    const [viewMode, setViewMode] = useState('list');
            const [subjects, setSubjects] = useState([]);
            const [regulation, setRegulation] = useState('R23');
            const [activeCourse, setActiveCourse] = useState('B.Tech');
            const [courseName, setCourseName] = useState('B.Tech');
            const [semesterName, setSemesterName] = useState('I-B.Tech I Sem');
            const [editRows, setEditRows] = useState([]);
            const [isUploading, setIsUploading] = useState(false);

    const fetchSubjects = useCallback(() => {fetch(`${API_BASE_URL}/api/subjects?t=${Date.now()}`).then(res => res.json()).then(setSubjects).catch(console.error); }, []);
    useEffect(() => {fetchSubjects(); }, [fetchSubjects]);

    useEffect(() => {
        const current = subjects.filter(s => s.semester === semesterName);
        if (current.length > 0) setEditRows(current.map(s => ({...s})));
            else setEditRows([{sNo: 1, category: 'PC', courseCode: '', courseName: '', L: '', T: '', P: '', credits: '', semester: semesterName }]);
    }, [subjects, semesterName]);

    const handleSubjectChange = (index, field, value) => { const newRows = [...editRows]; newRows[index] = {...newRows[index], [field]: value }; setEditRows(newRows); }
    const addSubjectRow = () => setEditRows([...editRows, {sNo: editRows.length + 1, category: 'PC', semester: semesterName }]);
    const saveSubjects = async () => {
        const validRows = editRows.filter(r => r.courseName);
            if (validRows.length === 0) return alert("Please fill at least one subject");
            const res = await fetch(`${API_BASE_URL}/api/courses/save`, {method: 'POST', headers: {'Content-Type': 'application/json' }, body: JSON.stringify({regulation, activeCourse, courseName, department: 'IT', subjects: validRows.map(r => ({...r, semester: semesterName })) }) });
            if ((await res.json()).success) {alert('Saved!'); fetchSubjects(); }
    }

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
            if (!file) return;
            setIsUploading(true);
            const formData = new FormData(); formData.append('file', file);
            try {
            const res = await fetch(`${API_BASE_URL}/api/courses/preview`, {method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) {
                setEditRows(data.subjects.map((s, i) => ({ sNo: s.sNo || i + 1, category: s.category || 'PC', courseCode: s.courseCode || '', courseName: s.courseName || '', L: s.L || 0, T: s.T || 0, P: s.P || 0, credits: s.credits || 0, semester: semesterName })));
            alert('✅ Syllabus Parsed! Please review and save.');
            } else alert('❌ Failed to parse: ' + data.message);
        } catch (err) {alert('Error uploading file'); } finally {setIsUploading(false); e.target.value = null; }
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
                            <button className="btn-action primary" onClick={saveSubjects}>💾 Save</button>
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
                                <tr key={i}>
                                    <td><input value={row.sNo || ''} onChange={e => handleSubjectChange(i, 'sNo', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none' }} /></td>
                                    <td>
                                        <select value={row.category || 'PC'} onChange={e => handleSubjectChange(i, 'category', e.target.value)} style={{ background: 'transparent', border: 'none' }}>
                                            <option value="PC">PC</option><option value="BS">BS</option><option value="ES">ES</option><option value="MC">MC</option>
                                        </select>
                                    </td>
                                    <td><input value={row.courseCode || ''} onChange={e => handleSubjectChange(i, 'courseCode', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none' }} /></td>
                                    <td><input value={row.courseName || ''} onChange={e => handleSubjectChange(i, 'courseName', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none' }} /></td>
                                    <td><input value={row.L || ''} onChange={e => handleSubjectChange(i, 'L', e.target.value)} style={{ width: '30px', background: 'transparent', border: 'none', textAlign: 'center' }} /></td>
                                    <td><input value={row.T || ''} onChange={e => handleSubjectChange(i, 'T', e.target.value)} style={{ width: '30px', background: 'transparent', border: 'none', textAlign: 'center' }} /></td>
                                    <td><input value={row.P || ''} onChange={e => handleSubjectChange(i, 'P', e.target.value)} style={{ width: '30px', background: 'transparent', border: 'none', textAlign: 'center' }} /></td>
                                    <td><input value={row.credits || ''} onChange={e => handleSubjectChange(i, 'credits', e.target.value)} style={{ width: '30px', background: 'transparent', border: 'none', textAlign: 'center', fontWeight: 'bold' }} /></td>
                                    <td><button onClick={() => setEditRows(editRows.filter((_, idx) => idx !== i))} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button onClick={addSubjectRow} style={{ width: '100%', padding: '10px', marginTop: '10px', border: '1px dashed #cbd5e1', borderRadius: '8px', color: '#64748b', cursor: 'pointer', background: 'transparent' }}>+ Add Row</button>
                </div>
            </div>
            );
}
            function BookingForm({initialData, facultyList, onSubmit, onCancel}) {
    const [subject, setSubject] = useState(initialData.currentSubject);
            const [mainFaculty, setMainFaculty] = useState(initialData.faculty);
            const [assistants, setAssistants] = useState(initialData.assistants || []);
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
                    <input className="search-input-premium" value={subject} onChange={e => setSubject(e.target.value)} />
                </div>
                <div>
                    <label style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem', display: 'block' }}>Main Faculty</label>
                    <select className="search-input-premium" value={mainFaculty} onChange={e => setMainFaculty(e.target.value)}>
                        <option value="">-- Select --</option>
                        <optgroup label="Regular">{renderOpts(regularFaculty)}</optgroup>
                        <optgroup label="Contract">{renderOpts(contractFaculty)}</optgroup>
                    </select>
                </div>
                {isLab && (
                    <div>
                        <label style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem', display: 'block' }}>Assistants (Hold Ctrl)</label>
                        <select multiple className="search-input-premium" style={{ height: '100px' }} value={assistants} onChange={handleAssistantChange}>
                            <optgroup label="Contract (Recommended)">{renderOpts(contractFaculty)}</optgroup>
                            <optgroup label="Regular">{renderOpts(regularFaculty)}</optgroup>
                        </select>
                    </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                    <button className="btn-action" onClick={onCancel}>Cancel</button>
                    <button className="btn-action primary" onClick={() => onSubmit({ subject, faculty: mainFaculty, assistants })}>Save</button>
                </div>
            </div>
            );
}

            export default HodDashboard;
