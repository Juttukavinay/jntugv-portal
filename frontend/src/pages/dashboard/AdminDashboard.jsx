import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API_BASE_URL from '../../config'
import '../../App.css'
import CommunicationCenter from '../../components/CommunicationCenter'
import GlobalLoader from '../../components/GlobalLoader'

// --- ICONS (Consistent with Premium Look) ---
const Icons = {
    Home: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    Users: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    Shield: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    Settings: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
    Database: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>,
    Mail: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>,
    LogOut: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
    Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
}

function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [user] = useState(JSON.parse(localStorage.getItem('user')) || { name: 'Admin', role: 'admin' });

    const showToast = useCallback((message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
    }, []);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [activeTab]);

    const renderContent = () => {
        switch (activeTab) {
            case 'users': return <UserManagement showToast={showToast} />;
            case 'system': return <SystemSettings showToast={showToast} />;
            case 'database': return <DatabaseTools showToast={showToast} />;
            case 'notices': return <CommunicationCenter user={user} showToast={showToast} />;
            default: return <AdminOverview onNavigate={setActiveTab} />;
        }
    };

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <aside className={`glass-sidebar ${mobileMenuOpen ? 'open' : ''}`} style={{ background: 'rgba(15, 23, 42, 0.95)', color: 'white' }}>
                <div className="sidebar-header">
                    <img src="/jntugv-logo.png" alt="Logo" className="sidebar-logo" />
                    <div>
                        <div className="sidebar-title">JNTU-GV</div>
                        <div className="sidebar-role" style={{ color: '#fbbf24' }}>System Admin</div>
                    </div>
                </div>

                <nav className="nav-menu">
                    <NavItem icon={<Icons.Home />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                    <NavItem icon={<Icons.Users />} label="User Control" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
                    <NavItem icon={<Icons.Database />} label="System Data" active={activeTab === 'database'} onClick={() => setActiveTab('database')} />
                    <NavItem icon={<Icons.Settings />} label="Preferences" active={activeTab === 'system'} onClick={() => setActiveTab('system')} />
                    <NavItem icon={<Icons.Mail />} label="Global Broadcast" active={activeTab === 'notices'} onClick={() => setActiveTab('notices')} />
                </nav>

                <div className="sidebar-footer">
                    <div className="user-snippet">
                        <div className="user-avatar" style={{ background: '#f59e0b' }}>A</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>Admin Console</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Root Access</div>
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

            {mobileMenuOpen && <div className="sidebar-overlay open" onClick={() => setMobileMenuOpen(false)} />}

            <main className="dashboard-main-area">
                <header className="mobile-header">
                    <button onClick={() => setMobileMenuOpen(true)}>☰</button>
                    <span>Admin Central</span>
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

function AdminOverview({ onNavigate }) {
    return (
        <div>
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 className="title-gradient" style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>Super Admin Dashboard 🛡️</h1>
                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Total system control and monitoring overview.</p>
            </div>

            <div className="modern-stats-grid">
                <div className="premium-stat-card">
                    <div className="stat-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}><Icons.Shield /></div>
                    <div className="stat-content"><h5>System Status</h5><h3>ACTIVE</h3><span className="stat-trend trend-up">All services running</span></div>
                </div>
                <div className="premium-stat-card">
                    <div className="stat-icon-wrapper" style={{ background: '#dcfce7', color: '#16a34a' }}><Icons.Users /></div>
                    <div className="stat-content"><h5>Total Users</h5><h3>~4,500</h3><span className="stat-trend trend-neutral">System-wide</span></div>
                </div>
                <div className="premium-stat-card">
                    <div className="stat-icon-wrapper" style={{ background: '#fee2e2', color: '#ef4444' }}><Icons.Database /></div>
                    <div className="stat-content"><h5>DB Health</h5><h3>99.9%</h3><span className="stat-trend trend-up">Optimized</span></div>
                </div>
            </div>

            <div className="grid-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3>Security Logs</h3>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        <div className="log-entry" style={{ padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                            <span style={{ color: '#10b981' }}>[SUCCESS]</span> Root login from 192.168.1.1
                        </div>
                        <div className="log-entry" style={{ padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                            <span style={{ color: '#ef4444' }}>[WARN]</span> Multiple failed attempts on Faculty portal
                        </div>
                        <div className="log-entry" style={{ padding: '0.5rem 0' }}>
                            <span style={{ color: '#3b82f6' }}>[INFO]</span> Daily backup completed successfully
                        </div>
                    </div>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3>Maintenance Tools</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <button className="btn-action" onClick={() => onNavigate('database')}>Clear Cache</button>
                        <button className="btn-action" onClick={() => onNavigate('system')}>System Update</button>
                        <button className="btn-action primary" onClick={() => onNavigate('users')}>User Audit</button>
                        <button className="btn-action" onClick={() => onNavigate('notices')}>Broadcast</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function UserManagement({ showToast }) {
    return (
        <div className="glass-table-container">
            <div className="table-header-premium">
                <h3>System User Registry</h3>
                <button className="btn-action primary" onClick={() => showToast('Audit feature coming soon!')}>Audit All</button>
            </div>
            <p style={{ padding: '0 1.5rem', color: '#64748b' }}>High-level user permissions and role management console.</p>
            <table className="premium-table">
                <thead>
                    <tr><th>User Type</th><th>Access Level</th><th>Permissions</th><th>Action</th></tr>
                </thead>
                <tbody>
                    <tr><td>Admin (Root)</td><td>Super User</td><td>Full Write/Delete</td><td><button disabled>Protected</button></td></tr>
                    <tr><td>Principal</td><td>Academic Admin</td><td>Dept Level Manage</td><td><button className="btn-action">Edit</button></td></tr>
                    <tr><td>Faculty</td><td>Instructional</td><td>Course Management</td><td><button className="btn-action">Edit</button></td></tr>
                    <tr><td>Student</td><td>Consumer</td><td>Read Only + Forms</td><td><button className="btn-action">Edit</button></td></tr>
                </tbody>
            </table>
        </div>
    );
}

function SystemSettings({ showToast }) {
    return (
        <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3>Global System Preferences</h3>
            <div style={{ display: 'grid', gap: '1.5rem', marginTop: '1rem' }}>
                <div className="setting-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontWeight: '600' }}>Maintenance Mode</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Shut down public access for updates</div>
                    </div>
                    <button className="btn-action" onClick={() => showToast('Maintenance Mode Activated', 'error')}>Disabled</button>
                </div>
                <div className="setting-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontWeight: '600' }}>Google Auth Enhancement</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Enforce multi-factor for faculty</div>
                    </div>
                    <button className="btn-action primary" onClick={() => showToast('Security Policy Updated')}>Enforced</button>
                </div>
            </div>
        </div>
    );
}

function DatabaseTools({ showToast }) {
    return (
        <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3>Data Operations</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                <button className="btn-action" onClick={() => showToast('Backup triggered...')}>📦 Download SQL Backup</button>
                <button className="btn-action" onClick={() => showToast('Integrity check: 100% OK')}>🛡️ Verify Integrity</button>
                <button className="btn-action" style={{ color: '#ef4444' }} onClick={() => showToast('Emergency Reset BLOCKED', 'error')}>☢️ Emergency Reset</button>
            </div>
        </div>
    );
}

export default AdminDashboard;
