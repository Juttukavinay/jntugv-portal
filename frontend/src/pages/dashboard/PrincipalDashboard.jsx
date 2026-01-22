import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API_BASE_URL from '../../config'
import '../../App.css'

// --- ICONS (Inline SVG for Premium Feel) ---
const Icons = {
    Home: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    Users: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    GradCap: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>,
    Building: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M8 10h.01" /><path d="M16 10h.01" /><path d="M8 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M16 18h.01" /></svg>,
    Book: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>,
    Calendar: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
    LogOut: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
}

// --- MAIN DASHBOARD COMPONENT ---
function PrincipalDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Close mobile menu when tab changes
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [activeTab]);

    const renderContent = () => {
        switch (activeTab) {
            case 'students': return <StudentDirectory />;
            case 'faculty': return <FacultyDirectory />;
            case 'subjects': return <CurriculumView />;
            case 'timetables': return <TimetableView />;
            case 'departments': return <DepartmentPanel />;
            default: return <DashboardOverview onNavigate={setActiveTab} />;
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
                        <div className="sidebar-role">Principal Portal</div>
                    </div>
                </div>

                <nav className="nav-menu">
                    <NavItem icon={<Icons.Home />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                    <NavItem icon={<Icons.GradCap />} label="Students" active={activeTab === 'students'} onClick={() => setActiveTab('students')} />
                    <NavItem icon={<Icons.Users />} label="Faculty" active={activeTab === 'faculty'} onClick={() => setActiveTab('faculty')} />
                    <NavItem icon={<Icons.Building />} label="Departments" active={activeTab === 'departments'} onClick={() => setActiveTab('departments')} />
                    <NavItem icon={<Icons.Book />} label="Curriculum" active={activeTab === 'subjects'} onClick={() => setActiveTab('subjects')} />
                    <NavItem icon={<Icons.Calendar />} label="Timetables" active={activeTab === 'timetables'} onClick={() => setActiveTab('timetables')} />
                </nav>

                <div className="sidebar-footer">
                    <div className="user-snippet">
                        <div className="user-avatar">P</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>Dr. Principal</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Administrator</div>
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
                <header className="mobile-header" style={{ display: 'none', marginBottom: '1rem', alignItems: 'center', gap: '1rem' }}>
                    {/* Add hamburger logic here for mobile if needed, usually global logic */}
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

// --- SUB-COMPONENTS ---

function DashboardOverview({ onNavigate }) {
    const [stats, setStats] = useState({ students: 0, faculty: 0, depts: 0 });

    useEffect(() => {
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
        });
    }, []);

    return (
        <div>
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 className="title-gradient" style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>Welcome back, Principal 👋</h1>
                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Here's what's happening in your campus today.</p>
            </div>

            <div className="modern-stats-grid">
                <PremiumStatCard
                    title="Total Students"
                    value={stats.students}
                    icon={<Icons.GradCap />}
                    color="blue"
                    trend="+12% this year"
                    trendType="up"
                />
                <PremiumStatCard
                    title="Faculty Members"
                    value={stats.faculty}
                    icon={<Icons.Users />}
                    color="purple"
                    trend="Full Capacity"
                    trendType="neutral"
                />
                <PremiumStatCard
                    title="Departments"
                    value={stats.depts}
                    icon={<Icons.Building />}
                    color="orange"
                    trend="Operating"
                    trendType="neutral"
                />
            </div>

            <div className="grid-split" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))', gap: '2rem' }}>
                <div className="premium-stat-card" style={{ display: 'block' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0 }}>HOD Management</h3>
                        <button className="btn-action primary" onClick={() => onNavigate('departments')}>Manage</button>
                    </div>
                    <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                        Review and assign Head of Departments for all academic branches. Ensure all departments have active leadership assigned.
                    </p>
                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div className="user-avatar" style={{ background: '#e2e8f0', color: '#64748b' }}>?</div>
                            <div>
                                <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>Pending Assignments</div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Check for unassigned departments</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="premium-stat-card" style={{ display: 'block' }}>
                    <h3 style={{ margin: '0 0 1rem 0' }}>Quick Actions</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <button className="btn-action" onClick={() => onNavigate('students')} style={{ height: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <Icons.GradCap /> Student Directory
                        </button>
                        <button className="btn-action" onClick={() => onNavigate('timetables')} style={{ height: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <Icons.Calendar /> View Timetables
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PremiumStatCard({ title, value, icon, color, trend, trendType }) {
    const bgColors = {
        blue: '#eff6ff',
        purple: '#f3e8ff',
        orange: '#fff7ed',
        green: '#f0fdf4'
    };
    const textColors = {
        blue: '#2563eb',
        purple: '#9333ea',
        orange: '#ea580c',
        green: '#16a34a'
    };

    return (
        <div className="premium-stat-card">
            <div className="stat-icon-wrapper" style={{ background: bgColors[color], color: textColors[color] }}>
                {icon}
            </div>
            <div className="stat-content">
                <h5>{title}</h5>
                <h3>{value}</h3>
                <span className={`stat-trend trend-${trendType}`}>{trend}</span>
            </div>
        </div>
    );
}

// --- DEPARTMENT MANAGER ---
function DepartmentPanel() {
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
                const saved = await res.json();
                setDepartments([...departments, saved].sort((a, b) => a.name.localeCompare(b.name)));
                setShowAddModal(false);
                setNewDeptName('');
            } else {
                alert('Failed to add department. It might already exist.');
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="glass-table-container">
            <div className="table-header-premium">
                <div>
                    <h3>Department Management</h3>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>Manage departments and assign leadership (HODs)</p>
                </div>
                <button className="btn-action primary" onClick={() => setShowAddModal(true)}>+ Add Department</button>
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
                            <td style={{ fontWeight: '600', color: '#0f172a' }}>{dept.name}</td>
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
                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: dept.hodName ? '#dcfce7' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                                            {dept.hodName ? '👤' : '?'}
                                        </div>
                                        {dept.hodName ? (
                                            <span style={{ fontWeight: '500', color: '#15803d' }}>{dept.hodName}</span>
                                        ) : (
                                            <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not Assigned</span>
                                        )}
                                    </div>
                                )}
                            </td>
                            <td>
                                {editingDept === dept.name ? (
                                    <button className="btn-action" onClick={() => setEditingDept(null)}>Cancel</button>
                                ) : (
                                    <button className="btn-action primary" onClick={() => setEditingDept(dept.name)}>
                                        {dept.hodName ? 'Reassign' : 'Assign HOD'}
                                    </button>
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
                            <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
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
function StudentDirectory() {
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
                const saved = await res.json();
                setStudents([...students, saved]);
                setShowModal(false);
            } else {
                alert('Failed to add student. Roll number might differ.');
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
                        <h3 style={{ margin: 0 }}>Student Directory</h3>
                        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '4px' }}>
                            {['B.Tech', 'M.Tech', 'MCA'].map(c => (
                                <button
                                    key={c}
                                    onClick={() => setActiveCourse(c)}
                                    style={{
                                        padding: '6px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                                        background: activeCourse === c ? '#fff' : 'transparent',
                                        color: activeCourse === c ? '#0f172a' : '#64748b',
                                        fontWeight: '600', fontSize: '0.85rem', boxShadow: activeCourse === c ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                                    }}
                                >{c}</button>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>Year:</span>
                        {['All', '1', '2', '3', '4'].map(y => (
                            <button
                                key={y}
                                onClick={() => setActiveYear(y)}
                                style={{
                                    padding: '4px 10px', borderRadius: '20px', border: '1px solid ' + (activeYear === y ? '#3b82f6' : '#e2e8f0'),
                                    background: activeYear === y ? '#eff6ff' : 'transparent',
                                    color: activeYear === y ? '#2563eb' : '#64748b',
                                    fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer'
                                }}
                            >
                                {y === 'All' ? 'All' : `${y}`}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <input
                            type="text"
                            placeholder="Search students..."
                            className="search-input-premium"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
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
                                <td style={{ fontFamily: 'monospace', fontWeight: '600' }}>{s.rollNumber}</td>
                                <td>{s.name}</td>
                                <td><span className="badge-role">{s.course} {s.year} Year</span> <span style={{ color: '#94a3b8' }}>/</span> {s.semester}</td>
                                <td>{s.department}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No students found.</td>
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
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
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
function FacultyDirectory() {
    const [faculty, setFaculty] = useState([]);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => { fetch(`${API_BASE_URL}/api/faculty`).then(res => res.json()).then(setFaculty); }, []);

    const handleAddFaculty = async (newFaculty) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/faculty`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newFaculty)
            });
            if (res.ok) {
                const saved = await res.json();
                setFaculty([...faculty, saved]);
                setShowModal(false);
            }
        } catch (error) {
            console.error("Failed to add faculty", error);
        }
    };

    return (
        <div className="glass-table-container">
            <div className="table-header-premium">
                <h3>Faculty Directory</h3>
                <button className="btn-action primary" onClick={() => setShowModal(true)}>+ Add Faculty</button>
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
                    </tr>
                </thead>
                <tbody>
                    {faculty.map(f => (
                        <tr key={f._id}>
                            <td style={{ fontWeight: '600' }}>{f.name}</td>
                            <td>{f.email}</td>
                            <td>{f.designation}</td>
                            <td>{f.department}</td>
                            <td>{f.mobileNumber}</td>
                            <td>
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '99px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    background: f.type === 'Regular' ? '#dcfce7' : '#fef9c3',
                                    color: f.type === 'Regular' ? '#166534' : '#854d0e'
                                }}>
                                    {f.type}
                                </span>
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
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                        </div>
                        <AddFacultyForm onSubmit={handleAddFaculty} onCancel={() => setShowModal(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}

function AddFacultyForm({ onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        name: '',
        facultyId: '',
        designation: 'Assistant Professor',
        qualification: '',
        email: '',
        mobileNumber: '',
        type: 'Regular',
        experience: '',
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
                <button type="submit" className="btn-action primary">Save Faculty</button>
            </div>
        </form>
    );
}

// --- CURRICULUM VIEW ---
function CurriculumView() {
    const [subjects, setSubjects] = useState([]);
    const [activeCourse, setActiveCourse] = useState('B.Tech');

    useEffect(() => { fetch(`${API_BASE_URL}/api/subjects`).then(res => res.json()).then(setSubjects); }, []);

    const filteredSubjects = subjects.filter(s => {
        return s.semester.includes(activeCourse);
    });

    return (
        <div className="glass-table-container">
            <div className="table-header-premium">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h3>Curriculum Overview</h3>
                    <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '4px' }}>
                        {['B.Tech', 'M.Tech', 'MCA'].map(c => (
                            <button
                                key={c}
                                onClick={() => setActiveCourse(c)}
                                style={{
                                    padding: '6px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                                    background: activeCourse === c ? '#fff' : 'transparent',
                                    color: activeCourse === c ? '#0f172a' : '#64748b',
                                    fontWeight: '600', fontSize: '0.85rem', boxShadow: activeCourse === c ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                                }}
                            >{c}</button>
                        ))}
                    </div>
                </div>
            </div>
            <table className="premium-table">
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Subject Title</th>
                        <th>Sem</th>
                        <th>Credits</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredSubjects.length > 0 ? filteredSubjects.map((s, i) => (
                        <tr key={i}>
                            <td style={{ fontFamily: 'monospace' }}>{s.courseCode}</td>
                            <td style={{ fontWeight: '500' }}>{s.courseName}</td>
                            <td>{s.semester}</td>
                            <td>{s.credits}</td>
                        </tr>
                    )) : (
                        <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No subjects found for {activeCourse}</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

// --- TIMETABLE VIEW ---
function TimetableView() {
    const [timetable, setTimetable] = useState(null);
    const [activeCourse, setActiveCourse] = useState('B.Tech');
    const [sem, setSem] = useState('I-B.Tech I Sem');

    // Reset sem when course changes
    useEffect(() => {
        if (activeCourse === 'B.Tech') setSem('I-B.Tech I Sem');
        else if (activeCourse === 'M.Tech') setSem('I-M.Tech I Sem');
        else if (activeCourse === 'MCA') setSem('I-MCA I Sem');
    }, [activeCourse]);

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/timetables?semester=${encodeURIComponent(sem)}`)
            .then(res => res.json())
            .then(data => setTimetable(Array.isArray(data) ? data[0] : (data.schedule ? data : null)))
            .catch(() => setTimetable(null));
    }, [sem]);

    return (
        <div className="glass-table-container">
            <div className="table-header-premium">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h3>Class Timetables</h3>
                    <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '4px' }}>
                        {['B.Tech', 'M.Tech', 'MCA'].map(c => (
                            <button
                                key={c}
                                onClick={() => setActiveCourse(c)}
                                style={{
                                    padding: '6px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                                    background: activeCourse === c ? '#fff' : 'transparent',
                                    color: activeCourse === c ? '#0f172a' : '#64748b',
                                    fontWeight: '600', fontSize: '0.85rem', boxShadow: activeCourse === c ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                                }}
                            >{c}</button>
                        ))}
                    </div>
                </div>
                <select value={sem} onChange={(e) => setSem(e.target.value)} className="search-input-premium" style={{ width: '200px', backgroundImage: 'none' }}>
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
            </div>

            {timetable ? (
                <div style={{ overflowX: 'auto', padding: '1rem' }}>
                    <table className="clean-table" style={{ textAlign: 'center', width: '100%', tableLayout: 'fixed', fontSize: '0.85rem' }}>
                        <thead>
                            <tr>
                                <th style={{ width: '80px', background: '#f8fafc' }}>Day</th>
                                <th>09:30 - 10:30</th>
                                <th>10:30 - 11:30</th>
                                <th>11:30 - 12:30</th>
                                <th style={{ width: '50px', backgroundColor: '#f1f5f9', color: '#64748b' }}>L</th>
                                <th>02:00 - 03:00</th>
                                <th>03:00 - 04:00</th>
                                <th>04:00 - 05:00</th>
                            </tr>
                        </thead>
                        <tbody>
                            {timetable.schedule.map((day, dIndex) => {
                                const morning = day.periods.filter(p => !p.time.includes('12:30') && !p.time.includes('02:00') && !p.time.includes('03:') && !p.time.includes('04:') && p.type !== 'Break');
                                const afternoon = day.periods.filter(p => p.time.startsWith('02') || p.time.startsWith('03') || p.time.startsWith('04'));

                                const renderPeriod = (periods) => (
                                    <div style={{ display: 'flex', gap: '4px', height: '100%' }}>
                                        {periods.map((p, i) => (
                                            <div key={i} style={{
                                                flex: 1,
                                                padding: '8px',
                                                borderRadius: '6px',
                                                background: p.type === 'Lab' ? '#eff6ff' : '#fdfcff',
                                                border: '1px solid #e2e8f0',
                                                fontSize: '0.75rem',
                                                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                            }}>
                                                <div style={{ fontWeight: '600', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.subject}</div>
                                                <div style={{ color: '#64748b', fontSize: '0.7rem' }}>{p.faculty || 'Unassigned'}</div>
                                            </div>
                                        ))}
                                    </div>
                                );

                                return (
                                    <tr key={dIndex} style={{ height: '70px' }}>
                                        <td style={{ fontWeight: '700', color: '#334155' }}>{day.day}</td>
                                        <td colSpan={3} style={{ padding: '4px' }}>{renderPeriod(morning)}</td>
                                        <td style={{ backgroundColor: '#f1f5f9', writingMode: 'vertical-rl', textAlign: 'center', fontSize: '0.7rem', fontWeight: 'bold', color: '#94a3b8' }}>LUNCH</td>
                                        <td colSpan={3} style={{ padding: '4px' }}>{renderPeriod(afternoon)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
                    <p>No timetable data for this semester.</p>
                </div>
            )}
        </div>
    );
}

export default PrincipalDashboard;
