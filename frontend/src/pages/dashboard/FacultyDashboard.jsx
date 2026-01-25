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

import GlobalLoader from '../../components/GlobalLoader'
import { createPortal } from 'react-dom'

function FacultyTimetable({ currentUser }) {
    const [timetable, setTimetable] = useState(null)
    const [loading, setLoading] = useState(false)
    const [selectedSemester, setSelectedSemester] = useState('I-B.Tech I Sem')

    // Booking States
    const [bookingSlot, setBookingSlot] = useState(null)
    const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false)

    // Personal Schedule States
    const [mySchedule, setMySchedule] = useState(null)

    const fetchTimetable = useCallback(() => {
        setTimetable(null)
        setLoading(true)
        fetch(`${API_BASE_URL}/api/timetables?semester=${encodeURIComponent(selectedSemester)}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) setTimetable(data[0])
                else if (data && data.schedule) setTimetable(data)
                else setTimetable(null)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [selectedSemester])

    const fetchMySchedule = useCallback(() => {
        // Fetch all timetables and filter by current user's name
        // Ideally this should be a dedicated API endpoint /api/timetables/my-schedule?facultyName=...
        // For now, we reuse the all timetables endpoint or if available.
        // Let's try to mock the filter logic based on all available timetables if possible, 
        // or just rely on the current view for now (optimally we want a real endpoint).
        // I'll implement a robust client-side filter for demonstration if server not ready:
        fetch(`${API_BASE_URL}/api/timetables`)
            .then(res => res.json())
            .then(data => {
                // Aggregate all periods where faculty == currentUser.name
                const allArray = Array.isArray(data) ? data : [data]
                const myPeriods = []
                allArray.forEach(tt => {
                    if (!tt.schedule) return;
                    tt.schedule.forEach(day => {
                        day.periods.forEach(p => {
                            if (p.faculty === currentUser.name) {
                                myPeriods.push({
                                    day: day.day,
                                    time: p.time,
                                    subject: p.subject,
                                    semester: tt.className || tt.semester, // Fallback
                                    room: p.room
                                })
                            }
                        })
                    })
                })
                setMySchedule(myPeriods)
            })
    }, [currentUser])

    useEffect(() => {
        fetchTimetable();
        if (currentUser) fetchMySchedule();
    }, [fetchTimetable, fetchMySchedule, currentUser]);

    const handleSlotClick = (dayIndex, periodIndex, periodData) => {
        // Only allow booking if slot is free or assigned to self (to edit)
        // Adjust logic as needed. The prompt says "assign part class to their as classes".
        // Let's assume one can overwrite or book empty slots.

        // Find existing data
        const day = timetable.schedule[dayIndex];
        const period = day.periods[periodIndex];

        setBookingSlot({
            dayIndex,
            periodIndex,
            day: day.day,
            time: period.time,
            currentSubject: period.subject === '-' ? '' : period.subject,
            currentFaculty: period.faculty,
            semester: selectedSemester
        })
        setIsAllocationModalOpen(true)
    }

    const handleAllocationSuccess = () => {
        setIsAllocationModalOpen(false)
        fetchTimetable()
        fetchMySchedule()
    }

    return (
        <div className="glass-table-container">
            <div className="table-header-premium">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h3>Class Timetable (Book Slots)</h3>
                    <select
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                        className="search-input-premium"
                        style={{ width: '220px', padding: '0.5rem' }}
                    >
                        <option value="I-B.Tech I Sem">I Year - I Sem</option>
                        <option value="I-B.Tech II Sem">I Year - II Sem</option>
                        <option value="II-B.Tech I Sem">II Year - I Sem</option>
                        <option value="II-B.Tech II Sem">II Year - II Sem</option>
                        <option value="III-B.Tech I Sem">III Year - I Sem</option>
                        <option value="III-B.Tech II Sem">III Year - II Sem</option>
                        <option value="IV-B.Tech I Sem">IV Year - I Sem</option>
                        <option value="IV-B.Tech II Sem">IV Year - II Sem</option>
                        <option value="I-M.Tech I Sem">M.Tech I-I Sem</option>
                        <option value="I-MCA I Sem">MCA I-I Sem</option>
                    </select>
                </div>
                <button className="btn-action" onClick={fetchTimetable} disabled={loading}>
                    {loading ? 'Refreshing...' : '🔄 Refresh'}
                </button>
            </div>
            
            {loading && <GlobalLoader />}

            {/* BOOKING GRID */}
            <div style={{ padding: '1rem', overflowX: 'auto' }}>
                {timetable ? (
                    <table className="premium-table" style={{ textAlign: 'center', minWidth: '1000px' }}>
                        <thead>
                            <tr>
                                <th>Day</th>
                                <th>09:30-10:30</th>
                                <th>10:30-11:30</th>
                                <th>11:30-12:30</th>
                                <th style={{ background: '#f8fafc', width: '50px' }}>Lunch</th>
                                <th>02:00-03:00</th>
                                <th>03:00-04:00</th>
                                <th>04:00-05:00</th>
                            </tr>
                        </thead>
                        <tbody>
                            {timetable.schedule.map((day, dIndex) => {
                                const morning = day.periods.filter(p => !p.time.includes('12:30') && !p.time.startsWith('02') && !p.time.startsWith('03') && !p.time.startsWith('04'));
                                const afternoon = day.periods.filter(p => p.time.startsWith('02') || p.time.startsWith('03') || p.time.startsWith('04'));

                                const renderBlock = (periods, baseIndex = 0) => (
                                    <div style={{ display: 'flex', gap: '4px', height: '100%' }}>
                                        {periods.map((p, i) => {
                                            // We need correct index in original array. 
                                            // Assuming order is preserved, morning is 0,1,2. Afternoon is 3,4,5 usually?
                                            // ACTUALLY: periods is a filtered subset. We need the real index in day.periods to update.
                                            const realIndex = day.periods.indexOf(p);

                                            return (
                                                <div key={i}
                                                    onClick={() => handleSlotClick(dIndex, realIndex, p)}
                                                    style={{
                                                        flex: p.credits || 1,
                                                        background: p.type === 'Lab' ? '#eff6ff' : (p.type === 'Theory' ? '#fffbeb' : '#f4f4f5'),
                                                        padding: '8px',
                                                        borderRadius: '6px',
                                                        border: '1px solid #e2e8f0',
                                                        fontSize: '0.8rem',
                                                        minHeight: '60px',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        transition: 'transform 0.1s',
                                                    }}
                                                    title="Click to Book/Edit"
                                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                >
                                                    <div style={{ fontWeight: '700', color: '#1e293b' }}>{p.subject}</div>
                                                    {p.faculty ? (
                                                        <div style={{ fontSize: '0.75rem', color: '#3b82f6', marginTop: '2px', fontWeight: '600' }}>
                                                            {p.faculty === currentUser.name ? '👤 You' : p.faculty}
                                                        </div>
                                                    ) : (
                                                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontStyle: 'italic' }}>Available</div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                );

                                return (
                                    <tr key={dIndex}>
                                        <td style={{ fontWeight: '700', color: '#334155' }}>{day.day}</td>
                                        <td colSpan={3} style={{ padding: '6px' }}>{renderBlock(morning)}</td>
                                        <td style={{ background: '#f1f5f9', fontWeight: 'bold', fontSize: '0.75rem', color: '#94a3b8', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>LUNCH</td>
                                        <td colSpan={3} style={{ padding: '6px' }}>{renderBlock(afternoon)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #e2e8f0' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📅</div>
                        <h3>No timetable found for this semester</h3>
                    </div>
                )}
            </div>

            {/* MY PERSONAL SCHEDULE SECTION */}
            <div style={{ marginTop: '3rem', padding: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ padding: '8px', borderRadius: '8px', background: '#f0fdf4', color: '#16a34a' }}><Icons.Calendar /></div>
                    <h3 style={{ margin: 0 }}>My Weekly Schedule</h3>
                </div>

                {!mySchedule || mySchedule.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>You have no classes allocated yet.</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                        {mySchedule.map((cls, idx) => (
                            <div key={idx} style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #3b82f6', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#64748b' }}>{cls.day}</span>
                                    <span style={{ background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' }}>{cls.time}</span>
                                </div>
                                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{cls.subject}</h4>
                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{cls.semester} • {cls.room || 'N/A'}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ALLOCATION MODAL */}
            {isAllocationModalOpen && bookingSlot && createPortal(
                <AllocationModal
                    slot={bookingSlot}
                    currentUser={currentUser}
                    onClose={() => setIsAllocationModalOpen(false)}
                    onSuccess={handleAllocationSuccess}
                />,
                document.body
            )}
        </div>
    )
}

function AllocationModal({ slot, currentUser, onClose, onSuccess }) {
    const [status, setStatus] = useState('idle') // idle, submitting, success
    const [subject, setSubject] = useState(slot.currentSubject)
    const [assignToMe, setAssignToMe] = useState(true)

    const handleConfirm = async () => {
        setStatus('submitting')
        try {
            const res = await fetch(`${API_BASE_URL}/api/timetables/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    semester: slot.semester,
                    dayIndex: slot.dayIndex,
                    periodIndex: slot.periodIndex,
                    subject: subject || 'Free', // or whatever logic
                    faculty: assignToMe ? currentUser.name : '', // If toggle off, maybe clear or keep? Assuming "Me" for now.
                    // If we want to allow assigning OTHERS, we need a dropdown. The prompt says "allocated by themselves", so Self is priority.
                })
            })

            if (res.ok) {
                setStatus('success')
                setTimeout(() => {
                    onSuccess()
                }, 1500) // Wait for animation
            } else {
                alert('Booking failed')
                setStatus('idle')
            }
        } catch (e) {
            console.error(e)
            setStatus('idle')
        }
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-panel" style={{ maxWidth: '400px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>

                {status === 'success' ? (
                    <div className="success-animation" style={{ padding: '2rem' }}>
                        <div style={{
                            width: '80px', height: '80px', margin: '0 auto 1rem',
                            borderRadius: '50%', background: '#22c55e', color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '3rem', boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)'
                        }}>
                            ✓
                        </div>
                        <h3 style={{ color: '#16a34a' }}>Slot Booked!</h3>
                        <p style={{ color: '#64748b' }}>You have successfully assigned this class.</p>
                    </div>
                ) : (
                    <>
                        <h3 style={{ marginTop: 0 }}>Confirm Allocation</h3>
                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                            {slot.semester} • {slot.day} • {slot.time}
                        </p>

                        <div style={{ textAlign: 'left', margin: '1.5rem 0' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 'bold' }}>Subject</label>
                            <input
                                className="modern-input"
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                                placeholder="Enter Subject Name"
                                style={{ width: '100%', marginBottom: '1rem' }}
                            />

                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={assignToMe}
                                    onChange={e => setAssignToMe(e.target.checked)}
                                    style={{ width: '18px', height: '18px' }}
                                />
                                <span>Assign to <b>{currentUser.name}</b> (Me)</span>
                            </label>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button className="btn-action" onClick={onClose} disabled={status === 'submitting'}>Cancel</button>
                            <button
                                className="btn-action primary"
                                onClick={handleConfirm}
                                disabled={status === 'submitting' || !subject}
                                style={{ minWidth: '120px' }}
                            >
                                {status === 'submitting' ? '...' : 'Confirm'}
                            </button>
                        </div>
                    </>
                )}
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
