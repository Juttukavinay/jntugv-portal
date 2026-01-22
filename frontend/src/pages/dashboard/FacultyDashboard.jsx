import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import API_BASE_URL from '../../config'
import '../../App.css'

function FacultyDashboard() {
    const navigate = useNavigate()
    const [currentUser, setCurrentUser] = useState(null)
    const [allPeriods, setAllPeriods] = useState([]) // All weekly periods
    const [todaysPeriods, setTodaysPeriods] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('dashboard') // dashboard, my-classes
    const [selectedClass, setSelectedClass] = useState(null) // For attendance modal

    const [mySubject, setMySubject] = useState(''); // State for current faculty's subject
    const [myDesignation, setMyDesignation] = useState(''); // To check for min limit
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar state

    // Simulate getting logged-in user
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user')) || { name: 'Dr. Smith', role: 'faculty' }
        setCurrentUser(user)
    }, [])

    useEffect(() => {
        if (currentUser) {
            fetchMySchedule(currentUser.name)
        }
    }, [currentUser])

    const fetchMySchedule = (facultyName) => {
        setLoading(true)

        // 1. Get All Faculty to find "My Subject"
        // (Ideally, the backend login should return this, but we'll fetch it for now)
        fetch(`${API_BASE_URL}/api/faculty`)
            .then(res => res.json())
            .then(facultyList => {
                // Find current faculty details
                const myProfile = facultyList.find(f => f.email === currentUser.email) || {};
                const subject = myProfile.subject || ''; // e.g., "Computer Networks"
                const designation = myProfile.designation || 'Assistant Professor';
                setMySubject(subject); // Update state for render
                setMyDesignation(designation);

                fetch(`${API_BASE_URL}/api/timetables`)
                    .then(res => res.json())
                    .then(data => {
                        let periods = []
                        const timetables = Array.isArray(data) ? data : [data]

                        timetables.forEach(timetable => {
                            if (!timetable || !timetable.schedule) return
                            timetable.schedule.forEach(day => {
                                day.periods.forEach(period => {
                                    // Match by Faculty Name (Strict booking ownership)
                                    // Robust check with trim()
                                    const isMine = period.faculty && currentUser.name && period.faculty.trim() === currentUser.name.trim();

                                    if (isMine) {
                                        // Estimate credits if missing: Lab -> 3, otherwise 1. 
                                        // The backend usually provides 'credits' for generated items.
                                        let h = period.credits || (period.type === 'Lab' || (period.subject && period.subject.toLowerCase().includes('lab')) ? 3 : 1);
                                        h = Number(h) || 1;

                                        periods.push({
                                            day: day.day,
                                            time: period.time,
                                            subject: period.subject,
                                            semester: timetable.className,
                                            type: period.type,
                                            room: period.room || '',
                                            credits: h
                                        })
                                    }
                                })
                            })
                        })

                        setAllPeriods(periods)

                        // Filter Today's Classes
                        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                        const todayName = days[new Date().getDay()]
                        setTodaysPeriods(periods.filter(p => p.day === todayName))

                        setLoading(false)
                    })
                    .catch(err => {
                        console.error(err)
                        setLoading(false)
                    })
            })
            .catch(err => console.error(err));
    }

    const simpleLogout = () => {
        localStorage.removeItem('user')
        navigate('/login', { replace: true })
        // Force reload to clear any memory states if needed, though replace should suffice for history
    }

    // Stats
    const totalHours = allPeriods.reduce((acc, curr) => acc + (curr.credits || 1), 0);
    const classesToday = todaysPeriods.length;
    const labSessions = allPeriods.filter(p => p.type && p.type.toLowerCase().includes('lab')).length;
    const theorySessions = allPeriods.length - labSessions;

    // Workload Limits
    // Prof = 10, Assoc = 14, Asst = 16 (Default)
    let minWorkload = 16;
    if (myDesignation.toLowerCase().includes('associate')) minWorkload = 14;
    else if (myDesignation.toLowerCase().includes('assistant')) minWorkload = 16;
    else if (myDesignation.toLowerCase().includes('professor')) minWorkload = 10;


    return (
        <div className="dashboard-layout">
            {/* Sidebar Overlay for Mobile */}
            <div
                className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`}
                onClick={() => setIsSidebarOpen(false)}
            />

            {/* Sidebar */}
            <aside className={`dashboard-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div style={{ padding: '2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #1e293b' }}>
                    <img src="/jntugv-logo.png" alt="Logo" style={{ width: '40px', height: 'auto' }} />
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>JNTU-GV</h3>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', letterSpacing: '0.5px' }}>FACULTY PORTAL</span>
                    </div>
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem', overflowY: 'auto' }}>
                    <button onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
                        style={{
                            background: activeTab === 'dashboard' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                            color: activeTab === 'dashboard' ? '#60a5fa' : '#94a3b8',
                            border: 'none', textAlign: 'left', padding: '12px 16px', borderRadius: '8px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem', transition: 'all 0.2s', fontWeight: activeTab === 'dashboard' ? '600' : 'normal'
                        }}>
                        <span>📊</span> Dashboard
                    </button>
                    <button onClick={() => { setActiveTab('my-classes'); setIsSidebarOpen(false); }}
                        style={{
                            background: activeTab === 'my-classes' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                            color: activeTab === 'my-classes' ? '#60a5fa' : '#94a3b8',
                            border: 'none', textAlign: 'left', padding: '12px 16px', borderRadius: '8px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem', transition: 'all 0.2s', fontWeight: activeTab === 'my-classes' ? '600' : 'normal'
                        }}>
                        <span>📅</span> Weekly Schedule
                    </button>
                    <button onClick={() => { setActiveTab('attendance'); setIsSidebarOpen(false); }}
                        style={{
                            background: activeTab === 'attendance' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                            color: activeTab === 'attendance' ? '#60a5fa' : '#94a3b8',
                            border: 'none', textAlign: 'left', padding: '12px 16px', borderRadius: '8px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem', transition: 'all 0.2s', fontWeight: activeTab === 'attendance' ? '600' : 'normal'
                        }}>
                        <span>📝</span> Attendance History
                    </button>
                    <button onClick={() => { setActiveTab('view-timetables'); setIsSidebarOpen(false); }}
                        style={{
                            background: activeTab === 'view-timetables' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                            color: activeTab === 'view-timetables' ? '#60a5fa' : '#94a3b8',
                            border: 'none', textAlign: 'left', padding: '12px 16px', borderRadius: '8px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem', transition: 'all 0.2s', fontWeight: activeTab === 'view-timetables' ? '600' : 'normal'
                        }}>
                        <span>🗓️</span> Dept Timetables
                    </button>
                </nav>

                <div style={{ padding: '1.5rem', borderTop: '1px solid #1e293b', background: '#0f172a' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                        <div style={{ width: 40, height: 40, background: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: 'white' }}>👤</div>
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px', fontSize: '0.9rem' }}>{currentUser?.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Associate Professor</div>
                        </div>
                    </div>
                    <button onClick={simpleLogout} style={{ width: '100%', padding: '10px', background: '#334155', color: '#cbd5e1', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="dashboard-main">
                {/* Header */}
                <header className="dashboard-header">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>☰</button>
                        <div className="greeting">
                            <h1 style={{ fontSize: '1.5rem', color: '#1e293b', margin: 0, fontWeight: '700' }}>Welcome back, {currentUser?.name}! 👋</h1>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • Have a great day.</p>
                        </div>
                    </div>
                    <div>
                        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: 0 }}>
                            ⬇️ <span className="mobile-hide">Download Schedule</span>
                        </button>
                    </div>
                </header>

                <div style={{ padding: '2rem', flex: 1, background: '#f8fafc' }}>
                    {/* Notifications Removed */}


                    {activeTab === 'dashboard' && (
                        <div className="fade-in">
                            {/* Stats Grid */}
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-value">{classesToday}</div>
                                    <div className="stat-label">Classes Today</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-value" style={{ color: totalHours < minWorkload ? '#eab308' : '#22c55e' }}>
                                        {totalHours} <span style={{ fontSize: '1rem', color: '#64748b' }}>/ {minWorkload} h</span>
                                    </div>
                                    <div className="stat-label">Total Load (Min {minWorkload}h)</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-value">{theorySessions}</div>
                                    <div className="stat-label">Theory Periods</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-value">{labSessions}</div>
                                    <div className="stat-label">Lab Sessions</div>
                                </div>
                            </div>

                            {/* Today's Schedule */}
                            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Today's Schedule</h3>

                            {!loading && todaysPeriods.length === 0 ? (
                                <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>☕</div>
                                    <h3>No classes scheduled for today</h3>
                                    <p>Enjoy your free time!</p>
                                </div>
                            ) : (
                                <div className="class-grid">
                                    {todaysPeriods.map((cls, idx) => (
                                        <div key={idx} className="class-card">
                                            <div className="class-card-header">
                                                <div>
                                                    <span className={`badge-pill ${cls.type === 'Lab' ? 'badge-lab' : 'badge-theory'}`}>{cls.type}</span>
                                                </div>
                                                <div style={{ fontWeight: '600', color: 'var(--primary)', fontSize: '1.2rem' }}>{cls.room}</div>
                                            </div>
                                            <div className="class-card-body">
                                                <div className="time-badge">
                                                    <span>⏰</span> {cls.time}
                                                </div>
                                                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>{cls.subject}</h4>
                                                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>{cls.semester}</p>

                                                <button
                                                    className="btn"
                                                    style={{ width: '100%', marginTop: '1.5rem' }}
                                                    onClick={() => setSelectedClass(cls)}
                                                >
                                                    Mark Attendance
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'my-classes' && (
                        <div className="fade-in">
                            <h3 style={{ marginBottom: '1.5rem' }}>Full Weekly Schedule</h3>
                            <div className="table-container">
                                {allPeriods.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
                                        <h3>No classes scheduled</h3>
                                        <p>You have no classes assigned for this week.</p>
                                    </div>
                                ) : (() => {
                                    // Define the standard grid columns (Time Slots) matching dept timetable
                                    const timeSlots = [
                                        "09:30 - 10:30", "10:30 - 11:30", "11:30 - 12:30",
                                        "LUNCH",
                                        "02:00 - 03:00", "03:00 - 04:00", "04:00 - 05:00"
                                    ];

                                    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

                                    // Helper to check if a period matches a time slot
                                    // Handles fuzzy matching like "09:30 - 10:30" vs "9:30-10:30"
                                    const normalizeTime = (t) => t.replace(/\s/g, '').replace(/^0/, '');
                                    const findClass = (dayname, slotTime) => {
                                        if (slotTime === 'LUNCH') return null;
                                        // Find period in allPeriods that matches day and roughly matches time
                                        return allPeriods.find(p =>
                                            p.day === dayname &&
                                            (normalizeTime(p.time) === normalizeTime(slotTime) || p.time.includes(slotTime.split(' - ')[0]))
                                        );
                                    };

                                    return (
                                        <table className="clean-table" style={{ width: '100%', tableLayout: 'fixed', textAlign: 'center' }}>
                                            <thead>
                                                <tr>
                                                    <th style={{ width: '80px' }}>Day</th>
                                                    <th>09:30 - 10:30</th>
                                                    <th>10:30 - 11:30</th>
                                                    <th>11:30 - 12:30</th>
                                                    <th style={{ width: '100px', backgroundColor: '#f8fafc', color: '#64748b' }}>Lunch</th>
                                                    <th>02:00 - 03:00</th>
                                                    <th>03:00 - 04:00</th>
                                                    <th>04:00 - 05:00</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {days.map(day => (
                                                    <tr key={day} style={{ height: '80px' }}>
                                                        <td style={{ fontWeight: 'bold' }}>{day}</td>
                                                        {timeSlots.map((slot, idx) => {
                                                            if (slot === 'LUNCH') {
                                                                return <td key={idx} style={{ backgroundColor: '#f8fafc', fontWeight: 'bold', fontSize: '0.8rem', color: '#64748b' }}>BREAK</td>
                                                            }

                                                            const cls = findClass(day, slot);

                                                            return (
                                                                <td key={idx} style={{ padding: '4px' }}>
                                                                    {cls ? (
                                                                        <div className="fade-in" style={{
                                                                            height: '100%',
                                                                            backgroundColor: cls.type === 'Lab' ? '#e6f4ff' : '#eff6ff',
                                                                            border: `1px solid ${cls.type === 'Lab' ? '#bfdbfe' : '#dbeafe'}`,
                                                                            borderRadius: '6px',
                                                                            padding: '6px',
                                                                            display: 'flex',
                                                                            flexDirection: 'column',
                                                                            justifyContent: 'center',
                                                                            alignItems: 'center',
                                                                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                                                        }}>
                                                                            <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#1e293b', marginBottom: '4px' }}>{cls.subject}</div>
                                                                            <div style={{ fontSize: '0.75rem', color: cls.type === 'Lab' ? '#0369a1' : '#2563eb' }}>
                                                                                {cls.semester}
                                                                            </div>
                                                                            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                                                                                {cls.type === 'Lab' ? 'Practical / Lab' : 'Theory'}
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div style={{ height: '100%', background: 'transparent' }}></div>
                                                                    )}
                                                                </td>
                                                            )
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )
                                })()}
                            </div>
                        </div>
                    )}

                    {activeTab === 'attendance' && (
                        <div className="fade-in">
                            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                                <h3>Attendance History</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>View past attendance records and analytics.</p>
                                <button className="btn-outline" style={{ marginTop: '1rem' }}>View Reports</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'view-timetables' && (
                        <div className="fade-in">
                            <FullTimetableView
                                currentUser={currentUser}
                                mySubject={mySubject}
                                onScheduleUpdate={() => fetchMySchedule(currentUser?.name)}
                            />
                        </div>
                    )}

                    {activeTab === 'book-slots' && (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                            Please use the "Book My Slots" button in the notification above.
                        </div>
                    )}
                </div>
            </main>

            {/* ATTENDANCE MODAL */}
            {selectedClass && (
                <AttendanceModal
                    selectedClass={selectedClass}
                    onClose={() => setSelectedClass(null)}
                    currentUser={currentUser}
                />
            )}


        </div>
    )
}

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
