import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import API_BASE_URL from '../../config'
import '../../App.css'

// --- ICONS (Consistent with Principal) ---
const Icons = {
    Home: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    Users: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    Book: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>,
    Calendar: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
    LogOut: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
    Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
}

function FacultyDashboard() {
    const navigate = useNavigate()
    const [currentUser, setCurrentUser] = useState(null)
    const [activeTab, setActiveTab] = useState('overview')
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [mySubject, setMySubject] = useState('')

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user')) || { name: 'Faculty Member', role: 'faculty' }
        setCurrentUser(user)
        setMobileMenuOpen(false)
    }, [])

    return (
        <div className="dashboard-container">
            {/* Sidebar with consistent class */}
            <aside className={`glass-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <img src="/jntugv-logo.png" alt="Logo" className="sidebar-logo" />
                    <div>
                        <div className="sidebar-title">JNTU-GV</div>
                        <div className="sidebar-role">Faculty Portal</div>
                    </div>
                </div>

                <nav className="nav-menu">
                    <NavItem icon={<Icons.Home />} label="Overview" active={activeTab === 'overview'} onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); }} />
                    <NavItem icon={<Icons.Calendar />} label="My Timetable" active={activeTab === 'timetable'} onClick={() => { setActiveTab('timetable'); setMobileMenuOpen(false); }} />
                    <NavItem icon={<Icons.Users />} label="My Students" active={activeTab === 'students'} onClick={() => { setActiveTab('students'); setMobileMenuOpen(false); }} />
                    <NavItem icon={<Icons.Check />} label="Attendance" active={activeTab === 'attendance'} onClick={() => { setActiveTab('attendance'); setMobileMenuOpen(false); }} />
                </nav>

                <div className="sidebar-footer">
                    <div className="user-snippet">
                        <div className="user-avatar">{currentUser?.name?.charAt(0) || 'F'}</div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser?.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Faculty</div>
                        </div>
                        <button
                            onClick={() => { localStorage.removeItem('user'); navigate('/login', { replace: true }); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                        >
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
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', padding: '0.5rem', display: 'flex' }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                    </button>
                    <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>Faculty Dashboard</span>
                </header>

                <div className="fade-in-up">
                    {activeTab === 'overview' && <FacultyOverview currentUser={currentUser} onNavigate={setActiveTab} />}
                    {activeTab === 'timetable' && <FacultyTimetable currentUser={currentUser} />}
                    {activeTab === 'students' && <SectionStudentList />}
                    {activeTab === 'attendance' && <AttendanceManager />}
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
    )
}

// --- SUB COMPONENTS ---

function FacultyOverview({ currentUser, onNavigate }) {
    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 className="title-gradient" style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>Welcome, {currentUser?.name?.split(' ')[0]}! 👋</h1>
                <p style={{ color: '#64748b' }}>Here is your daily activity summary.</p>
            </div>

            <div className="modern-stats-grid">
                <div className="premium-stat-card">
                    <div className="stat-icon-wrapper" style={{ background: '#eff6ff', color: '#2563eb' }}><Icons.Calendar /></div>
                    <div className="stat-content">
                        <h5>Today's Classes</h5>
                        <h3>3</h3>
                        <span className="stat-trend trend-neutral">Next: 2:00 PM (Lab)</span>
                    </div>
                </div>
                <div className="premium-stat-card">
                    <div className="stat-icon-wrapper" style={{ background: '#f0fdf4', color: '#16a34a' }}><Icons.Check /></div>
                    <div className="stat-content">
                        <h5>Attendance</h5>
                        <h3>Pending</h3>
                        <span className="stat-trend trend-down">Mark for 2 Sections</span>
                    </div>
                </div>
            </div>

            <div className="grid-split" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '2rem' }}>
                <div className="glass-table-container" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginTop: 0 }}>Upcoming Classes</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { time: '09:30 - 10:30', subject: 'Computer Networks', room: 'CSE-302', type: 'Theory' },
                            { time: '11:30 - 12:30', subject: 'Data Science', room: 'CSE-304', type: 'Theory' },
                            { time: '14:00 - 16:00', subject: 'Web Technologies Lab', room: 'Lab-2', type: 'Lab' }
                        ].map((cls, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '12px', borderLeft: `4px solid ${cls.type === 'Lab' ? '#3b82f6' : '#10b981'}` }}>
                                <div>
                                    <div style={{ fontWeight: '700', color: '#0f172a' }}>{cls.subject}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{cls.room} • {cls.type}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: '600', color: '#334155' }}>{cls.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-table-container" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginTop: 0 }}>Quick Actions</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <button
                            className="btn-action primary"
                            style={{ height: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                            onClick={() => onNavigate('attendance')}
                        >
                            <Icons.Check /> Mark Attendance
                        </button>
                        <button
                            className="btn-action"
                            style={{ height: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                            onClick={() => onNavigate('students')}
                        >
                            <Icons.Users /> Student List
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function SectionStudentList() {
    const [students, setStudents] = useState([])

    useEffect(() => {
        // Fetch real students or usage mocks if empty
        fetch(`${API_BASE_URL}/api/students`).then(res => res.json()).then(data => {
            if (Array.isArray(data) && data.length > 0) setStudents(data)
            else setStudents([
                { rollNumber: '21131A0501', name: 'Student One', year: '3', semester: '1' },
                { rollNumber: '21131A0502', name: 'Student Two', year: '3', semester: '1' },
                { rollNumber: '21131A0503', name: 'Student Three', year: '3', semester: '1' },
            ])
        }).catch(e => console.error(e))
    }, [])

    return (
        <div className="glass-table-container">
            <div className="table-header-premium">
                <h3>My Students (CSE - III Year)</h3>
                <button className="btn-action">Export List</button>
            </div>
            <table className="premium-table">
                <thead>
                    <tr>
                        <th>Roll No</th>
                        <th>Name</th>
                        <th>Year</th>
                        <th>Contact</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map((s, i) => (
                        <tr key={i}>
                            <td style={{ fontFamily: 'monospace', fontWeight: '600' }}>{s.rollNumber}</td>
                            <td>{s.name}</td>
                            <td>{s.year}-{s.semester}</td>
                            <td><span style={{ color: '#3b82f6', cursor: 'pointer' }}>Email</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

function FacultyTimetable({ currentUser }) {
    // Reusing the robust timetable view from previous but simplified styling for "My Timetable"
    return (
        <div className="glass-table-container">
            <div className="table-header-premium">
                <h3>Weekly Schedule</h3>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Showing schedule for: {currentUser?.name}</span>
            </div>
            <div style={{ padding: '2rem', overflowX: 'auto' }}>
                <table className="premium-table" style={{ textAlign: 'center' }}>
                    <thead>
                        <tr>
                            <th>Day</th>
                            <th>09:30-10:30</th>
                            <th>10:30-11:30</th>
                            <th>11:30-12:30</th>
                            <th>02:00-03:00</th>
                            <th>03:00-04:00</th>
                        </tr>
                    </thead>
                    <tbody>
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                            <tr key={day}>
                                <td style={{ fontWeight: '700' }}>{day}</td>
                                <td>-</td>
                                <td style={{ background: '#eff6ff', color: '#2563eb', fontWeight: '600' }}>CNS (CSE-A)</td>
                                <td>-</td>
                                <td style={{ background: '#f0fdf4', color: '#16a34a', fontWeight: '600' }}>Lab (CSE-B)</td>
                                <td style={{ background: '#f0fdf4', color: '#16a34a', fontWeight: '600' }}>Lab (CSE-B)</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function AttendanceManager() {
    const [selectedSec, setSelectedSec] = useState('');

    return (
        <div>
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', borderRadius: '16px' }}>
                <h3 style={{ marginTop: 0 }}>Mark Attendance</h3>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                        <label className="input-label">Select Section / Class</label>
                        <select className="modern-input" value={selectedSec} onChange={(e) => setSelectedSec(e.target.value)}>
                            <option value="">-- Choose Class --</option>
                            <option value="3A">III Year - Section A (CSE)</option>
                            <option value="3B">III Year - Section B (CSE)</option>
                            <option value="2A">II Year - Section A (ECE)</option>
                        </select>
                    </div>
                    <div style={{ flex: 1 }}>
                        <label className="input-label">Date</label>
                        <input type="date" className="modern-input" defaultValue={new Date().toISOString().split('T')[0]} />
                    </div>
                    <button className="btn-primary" style={{ width: 'auto', marginBottom: '2px' }}>Load Student List</button>
                </div>
            </div>

            {selectedSec && (
                <div className="glass-table-container">
                    <div className="table-header-premium">
                        <h3>Attendance Sheet: {selectedSec === '3A' ? 'III Year CSE - A' : selectedSec}</h3>
                        <div>
                            <span style={{ marginRight: '1rem', fontSize: '0.9rem' }}>Present: 45</span>
                            <span style={{ fontSize: '0.9rem', color: '#ef4444' }}>Absent: 5</span>
                        </div>
                    </div>
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Roll No</th>
                                <th>Name</th>
                                <th style={{ textAlign: 'center' }}>Status</th>
                                <th>Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5].map(i => (
                                <tr key={i}>
                                    <td style={{ fontFamily: 'monospace' }}>21131A050{i}</td>
                                    <td>Student {i}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div style={{ display: 'inline-flex', gap: '0.5rem', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
                                            <button style={{ background: '#22c55e', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '6px', fontWeight: '600' }}>P</button>
                                            <button style={{ background: 'transparent', color: '#cbd5e1', border: 'none', padding: '4px 12px', borderRadius: '6px', fontWeight: '600' }}>A</button>
                                        </div>
                                    </td>
                                    <td><input className="search-input-premium" style={{ width: '100%', padding: '0.4rem' }} placeholder="Optional" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div style={{ padding: '1rem', textAlign: 'right' }}>
                        <button className="btn-primary" style={{ width: '200px' }}>Submit Attendance</button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default FacultyDashboard;

function BookingModal({ currentUser, onClose }) {
    const [semesters] = useState([
        'I-B.Tech I Sem', 'I-B.Tech II Sem',
        'II-B.Tech I Sem', 'II-B.Tech II Sem',
        'III-B.Tech I Sem', 'III-B.Tech II Sem',
        'IV-B.Tech I Sem', 'IV-B.Tech II Sem'
    ]);
    const [selectedSem, setSelectedSem] = useState('I-B.Tech I Sem'); // Default
    const [timetable, setTimetable] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mySubject, setMySubject] = useState(''); // Default from profile
    const [bookingSubject, setBookingSubject] = useState(''); // Selected subject for booking
    const [availableSubjects, setAvailableSubjects] = useState([]); // List of subjects in selected sem

    // 1. Load Faculty Profile to get default Subject (e.g. "IT" or similar)
    useEffect(() => {
        if (currentUser?.email) {
            fetch(`${API_BASE_URL}/api/faculty`)
                .then(r => r.json())
                .then(data => {
                    const me = data.find(f => f.email === currentUser.email);
                    if (me) setMySubject(me.subject);
                })
                .catch(err => console.error(err));
        }
    }, [currentUser]);

    // 2. Load Subjects for the selected Semester to populate Dropdown
    useEffect(() => {
        if (selectedSem) {
            fetch(`${API_BASE_URL}/api/subjects?semester=${encodeURIComponent(selectedSem)}`)
                .then(res => res.json())
                .then(data => {
                    setAvailableSubjects(data);
                    // Smart match
                    if (data.length > 0) {
                        // Try to find a match with the Faculty's assigned subject (even partial)
                        // If mySubject is "IT", and there is "IT Workshop", maybe? 
                        // But let's look for exact first.
                        const exactMatch = data.find(s => s.courseName === mySubject);
                        if (exactMatch) {
                            setBookingSubject(exactMatch.courseName);
                        } else {
                            setBookingSubject(data[0].courseName);
                        }
                    } else {
                        setBookingSubject(mySubject || ''); // Fallback
                    }
                })
                .catch(err => console.error("Failed to load subjects", err));
        }
    }, [selectedSem, mySubject]);

    const loadTimetable = useCallback(() => {
        setLoading(true);
        fetch(`${API_BASE_URL}/api/timetables?semester=${encodeURIComponent(selectedSem)}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) setTimetable(data[0]);
                else if (data && data.schedule) setTimetable(data);
                else setTimetable(null);
                setLoading(false);
            });
    }, [selectedSem]);

    useEffect(() => { loadTimetable(); }, [loadTimetable]);

    const handleBook = async (dayIndex, periodIndex) => {
        if (!bookingSubject) return alert("Please select a valid subject to book!");
        if (!confirm(`Confirm booking this slot for ${bookingSubject}?`)) return;

        try {
            const res = await fetch('/api/timetables/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    semester: selectedSem,
                    dayIndex,
                    periodIndex,
                    subject: bookingSubject,
                    faculty: currentUser.name
                })
            });
            if (res.ok) {
                // Optimistic UI Update or reload
                loadTimetable();
            } else {
                alert("Failed to book slot.");
            }
        } catch (e) { console.error(e); alert("Error"); }
    };

    return (
        <div className="modal-overlay" style={{ backdropFilter: 'blur(5px)', background: 'rgba(0,0,0,0.7)', zIndex: 1000 }}>
            <div className="modal-content" style={{ maxWidth: '98vw', width: '1400px', height: '95vh', display: 'flex', flexDirection: 'column', background: '#1e293b', color: 'white' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    <div>
                        <h2 style={{ margin: 0, color: '#f8fafc' }}>Book Your Slots</h2>
                        <p style={{ margin: '5px 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>Select a semester and click on available green slots to fix your class.</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '2rem', cursor: 'pointer' }}>×</button>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '2rem', background: '#0f172a', padding: '1rem', borderRadius: '8px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '5px' }}>SELECT SEMESTER</label>
                        <select
                            value={selectedSem}
                            onChange={e => setSelectedSem(e.target.value)}
                            style={{
                                padding: '0.8rem',
                                borderRadius: '6px',
                                background: '#334155',
                                color: 'white',
                                border: '1px solid #475569',
                                minWidth: '250px',
                                fontSize: '1rem'
                            }}
                        >
                            {semesters.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '5px' }}>SUBJECT TO TEACH</label>
                        <select
                            value={bookingSubject}
                            onChange={e => setBookingSubject(e.target.value)}
                            style={{
                                padding: '0.8rem',
                                borderRadius: '6px',
                                background: '#334155',
                                color: '#fbbf24',
                                border: '1px solid #475569',
                                minWidth: '300px',
                                fontSize: '1rem',
                                fontWeight: 'bold'
                            }}
                        >
                            {!availableSubjects.length && <option value="">Loading Subjects...</option>}
                            {availableSubjects.map(s => <option key={s._id} value={s.courseName}>{s.courseName} ({s.courseCode})</option>)}
                            {/* Fallback option if list is empty but profile has one */}
                            {availableSubjects.length === 0 && mySubject && <option value={mySubject}>{mySubject}</option>}
                        </select>
                    </div>
                </div>

                {/* VISUAL LEGEND */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: 20, height: 20, background: '#ffffff', borderRadius: '4px', border: '1px solid #cbd5e1' }}></div>
                        <span style={{ color: '#94a3b8' }}>Available</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: 20, height: 20, background: '#e2e8f0', borderRadius: '4px', border: '1px solid #cbd5e1' }}></div>
                        <span style={{ color: '#94a3b8' }}>Occupied</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: 20, height: 20, background: '#3b82f6', borderRadius: '4px', border: '2px solid #60a5fa' }}></div>
                        <span>Your Slots</span>
                    </div>
                </div>

                {/* GRID (Screen Area) - NOW TABLE BASED */}
                <div style={{ flex: 1, overflow: 'auto', width: '100%', background: '#0f172a', borderRadius: '8px', padding: '1rem' }}>
                    {loading ? <p style={{ textAlign: 'center', marginTop: '20%', color: '#94a3b8' }}>Loading Schedule...</p> : (
                        timetable ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                {/* Group by Day */}
                                {timetable.schedule.map((day, dIdx) => {
                                    // Filter for FREE or MY slots to show in list
                                    // Actually user wants to book, so show all Free slots + My booked slots?
                                    // "NO TIMETABLR GIVE ME A LIST"
                                    // Let's filter useful slots: Free ones to book, and Mine to Unbook?

                                    // Show ALL slots so the user sees the full picture (Available, Mine, Occupied)
                                    const relevantSlots = day.periods.map((p, pIdx) => ({ ...p, originalIndex: pIdx }));

                                    if (relevantSlots.length === 0) return null;

                                    return (
                                        <div key={dIdx}>
                                            <h3 style={{ color: '#94a3b8', borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '1rem' }}>{day.day}</h3>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                                                {relevantSlots.map((p, i) => {
                                                    const isMine = p.faculty === currentUser.name;
                                                    const isFree = p.subject === '-';
                                                    const isOccupied = !isMine && !isFree;

                                                    return (
                                                        <div key={i} style={{
                                                            background: isMine ? '#3b82f6' : (isOccupied ? '#e2e8f0' : 'white'),
                                                            padding: '1rem',
                                                            borderRadius: '8px',
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            border: isMine ? '2px solid #60a5fa' : (isOccupied ? '1px solid #cbd5e1' : '1px solid #e2e8f0'),
                                                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                                            opacity: isOccupied ? 0.8 : 1
                                                        }}>
                                                            <div>
                                                                <div style={{ fontSize: '1rem', fontWeight: 'bold', color: isMine ? 'white' : '#1e293b' }}>
                                                                    {p.time}
                                                                </div>
                                                                <div style={{ fontSize: '0.8rem', color: isMine ? '#bfdbfe' : '#64748b' }}>
                                                                    {p.credits} Credits • {p.type === 'Free' ? 'Empty Slot' : p.type}
                                                                </div>
                                                                {isMine && <div style={{ fontSize: '0.8rem', marginTop: '5px', fontWeight: 'bold', color: 'white' }}>{p.subject} (You)</div>}
                                                                {isOccupied && <div style={{ fontSize: '0.8rem', marginTop: '5px', fontWeight: 'bold', color: '#475569' }}>Occupied by {p.faculty?.split(' ')[0]}</div>}
                                                            </div>

                                                            {isFree ? (
                                                                <button
                                                                    onClick={() => handleBook(dIdx, p.originalIndex)}
                                                                    style={{
                                                                        padding: '10px 16px',
                                                                        background: bookingSubject?.toLowerCase().includes('lab') ? '#10b981' : '#3b82f6',
                                                                        color: 'white',
                                                                        border: 'none',
                                                                        borderRadius: '6px',
                                                                        fontWeight: 'bold',
                                                                        cursor: 'pointer',
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        alignItems: 'center',
                                                                        textAlign: 'center',
                                                                        minWidth: '120px'
                                                                    }}
                                                                >
                                                                    <span style={{ fontSize: '0.7rem', opacity: 0.9, marginBottom: '2px' }}>
                                                                        Assign {bookingSubject?.toLowerCase().includes('lab') ? 'Practical' : 'Subject'}
                                                                    </span>
                                                                    <span style={{ fontSize: '0.85rem', whiteSpace: 'normal', maxWidth: '200px', lineHeight: '1.2' }}>
                                                                        {bookingSubject || 'Select Subject'}
                                                                    </span>
                                                                </button>
                                                            ) : (
                                                                <div style={{
                                                                    padding: '5px 10px',
                                                                    background: isMine ? 'rgba(255,255,255,0.2)' : '#cbd5e1',
                                                                    borderRadius: '4px',
                                                                    fontSize: '0.8rem',
                                                                    color: isMine ? 'white' : '#475569',
                                                                    fontWeight: 'bold'
                                                                }}>
                                                                    {isMine ? 'Booked' : 'Occupied'}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                                {timetable.schedule.every(d => d.periods.filter(p => p.subject === '-' || p.faculty === currentUser.name).length === 0) && (
                                    <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No available slots found for booking.</div>
                                )}
                            </div>
                        ) : <div style={{ padding: '2rem', color: '#94a3b8', textAlign: 'center' }}>No timetable slots defined for this semester.</div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid #334155', textAlign: 'center' }}>
                    <button onClick={onClose} className="btn-primary" style={{ padding: '10px 40px', fontSize: '1rem' }}>Done</button>
                </div>
            </div>
        </div>
    );
}



// FULL TIMETABLE VIEW COMPONENT (Replica of Principal Dashboard View + Interactive)
// FULL TIMETABLE VIEW COMPONENT (Replica of Principal Dashboard View + Interactive)
function SlotActionModal({ slotData, currentUser, mySubject, onClose, onUpdate }) {
    if (!slotData) return null;
    const { period, dayIndex, periodIndex } = slotData;

    // Faculty List State
    const [facultyList, setFacultyList] = useState([]);
    useEffect(() => {
        fetch(`${API_BASE_URL}/api/faculty`).then(res => res.json()).then(setFacultyList).catch(console.error);
    }, []);

    // Determine status
    const effectiveFaculty = (period.faculty && period.faculty !== 'N/A') ? period.faculty : null;
    const isMine = effectiveFaculty === currentUser?.name;
    const isOccupied = effectiveFaculty && !isMine;

    // Booking Form Logic
    const initialData = {
        currentSubject: (period.subject && period.subject !== '-') ? period.subject : (mySubject || ''),
        faculty: currentUser?.name || '', // Default to ME
        assistants: period.assistants || []
    };

    const handleBookingSubmit = (details) => {
        if (isOccupied) return;
        // Validation: HOD/Faculty can assign themselves.
        // User (HOD/Fac) wants to be able to "TAKE A SUB" (Teach)
        // If they select another faculty as Main, that's their choice (if HOD), but usually Fac assign themselves.

        onUpdate(dayIndex, periodIndex, details.subject, details.faculty, details.assistants);
        onClose();
    };

    const handleRelease = () => {
        if (confirm("Are you sure you want to release this slot?")) {
            // Reset to Free
            onUpdate(dayIndex, periodIndex, '-', 'N/A', []);
            onClose();
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '600px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0 }}>Timetable Slot Action</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <strong style={{ color: '#64748b' }}>Time:</strong>
                        <span>{period.time}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: '#64748b' }}>Status:</strong>
                        {isOccupied ? (
                            <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Occupied</span>
                        ) : isMine ? (
                            <span style={{ color: '#2563eb', fontWeight: 'bold' }}>Booked by You</span>
                        ) : (
                            <span style={{ color: '#22c55e', fontWeight: 'bold' }}>Available</span>
                        )}
                    </div>
                </div>

                {isOccupied ? (
                    <div style={{ textAlign: 'center', padding: '1rem 0', color: '#64748b' }}>
                        <p>This slot is currently occupied by:</p>
                        <h4 style={{ color: '#0f172a', margin: '0.5rem 0' }}>{effectiveFaculty}</h4>
                        <p style={{ fontSize: '0.9rem' }}>Subject: {period.subject}</p>
                    </div>
                ) : isMine ? (
                    <div style={{ marginTop: '1.5rem' }}>
                        <p style={{ textAlign: 'center', marginBottom: '1rem' }}>You are currently teaching <strong>{period.subject}</strong> in this slot.</p>
                        <button className="btn-danger-outline" style={{ width: '100%' }} onClick={handleRelease}>
                            Release This Slot
                        </button>
                    </div>
                ) : (
                    /* RENDER BOOKING FORM HERE */
                    <BookingForm
                        initialData={initialData}
                        facultyList={facultyList}
                        onSubmit={handleBookingSubmit}
                        onCancel={onClose}
                    />
                )}
            </div>
        </div>
    );
}
// FULL TIMETABLE VIEW COMPONENT (Replica of Principal Dashboard View + Interactive)
function FullTimetableView({ currentUser, mySubject, onScheduleUpdate }) {
    const [selectedSemester, setSelectedSemester] = useState('I-B.Tech I Sem');
    const [timetable, setTimetable] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);

    const fetchTimetable = useCallback(() => {
        setLoading(true);
        fetch(`${API_BASE_URL}/api/timetables?semester=${encodeURIComponent(selectedSemester)}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) setTimetable(data[0]);
                else if (data && data.schedule) setTimetable(data);
                else setTimetable(null);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [selectedSemester]);

    useEffect(() => {
        fetchTimetable();
    }, [fetchTimetable]);

    const handleSlotClick = (dayIndex, periodIndex, period) => {
        if (!currentUser) return;
        setSelectedSlot({
            dayIndex,
            periodIndex,
            period,
            selectedSemester
        });
    };

    const updateSlot = async (dayIndex, periodIndex, subject, faculty, assistants = []) => {
        try {
            const res = await fetch('/api/timetables/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    semester: selectedSemester,
                    dayIndex,
                    periodIndex,
                    subject,
                    faculty: faculty || '',
                    assistants // Pass assistants to backend
                })
            });
            if (res.ok) {
                fetchTimetable();
                if (onScheduleUpdate) onScheduleUpdate();
            } else alert("Failed.");
        } catch (e) { console.error(e); }
    };

    return (
        <div className="fade-in">
            {selectedSlot && (
                <SlotActionModal
                    slotData={selectedSlot}
                    currentUser={currentUser}
                    mySubject={mySubject}
                    onClose={() => setSelectedSlot(null)}
                    onUpdate={updateSlot}
                />
            )}
            <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ margin: 0 }}>Department Timetables</h3>
                    <p style={{ margin: 0, color: '#64748b' }}>View all academic schedules across semesters.</p>
                </div>
                <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0', minWidth: '200px', fontSize: '1rem' }}
                >
                    <option value="I-B.Tech I Sem">I Year - I Sem</option>
                    <option value="I-B.Tech II Sem">I Year - II Sem</option>
                    <option value="II-B.Tech I Sem">II Year - I Sem</option>
                    <option value="II-B.Tech II Sem">II Year - II Sem</option>
                    <option value="III-B.Tech I Sem">III Year - I Sem</option>
                    <option value="III-B.Tech II Sem">III Year - II Sem</option>
                    <option value="IV-B.Tech I Sem">IV Year - I Sem</option>
                    <option value="IV-B.Tech II Sem">IV Year - II Sem</option>
                </select>
            </div>

            {loading ? <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div> : (
                timetable ? (
                    <div className="card" style={{ overflowX: 'auto', padding: '0' }}>
                        <div style={{ textAlign: 'center', fontWeight: 'bold', padding: '1rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#1e293b' }}>
                            {timetable.className}
                        </div>
                        <table className="clean-table" style={{ textAlign: 'center', fontSize: '0.9rem', width: '100%', tableLayout: 'fixed' }}>
                            <thead>
                                <tr>
                                    <th style={{ width: '80px' }}>Day</th>
                                    <th>09:30 - 10:30</th>
                                    <th>10:30 - 11:30</th>
                                    <th>11:30 - 12:30</th>
                                    <th style={{ width: '100px', backgroundColor: '#f8fafc', color: '#64748b' }}>12:30 - 02:00<br />Lunch</th>
                                    <th>02:00 - 03:00</th>
                                    <th>03:00 - 04:00</th>
                                    <th>04:00 - 05:00</th>
                                </tr>
                            </thead>
                            <tbody>
                                {timetable.schedule.map((day, dIndex) => {
                                    // Separate periods into buckets - EXACT LOGIC FROM PRINCIPAL DASHBOARD
                                    const morning = day.periods.filter(p => !p.time.includes('12:30 - ') && !p.time.includes('02:00') && !p.time.includes('03:') && !p.time.includes('04:') && p.type !== 'Break');
                                    // Afternoon includes 2:00, 3:00, 4:00 starts.
                                    const afternoon = day.periods.filter(p => p.time.startsWith('02:') || p.time.startsWith('03:') || p.time.startsWith('04:'));

                                    const renderBlock = (periods) => (
                                        <div style={{ display: 'flex', height: '100%', gap: '4px', position: 'relative' }}>
                                            {periods.map((p, i) => {
                                                const originalIndex = day.periods.indexOf(p);
                                                const effectiveFaculty = (p.faculty && p.faculty !== 'N/A') ? p.faculty : null;
                                                const isMine = effectiveFaculty === currentUser?.name;
                                                const isOccupied = effectiveFaculty && !isMine;

                                                return (
                                                    <div
                                                        key={i}
                                                        onClick={() => handleSlotClick(dIndex, originalIndex, p)}
                                                        style={{
                                                            cursor: 'pointer',
                                                            flex: p.credits || 1,
                                                            backgroundColor: isMine ? '#3b82f6' : (p.type === 'Lab' ? '#e6f4ff' : (p.type === 'Theory' ? '#fffbeb' : (p.type === 'Free' ? '#f4f4f5' : '#ffffff'))),
                                                            color: isMine ? 'white' : 'inherit',
                                                            border: isMine ? '2px solid #2563eb' : (isOccupied ? '1px solid #cbd5e1' : '1px solid #e2e8f0'),
                                                            borderRadius: '6px',
                                                            padding: '4px',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            overflow: 'hidden',
                                                            minWidth: 0,
                                                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                                            transition: 'transform 0.1s',
                                                            opacity: isOccupied ? 0.9 : 1
                                                        }}
                                                        title={isMine ? 'Release' : (isOccupied ? `Occupied by ${effectiveFaculty}` : 'Book/Claim')}
                                                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                                                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                                    >
                                                        <div style={{ fontWeight: '600', fontSize: '0.8rem', lineHeight: '1.2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                                                            {p.subject}
                                                        </div>

                                                        {p.subject !== '-' && (
                                                            <>
                                                                {effectiveFaculty && (
                                                                    <div style={{ fontSize: '0.7rem', color: isMine ? '#bfdbfe' : '#2563eb', fontWeight: 'bold' }}>
                                                                        {effectiveFaculty}
                                                                    </div>
                                                                )}
                                                                <div style={{ fontSize: '0.7rem', color: isMine ? '#dbeafe' : '#059669', marginTop: '1px' }}>
                                                                    {p.ltp || ''}
                                                                </div>
                                                                <div style={{ fontSize: '0.65rem', color: isMine ? '#93c5fd' : '#94a3b8' }}>
                                                                    ({p.time})
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                            {periods.length === 0 && <span style={{ color: '#ccc' }}>Free</span>}
                                        </div>
                                    );

                                    return (
                                        <tr key={dIndex} style={{ height: '80px' }}>
                                            <td style={{ fontWeight: 'bold' }}>{day.day}</td>
                                            <td colSpan={3} style={{ padding: '6px', verticalAlign: 'middle' }}>
                                                {renderBlock(morning)}
                                            </td>

                                            {/* Lunch Cell */}
                                            <td style={{ backgroundColor: '#f1f5f9', color: '#cbd5e1', fontWeight: 'bold', minWidth: '80px', fontSize: '0.8rem', borderBottom: '1px solid #f1f5f9' }}>
                                                BREAK
                                            </td>

                                            {/* Afternoon Cell - Spans 3 hour columns */}
                                            <td colSpan={3} style={{ padding: '6px', verticalAlign: 'middle', borderBottom: '1px solid #f1f5f9' }}>
                                                {renderBlock(afternoon)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
                        <h3>No timetable found</h3>
                        <p>No schedule has been generated for {selectedSemester} yet.</p>
                    </div>
                )
            )}
        </div>
    );
}
function AttendanceModal({ selectedClass, onClose, currentUser }) {
    const [students, setStudents] = useState([]);
    const [attendanceMap, setAttendanceMap] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch students for this class (semester)
        fetch(`${API_BASE_URL}/api/attendance/students?semester=${encodeURIComponent(selectedClass.semester)}`)
            .then(res => res.json())
            .then(data => {
                setStudents(data);
                // Default all to Present
                const initialMap = {};
                data.forEach(s => initialMap[s._id] = 'Present');
                setAttendanceMap(initialMap);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, [selectedClass]);

    const handleToggle = (studentId) => {
        setAttendanceMap(prev => ({
            ...prev,
            [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present'
        }));
    }

    const handleSubmit = async () => {
        const records = students.map(s => ({
            studentId: s._id,
            rollNumber: s.rollNumber,
            name: s.name,
            status: attendanceMap[s._id]
        }));

        const payload = {
            date: new Date().toISOString().split('T')[0],
            subject: selectedClass.subject,
            semester: selectedClass.semester,
            room: selectedClass.room,
            facultyId: currentUser._id, // Assuming user object has _id
            facultyName: currentUser.name,
            periodTime: selectedClass.time,
            records
        };

        try {
            const res = await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                alert('Attendance Saved Successfully!');
                onClose();
            } else {
                alert('Failed to save attendance');
            }
        } catch (error) {
            console.error(error);
            alert('Error saving attendance');
        }
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '700px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0 }}>Mark Attendance</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    <div>
                        <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{selectedClass.subject}</div>
                        <div>{selectedClass.semester}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{new Date().toDateString()}</div>
                        <div>{students.length} Students Enrolled</div>
                    </div>
                </div>

                <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    {loading ? <p style={{ padding: '2rem', textAlign: 'center' }}>Loading students...</p> : (
                        <table className="clean-table" style={{ width: '100%' }}>
                            <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 1, borderBottom: '1px solid #e2e8f0' }}>
                                <tr>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Roll No</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Student Name</th>
                                    <th style={{ textAlign: 'center', padding: '1rem' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(student => (
                                    <tr key={student._id} style={{ background: attendanceMap[student._id] === 'Absent' ? '#fef2f2' : 'white', borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '0.8rem 1rem' }}>{student.rollNumber}</td>
                                        <td style={{ padding: '0.8rem 1rem' }}>{student.name}</td>
                                        <td style={{ textAlign: 'center', padding: '0.8rem 1rem' }}>
                                            <button
                                                onClick={() => handleToggle(student._id)}
                                                style={{
                                                    padding: '0.35rem 1rem',
                                                    borderRadius: '6px',
                                                    border: '1px solid transparent',
                                                    cursor: 'pointer',
                                                    fontWeight: '600',
                                                    fontSize: '0.85rem',
                                                    background: attendanceMap[student._id] === 'Present' ? '#dcfce7' : '#fee2e2',
                                                    color: attendanceMap[student._id] === 'Present' ? '#166534' : '#991b1b',
                                                    minWidth: '90px',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {attendanceMap[student._id] === 'Present' ? '✔ Present' : '✖ Absent'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {students.length === 0 && <tr><td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }}>No students found for {selectedClass.semester}</td></tr>}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="modal-actions" style={{ marginTop: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ marginRight: 'auto', fontSize: '0.9rem', display: 'flex', gap: '1rem' }}>
                        <span style={{ color: 'green', fontWeight: '600', background: '#dcfce7', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>P: {Object.values(attendanceMap).filter(s => s === 'Present').length}</span>
                        <span style={{ color: 'red', fontWeight: '600', background: '#fee2e2', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>A: {Object.values(attendanceMap).filter(s => s === 'Absent').length}</span>
                    </div>
                    <button className="btn-outline" onClick={onClose}>Cancel</button>
                    <button className="btn" onClick={handleSubmit}>Submit Attendance</button>
                </div>
            </div>
        </div>
    )
}

// --- Booking Form Component (Reused/Shared) ---
function BookingForm({ initialData, facultyList, onSubmit, onCancel }) {
    const [subject, setSubject] = useState(initialData.currentSubject);
    const [mainFaculty, setMainFaculty] = useState(initialData.faculty);
    const [assistants, setAssistants] = useState(initialData.assistants || []);

    const isLab = subject.toLowerCase().includes('lab') || subject.toLowerCase().includes('workshop') || subject.toLowerCase().includes('project');

    // Group Faculty
    const contractFaculty = facultyList.filter(f => f.type === 'Contract' || f.designation === 'Contract');
    const regularFaculty = facultyList.filter(f => f.type !== 'Contract' && f.designation !== 'Contract');

    // Helper to render options
    const renderFacultyOptions = () => (
        <>
            <optgroup label="Regular Faculty (Recommended Main)">
                {regularFaculty.map(f => <option key={f._id} value={f.name}>{f.name}</option>)}
            </optgroup>
            <optgroup label="Contract Faculty">
                {contractFaculty.map(f => <option key={f._id} value={f.name}>{f.name}</option>)}
            </optgroup>
        </>
    );

    const handleAssistantChange = (e) => {
        const options = e.target.options;
        const selected = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) selected.push(options[i].value);
        }
        setAssistants(selected);
    };

    const handleSubmit = () => {
        if (isLab) {
            // STRICT VALIDATION FOR LABS

            // 1. Check Assistant Count
            if (assistants.length !== 2) {
                alert(`Policy: Labs require exactly 2 Assistants. You selected ${assistants.length}.`);
                return;
            }

            // 2. Check Main Faculty is Regular
            const mainFacObj = facultyList.find(f => f.name === mainFaculty);
            const isMainRegular = mainFacObj && (mainFacObj.type !== 'Contract' && mainFacObj.designation !== 'Contract');
            if (!isMainRegular) {
                if (!confirm("Warning: Main Faculty for Labs should ideally be a Permanent/Regular Faculty member. Selected: Contract. Continue?")) return;
            }

            // 3. Check Assistants are Contract
            const assistantObjs = facultyList.filter(f => assistants.includes(f.name));
            const contractAssistantsCount = assistantObjs.filter(f => f.type === 'Contract' || f.designation === 'Contract').length;

            if (contractAssistantsCount < 2) {
                if (!confirm(`Warning: It is recommended to take 2 Contract Faculty as assistants. You have selected ${contractAssistantsCount} contract faculty. Continue?`)) return;
            }
        }
        onSubmit({ subject, faculty: mainFaculty, assistants });
    };

    return (
        <div>
            <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Subject Name</label>
                <input
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="e.g., Data Structures"
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #ccc' }}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Main Faculty (1)</label>
                    <select
                        value={mainFaculty}
                        onChange={e => setMainFaculty(e.target.value)}
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    >
                        <option value="">-- Select Main Faculty --</option>
                        {renderFacultyOptions()}
                    </select>
                </div>
            </div>

            {isLab && (
                <div style={{ marginTop: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                        Lab Assistants (Select 2 - Contract Faculty Preferred)
                        <span style={{ fontSize: '0.8rem', fontWeight: 'normal', display: 'block', color: '#666' }}>Hold Ctrl/Cmd to select multiple</span>
                    </label>
                    <select
                        multiple
                        value={assistants}
                        onChange={handleAssistantChange}
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #ccc', height: '120px' }}
                    >
                        <optgroup label="Contract Faculty (Recommended)">
                            {contractFaculty.filter(f => f.name !== mainFaculty).map(f => (
                                <option key={f._id} value={f.name}>{f.name}</option>
                            ))}
                        </optgroup>
                        <optgroup label="Regular Faculty">
                            {regularFaculty.filter(f => f.name !== mainFaculty).map(f => (
                                <option key={f._id} value={f.name}>{f.name}</option>
                            ))}
                        </optgroup>
                    </select>
                    <p style={{ fontSize: '0.8rem', color: '#2563eb', marginTop: '5px' }}>
                        Selected Assistants: {assistants.length} ({assistants.join(', ') || 'None'})
                    </p>
                </div>
            )}

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button className="btn-outline" onClick={onCancel}>Cancel</button>
                <button className="btn-primary" onClick={handleSubmit}>Confirm Booking</button>
            </div>
        </div>
    );
}

export default FacultyDashboard
