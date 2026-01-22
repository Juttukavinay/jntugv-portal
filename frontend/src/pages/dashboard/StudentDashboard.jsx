import { useState, useEffect } from 'react'
import API_BASE_URL from '../../config'
import { useNavigate } from 'react-router-dom'
import '../../App.css'

function StudentDashboard() {
    const navigate = useNavigate()
    const [currentUser, setCurrentUser] = useState(null)
    const [myTimetable, setMyTimetable] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('overview')
    const [currentClass, setCurrentClass] = useState(null)
    const [currentTime, setCurrentTime] = useState(new Date())

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user')) || { name: 'Student', role: 'student', email: '21131A0501', semester: 'III-B.Tech I Sem' }
        setCurrentUser(user)
        fetchMySchedule(user.semester || 'III-B.Tech I Sem')

        // Clock timer
        const timer = setInterval(() => setCurrentTime(new Date()), 60000); // update every min
        return () => clearInterval(timer);
    }, [])

    useEffect(() => {
        if (myTimetable.length > 0) determineCurrentClass();
    }, [myTimetable, currentTime])

    const determineCurrentClass = () => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = days[currentTime.getDay()];
        const daySchedule = myTimetable.find(d => d.day === today);

        if (daySchedule) {
            // Simple string matching for time ranges (e.g. "09:00 - 09:50")
            // This is a rough estimation for demo UI dynamic feel
            const currentHour = currentTime.getHours();
            // Mock logic: Find period that roughly spans current hour
            const period = daySchedule.periods.find((p, idx) => {
                // assume 9 starts at index 0, 10 at index 1... for simplicity or parse string
                // Let's just pick the first one for "Now" if morning, or random for demo
                return false;
            });
            // Fallback for visual demo:
            if (currentHour >= 9 && currentHour <= 16) {
                setCurrentClass(daySchedule.periods[Math.floor(Math.random() * daySchedule.periods.length)] || null)
            } else {
                setCurrentClass(null)
            }
        }
    }

    const fetchMySchedule = (semester) => {
        setLoading(true)
        fetch(`${API_BASE_URL}/api/timetables?semester=${encodeURIComponent(semester)}`)
            .then(res => res.json())
            .then(data => {
                if (data && data.schedule) {
                    setMyTimetable(data.schedule)
                } else {
                    setMyTimetable([])
                }
                setLoading(false)
            })
            .catch(err => {
                console.error(err);
                setLoading(false)
            })
    }

    const logout = () => {
        localStorage.removeItem('user')
        navigate('/login', { replace: true })
    }

    // --- Components ---

    const OverviewTab = () => (
        <div style={{ animation: 'fadeIn 0.5s' }}>
            <div className="grid-3-col" style={{ gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Attendance Card */}
                <div className="card overview-card" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', color: 'white' }}>
                    <h3>Average Attendance</h3>
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '1rem' }}>
                        <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                            {/* SVG Circle */}
                            <svg width="80" height="80" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="10" />
                                <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="10" strokeDasharray="283" strokeDashoffset={283 - (283 * 0.85)} strokeLinecap="round" />
                            </svg>
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>85%</div>
                        </div>
                        <div style={{ marginLeft: '1.5rem' }}>
                            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Total Classes: 124</div>
                            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Present: 105</div>
                        </div>
                    </div>
                </div>

                {/* CGPA Card */}
                <div className="card overview-card" style={{ background: 'white', color: '#1e293b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h3 style={{ color: '#64748b', fontSize: '1rem' }}>Overall CGPA</h3>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1e293b' }}>8.4</div>
                            <span style={{ fontSize: '0.8rem', color: '#16a34a' }}>+0.2 from last sem</span>
                        </div>
                        <div style={{ fontSize: '3rem', opacity: 0.1 }}>🎓</div>
                    </div>
                </div>

                {/* Next/Current Class */}
                <div className="card overview-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <h3 style={{ color: '#f59e0b', fontSize: '1rem' }}>Current Session</h3>
                    {currentClass ? (
                        <div style={{ marginTop: '1rem' }}>
                            <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{currentClass.subject}</div>
                            <div style={{ color: '#64748b' }}>{currentClass.room || 'Room 304'} • {currentClass.faculty || 'Unassigned'}</div>
                            <div style={{ marginTop: '0.5rem', display: 'inline-block', padding: '4px 8px', background: '#fffbeb', color: '#b45309', borderRadius: '4px', fontSize: '0.8rem' }}>
                                {currentClass.time}
                            </div>
                        </div>
                    ) : (
                        <div style={{ marginTop: '1rem', color: '#94a3b8' }}>No class currently in session.</div>
                    )}
                </div>
            </div>

            <div className="grid-2-col" style={{ gap: '2rem' }}>
                <div className="card">
                    <h3>📚 My Subjects (Current Sem)</h3>
                    <ul style={{ padding: 0, listStyle: 'none', marginTop: '1rem' }}>
                        {['Data Structures', 'Create & Manage Cloud Resources', 'Machine Learning', 'English'].map((s, i) => (
                            <li key={i} style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center' }}>
                                <div style={{ width: 10, height: 10, background: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899'][i % 4], borderRadius: '50%', marginRight: '1rem' }}></div>
                                <div style={{ flex: 1 }}>{s}</div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>3 Credits</div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="card">
                    <h3>📝 Upcoming Events / Work</h3>
                    {/* Empty State visual */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#94a3b8' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                        <div>No pending assignments</div>
                    </div>
                </div>
            </div>
        </div>
    )

    const TimetableTab = () => (
        <div style={{ animation: 'slideIn 0.3s' }}>
            <h3 style={{ marginBottom: '1rem' }}>Weekly Class Schedule</h3>
            {loading ? <p>Loading schedule...</p> : (
                <div className="card" style={{ overflowX: 'auto' }}>
                    <table className="clean-table student-tt">
                        <thead>
                            <tr>
                                <th style={{ background: '#f8fafc' }}>Day / Time</th>
                                {['09:00', '10:00', '11:00', '12:00', '02:00', '03:00', '04:00'].map(t => <th key={t}>{t}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {myTimetable.map((day, i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 'bold' }}>{day.day}</td>
                                    {day.periods.map((p, j) => (
                                        <td key={j} className={p.type === 'Lab' ? 'cell-lab' : 'cell-theory'}>
                                            <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{p.subject}</div>
                                            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{p.room}</div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )

    return (
        <div className="dashboard-layout" style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
            {/* Sidebar */}
            <aside style={{ width: '250px', background: 'white', borderRight: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <img src="/jntugv-logo.png" alt="Logo" style={{ width: '40px', height: 'auto' }} />
                    <div>
                        <h2 style={{ fontSize: '1.2rem', margin: 0, color: '#1e293b' }}>JNTU-GV</h2>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Student Portal</span>
                    </div>
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {[
                        { id: 'overview', label: 'Overview', icon: '🏠' },
                        { id: 'timetable', label: 'My Timetable', icon: '📅' },
                        { id: 'results', label: 'Exam Results', icon: '📊' },
                        { id: 'library', label: 'Library Books', icon: '📖' },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            style={{
                                background: activeTab === item.id ? '#1e293b' : 'transparent',
                                color: activeTab === item.id ? 'white' : '#64748b',
                                border: 'none', textAlign: 'left', padding: '12px 16px', borderRadius: '8px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', fontWeight: '500', transition: 'all 0.2s'
                            }}
                        >
                            <span>{item.icon}</span> {item.label}
                        </button>
                    ))}
                </nav>

                <div style={{ marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{currentUser?.name || 'Student'}</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{currentUser?.email}</div>
                        </div>
                    </div>
                    <button onClick={logout} style={{ marginTop: '1rem', width: '100%', padding: '8px', border: '1px solid #e2e8f0', background: 'white', borderRadius: '6px', cursor: 'pointer', color: '#ef4444' }}>Sign Out</button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', margin: 0, color: '#1e293b' }}>
                            {activeTab === 'overview' ? 'Dashboard' : activeTab === 'timetable' ? 'My Schedule' : 'Exam Results'}
                        </h1>
                        <p style={{ color: '#64748b', margin: '0.5rem 0 0 0' }}>{new Date().toDateString()}</p>
                    </div>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        🔔
                    </div>
                </header>

                {activeTab === 'overview' && <OverviewTab />}
                {activeTab === 'timetable' && <TimetableTab />}
                {activeTab === 'results' && <div className="card"><h3>Exam Results</h3><p>No results published recently.</p></div>}
            </main>
        </div>
    )
}

export default StudentDashboard
