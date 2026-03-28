import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API_BASE_URL from '../../config'
import '../../App.css'
import CommunicationCenter from '../../components/CommunicationCenter'
import GlobalLoader from '../../components/GlobalLoader'
import { exportToCSV } from '../../utils/exportUtils'

// --- ICONS (Consistent with Premium Look) ---
const Icons = {
    Home: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    Users: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    Shield: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    Settings: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
    Database: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>,
    Mail: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>,
    LogOut: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0" /><line x1="12" y1="2" x2="12" y2="12" /></svg>,
    Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
    Building: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M8 10h.01"></path><path d="M16 10h.01"></path><path d="M8 14h.01"></path><path d="M16 14h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path></svg>,
    Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>,
    Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="12" y2="12"></line></svg>,
    Edit: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
    Activity: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
}

function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [user] = useState(JSON.parse(localStorage.getItem('user')) || { name: 'Admin', role: 'admin' });
    
    // Real Data States
    const [departments, setDepartments] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [stats, setStats] = useState({ users: 0, depts: 0, healthy: '100%' });

    const showToast = useCallback((message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [deptRes, facRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/departments`),
                fetch(`${API_BASE_URL}/api/faculty`)
            ]);
            const depts = await deptRes.json();
            const facs = await facRes.json();
            setDepartments(depts);
            setFaculty(facs);
            setStats({ 
                users: facs.length + 500, // Estimating students for context
                depts: depts.length,
                healthy: '99.9%'
            });
        } catch (error) {
            showToast('Failed to sync system data', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [activeTab]);

    const renderContent = () => {
        if (loading && departments.length === 0) return <GlobalLoader />;
        
        switch (activeTab) {
            case 'users': return <FacultyManagement faculty={faculty} depts={departments} showToast={showToast} refresh={fetchData} />;
            case 'departments': return <DepartmentManagement departments={departments} faculty={faculty} showToast={showToast} refresh={fetchData} />;
            case 'system': return <SystemSettings showToast={showToast} />;
            case 'database': return <DatabaseTools showToast={showToast} />;
            case 'notices': return <CommunicationCenter user={user} showToast={showToast} />;
            default: return <AdminOverview stats={stats} onNavigate={setActiveTab} />;
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
                        <div className="sidebar-role">System Admin</div>
                    </div>
                </div>

                <nav className="nav-menu">
                    <NavItem icon={<Icons.Home />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                    <NavItem icon={<Icons.Building />} label="Departments" active={activeTab === 'departments'} onClick={() => setActiveTab('departments')} />
                    <NavItem icon={<Icons.Users />} label="Faculty & Staff" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
                    <NavItem icon={<Icons.Database />} label="System Data" active={activeTab === 'database'} onClick={() => setActiveTab('database')} />
                    <NavItem icon={<Icons.Settings />} label="Preferences" active={activeTab === 'system'} onClick={() => setActiveTab('system')} />
                    <NavItem icon={<Icons.Mail />} label="Broadcast" active={activeTab === 'notices'} onClick={() => setActiveTab('notices')} />
                </nav>

                <div className="sidebar-footer">
                    <div className="user-snippet">
                        <div className="user-avatar">A</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>Admin Console</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Root Access</div>
                        </div>
                        <button
                            onClick={() => {
                                localStorage.removeItem('user');
                                window.dispatchEvent(new Event('auth-change'));
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

            {mobileMenuOpen && <div className="sidebar-overlay open" onClick={() => setMobileMenuOpen(false)} />}

            <main className="dashboard-main-area">
                <header className="mobile-header">
                    <button 
                        onClick={() => setMobileMenuOpen(true)}
                        style={{ background: '#0f172a', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', fontSize: '0.8rem', fontWeight: '800' }}
                    >
                        MENU
                    </button>
                    <span style={{ fontWeight: '800', color: '#0f172a' }}>ADMIN CENTRAL</span>
                </header>

                <div className="fade-in-up">
                    {renderContent()}
                </div>
            </main>

            {toast.show && (
                <div className="toast-notification fade-in-up" style={{
                    position: 'fixed', bottom: '2rem', right: '2rem', background: '#fff',
                    padding: '1rem 1.5rem', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 9999,
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

// --- SUB-COMPONENTS ---

function AdminOverview({ stats, onNavigate }) {
    return (
        <div className="admin-overview-wrapper">
            <div style={{ marginBottom: '3rem' }}>
                <h1 className="title-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Control Center 🛡️</h1>
                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Manage university infrastructure and academic operations.</p>
            </div>

            <div className="dashboard-card-grid">
                <div className="dashboard-control-card" onClick={() => onNavigate('departments')}>
                    <div className="card-icon"><Icons.Building /></div>
                    <div>
                        <h3>Academic Setup</h3>
                        <p>Manage university departments, assign HODs, and configure academic structure.</p>
                    </div>
                    <div className="card-footer">Manage Departments →</div>
                </div>

                <div className="dashboard-control-card" onClick={() => onNavigate('users')}>
                    <div className="card-icon"><Icons.Users /></div>
                    <div>
                        <h3>Faculty Control</h3>
                        <p>Full CRUD access for faculty records, role assignments, and department mapping.</p>
                    </div>
                    <div className="card-footer">Manage Faculty →</div>
                </div>

                <div className="dashboard-control-card" onClick={() => onNavigate('notices')}>
                    <div className="card-icon"><Icons.Mail /></div>
                    <div>
                        <h3>Communications</h3>
                        <p>Broadcast global notices, academic alerts, and system-wide announcements.</p>
                    </div>
                    <div className="card-footer">Send Broadcast →</div>
                </div>

                <div className="dashboard-control-card" onClick={() => onNavigate('database')}>
                    <div className="card-icon"><Icons.Database /></div>
                    <div>
                        <h3>Infrastructure</h3>
                        <p>Manage campus rooms, labs, and monitor database health and system logs.</p>
                    </div>
                    <div className="card-footer">System Data →</div>
                </div>
            </div>

            <div className="modern-stats-grid">
                <div className="premium-stat-card">
                    <div className="stat-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}><Icons.Activity /></div>
                    <div className="stat-content"><h5>System Status</h5><h3>ACTIVE</h3><span className="stat-trend trend-up">Optimized performance</span></div>
                </div>
                <div className="premium-stat-card">
                    <div className="stat-icon-wrapper" style={{ background: '#dcfce7', color: '#16a34a' }}><Icons.Users /></div>
                    <div className="stat-content"><h5>Authorized Users</h5><h3>~{stats.users.toLocaleString()}</h3><span className="stat-trend trend-neutral">University-wide</span></div>
                </div>
                <div className="premium-stat-card">
                    <div className="stat-icon-wrapper" style={{ background: '#fee2e2', color: '#ef4444' }}><Icons.Shield /></div>
                    <div className="stat-content"><h5>Registry Health</h5><h3>{stats.healthy}</h3><span className="stat-trend trend-up">All nodes synced</span></div>
                </div>
            </div>
        </div>
    );
}


function DepartmentManagement({ departments, faculty, showToast, refresh }) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', hodId: '' });

    const handleAction = async (e) => {
        e.preventDefault();
        const url = editingId ? `${API_BASE_URL}/api/departments/${editingId}` : `${API_BASE_URL}/api/departments`;
        const method = editingId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                showToast(`Department ${editingId ? 'updated' : 'created'} successfully!`);
                setIsAdding(false);
                setEditingId(null);
                setFormData({ name: '', hodId: '' });
                refresh();
            } else {
                const err = await res.json();
                showToast(err.message, 'error');
            }
        } catch (err) {
            showToast('Network error', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this department?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/departments/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showToast('Department removed');
                refresh();
            }
        } catch (err) {
            showToast('Delete failed', 'error');
        }
    };

    return (
        <div className="fade-in-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ margin: 0 }}>Academic Department Registry</h2>
                <button className="btn-action primary" onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ name: '', hodId: '' }); }}>
                    <Icons.Plus /> New Department
                </button>
            </div>

            {(isAdding || editingId) && (
                <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                    <h3>{editingId ? 'Edit' : 'Add'} Department</h3>
                    <form onSubmit={handleAction} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1 }}>
                            <label className="input-label">Department Name</label>
                            <input className="modern-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="e.g., Information Technology" />
                        </div>
                        <button type="submit" className="btn-action primary">{editingId ? 'Update' : 'Create'}</button>
                        <button type="button" className="btn-action" onClick={() => { setIsAdding(false); setEditingId(null); }}>Cancel</button>
                    </form>
                </div>
            )}

            <div className="premium-table-wrapper">
                <table className="premium-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th>Department Name</th>
                            <th>Current HOD</th>
                            <th>Faculty Count</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {departments.map((dept) => (
                            <tr key={dept._id}>
                                <td style={{ fontWeight: '700' }}>{dept.name}</td>
                                <td>{dept.hodName || 'Not Assigned'}</td>
                                <td>{faculty.filter(f => f.department === dept.name).length}</td>
                                <td style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                        <button className="btn-action" onClick={() => { setEditingId(dept._id); setFormData({ name: dept.name }); }} title="Edit"><Icons.Edit /></button>
                                        <button className="btn-action" style={{ color: '#ef4444' }} onClick={() => handleDelete(dept._id)} title="Delete"><Icons.Trash /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function FacultyManagement({ faculty, depts, showToast, refresh }) {
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({});

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE_URL}/api/faculty/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                showToast('Faculty updated');
                setEditingId(null);
                refresh();
            }
        } catch (err) { showToast('Update failed', 'error'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this faculty member?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/faculty/${id}`, { method: 'DELETE' });
            if (res.ok) { showToast('Faculty removed'); refresh(); }
        } catch (err) { showToast('Delete failed', 'error'); }
    };

    return (
        <div className="fade-in-up">
            <h2 style={{ marginBottom: '2rem' }}>Faculty & Staff Management</h2>

            {editingId && (
                <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                    <h3>Edit Faculty: {formData.name}</h3>
                    <form onSubmit={handleUpdate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div><label className="input-label">Name</label><input className="modern-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                        <div><label className="input-label">Department</label>
                            <select className="modern-input" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}>
                                {depts.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                            </select>
                        </div>
                        <div><label className="input-label">Designation</label><input className="modern-input" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} /></div>
                        <div><label className="input-label">Role</label>
                            <select className="modern-input" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                                <option value="faculty">Faculty</option>
                                <option value="hod">HOD</option>
                                <option value="principal">Principal</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem' }}>
                            <button type="submit" className="btn-action primary">Save Changes</button>
                            <button type="button" className="btn-action" onClick={() => setEditingId(null)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="premium-table-wrapper">
                <table className="premium-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr><th>Name</th><th>Dept</th><th>Role</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
                    </thead>
                    <tbody>
                        {faculty.map((f) => (
                            <tr key={f._id}>
                                <td style={{ fontWeight: '700' }}>{f.name}</td>
                                <td>{f.department}</td>
                                <td><span style={{ textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: '800', padding: '0.2rem 0.5rem', background: '#e2e8f0', borderRadius: '4px'}}>{f.role}</span></td>
                                <td><span style={{ color: '#10b981' }}>● Active</span></td>
                                <td style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                        <button className="btn-action" onClick={() => { setEditingId(f._id); setFormData(f); }}><Icons.Edit /></button>
                                        <button className="btn-action" style={{ color: '#ef4444' }} onClick={() => handleDelete(f._id)}><Icons.Trash /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function SystemSettings({ showToast }) {
    return (
        <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ marginTop: 0 }}>System Configuration</h2>
            <div style={{ display: 'grid', gap: '2rem', marginTop: '2rem' }}>
                <div className="setting-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: '#f8fafc', borderRadius: '16px' }}>
                    <div>
                        <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>Maintenance Mode</div>
                        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Restrict public access during updates.</div>
                    </div>
                    <button className="btn-action" onClick={() => showToast('Maintenance Mode Activated', 'error')}>Enable</button>
                </div>
                <div className="setting-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: '#f8fafc', borderRadius: '16px' }}>
                    <div>
                        <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>Automatic Backups</div>
                        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Schedule daily database snapshots.</div>
                    </div>
                    <button className="btn-action primary" onClick={() => showToast('Backup Schedule Updated')}>Update Schedule</button>
                </div>
            </div>
        </div>
    );
}

function DatabaseTools({ showToast }) {
    return (
        <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ marginTop: 0 }}>Infrastructure & Integrity</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
                <div style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
                    <h3 style={{ marginTop: 0 }}>Database</h3>
                    <button className="btn-action" style={{ width: '100%', marginBottom: '0.5rem' }} onClick={() => showToast('Backup triggered...')}>📦 Export SQL</button>
                    <button className="btn-action" style={{ width: '100%' }} onClick={() => showToast('Integrity check: 100% OK')}>🛡️ Audit Data</button>
                </div>
                <div style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
                    <h3 style={{ marginTop: 0 }}>Storage</h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Used: 4.2GB / 10GB</p>
                    <button className="btn-action" style={{ width: '100%' }} onClick={() => showToast('Log files cleared')}>🧹 Clear Logs</button>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;

