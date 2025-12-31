import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import '../../App.css'

// --- DEPARTMENT / HOD MANAGEMENT (Principal keeps this?) ---
// User said "shift to hod", but Principal often manages HODs.
// I will keep HOD assignment for Principal as that's usually a Principal task.
function DepartmentList() {
    const [departments, setDepartments] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [editingDept, setEditingDept] = useState(null);

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/departments?t=${Date.now()}`).then(res => res.json()).then(setDepartments).catch(console.error);
        fetch(`${API_BASE_URL}/api/faculty`).then(res => res.json()).then(setFaculty).catch(console.error);
    }, []);

    const updateHod = async (deptName, facultyId) => {
        if (!facultyId) return;
        await fetch('/api/departments/assign-hod', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deptName, facultyId })
        });
        const res = await fetch(`${API_BASE_URL}/api/departments`);
        setDepartments(await res.json());
        setEditingDept(null);
    };

    return (
        <div className="full-width-container">
            <div className="full-width-header">
                <h4 style={{ margin: 0 }}>Departments & HODs (Principal Access)</h4>
            </div>
            <div className="full-table-wrapper">
                <table className="clean-table">
                    <thead>
                        <tr>
                            <th>Department</th>
                            <th>Head of Department (HOD)</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {departments.map(dept => (
                            <tr key={dept._id}>
                                <td style={{ fontWeight: 'bold' }}>{dept.name}</td>
                                <td>
                                    {editingDept === dept.name ? (
                                        <select
                                            onChange={(e) => updateHod(dept.name, e.target.value)}
                                            defaultValue=""
                                        >
                                            <option value="" disabled>Select Faculty</option>
                                            {faculty.map(f => (
                                                <option key={f._id} value={f._id}>{f.name}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span style={{ color: dept.hodName ? 'inherit' : '#999' }}>
                                            {dept.hodName ? `👤 ${dept.hodName}` : 'No HOD Assigned'}
                                        </span>
                                    )}
                                </td>
                                <td>
                                    {editingDept === dept.name ? (
                                        <button className="btn-sm btn-outline" onClick={() => setEditingDept(null)}>Cancel</button>
                                    ) : (
                                        <button className="btn-sm" onClick={() => setEditingDept(dept.name)}>
                                            {dept.hodName ? 'Change' : 'Assign'}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function PrincipalDashboard() {
    const [activeTab, setActiveTab] = useState('overview')

    const renderContent = () => {
        switch (activeTab) {
            case 'students': return <StudentListViewOnly />
            case 'faculty': return <FacultyListViewOnly />
            case 'subjects': return <SubjectListViewOnly />
            case 'timetables': return <TimetableStatsViewOnly />
            case 'departments': return <DepartmentList />
            default: return <DashboardOverview onNavigate={setActiveTab} />
        }
    }

    return (
        <div className="dashboard-layout">
            <header className="top-navbar">
                <div className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src="/jntugv-logo.png" alt="Logo" style={{ width: '40px', height: 'auto' }} />
                    <h2 className="title-gradient logo-text" style={{ margin: 0 }}>JNTU-GV</h2>
                    <span className="badge-role">Principal Portal</span>
                </div>

                <nav className="top-nav-links">
                    <button onClick={() => setActiveTab('overview')} className={activeTab === 'overview' ? 'active' : ''}>Overview</button>
                    <button onClick={() => setActiveTab('students')} className={activeTab === 'students' ? 'active' : ''}>Students</button>
                    <button onClick={() => setActiveTab('faculty')} className={activeTab === 'faculty' ? 'active' : ''}>Faculty</button>
                    <button onClick={() => setActiveTab('departments')} className={activeTab === 'departments' ? 'active' : ''}>Depts/HOD</button>
                    <button onClick={() => setActiveTab('subjects')} className={activeTab === 'subjects' ? 'active' : ''}>Subjects</button>
                    <button onClick={() => setActiveTab('timetables')} className={activeTab === 'timetables' ? 'active' : ''}>Timetables</button>
                </nav>

                <div className="nav-profile">
                    <span className="user-name">Dr. Principal</span>
                    <div className="avatar">P</div>
                    <Link to="/login" className="btn-sm btn-outline" style={{ textDecoration: 'none', marginLeft: '1rem' }}>Logout</Link>
                </div>
            </header>

            <main className="dashboard-content" style={{ padding: ['students', 'faculty', 'subjects', 'departments'].includes(activeTab) ? '0' : '2rem' }}>
                <div className={['students', 'faculty', 'subjects', 'departments'].includes(activeTab) ? 'full-width-wrapper' : 'content-container'}>
                    {renderContent()}
                </div>
            </main>
        </div>
    )
}

function SubjectListViewOnly() {
    const [subjects, setSubjects] = useState([]);
    useEffect(() => {
        fetch(`${API_BASE_URL}/api/subjects?t=${Date.now()}`).then(res => res.json()).then(setSubjects).catch(console.error);
    }, []);

    return (
        <div className="full-width-container">
            <div className="full-width-header">
                <h4>Curriculum (View Only)</h4>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>Modifications restricted to HOD</div>
            </div>
            <div className="full-table-wrapper">
                <table className="clean-table">
                    <thead>
                        <tr>
                            <th>S.No</th>
                            <th>Sem</th>
                            <th>Code</th>
                            <th>Subject Name</th>
                            <th>Credits</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subjects.map((s, i) => (
                            <tr key={i}>
                                <td>{s.sNo}</td>
                                <td>{s.semester}</td>
                                <td>{s.courseCode}</td>
                                <td>{s.courseName}</td>
                                <td>{s.credits}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function DashboardOverview({ onNavigate }) {
    const [stats, setStats] = useState({ students: 0, faculty: 0 });
    useEffect(() => {
        Promise.all([fetch(`${API_BASE_URL}/api/students`), fetch(`${API_BASE_URL}/api/faculty`)]).then(async ([s, f]) => {
            setStats({ students: (await s.json()).length, faculty: (await f.json()).length });
        })
    }, [])
    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.5s' }}>
            <div className="dashboard-header">
                <div>
                    <h2 className="title-gradient">Welcome back, Principal 👋</h2>
                    <p style={{ color: '#64748b' }}>Here's what's happening in your college today.</p>
                </div>
                <div className="date-display">{new Date().toDateString()}</div>
            </div>

            <div className="stats-grid">
                <StatCard title="Total Students" value={stats.students} change="Active Records" />
                <StatCard title="Total Faculty" value={stats.faculty} change="Active Staff" />
                <StatCard title="Attendance" value="92%" change="+2.5% increase" color="green" />
                <StatCard title="Pending Alerts" value="0" change="All clear" color="green" />
            </div>

            <div className="card">
                <h3>Department Overview</h3>
                <p>Select a department below to manage Head of Departments.</p>
                <button className="btn" onClick={() => onNavigate('departments')}>Manage HODs</button>
            </div>
        </div>
    )
}

// Enhanced Student List with Search & Filter
function StudentListViewOnly() {
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterYear, setFilterYear] = useState('All');

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/students`).then(res => res.json()).then(setStudents)
    }, [])

    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesYear = filterYear === 'All' || student.year === filterYear;
        return matchesSearch && matchesYear;
    });

    // Extract unique years dynamically from the student data
    const uniqueYears = [...new Set(students.map(s => s.year))].sort();

    return (
        <div className="full-width-container">
            <div className="full-width-header">
                <h4 style={{ margin: 0 }}>Student Directory</h4>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Search by Name or Roll No..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="modern-input"
                        style={{ padding: '0.4rem 0.8rem', width: '250px' }}
                    />
                    <select
                        value={filterYear}
                        onChange={(e) => setFilterYear(e.target.value)}
                        className="modern-input"
                        style={{ padding: '0.4rem 0.8rem', width: '150px' }}
                    >
                        <option value="All">All Years</option>
                        {uniqueYears.map(year => (
                            <option key={year} value={year}>{year} Year</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="full-table-wrapper">
                <table className="clean-table">
                    <thead>
                        <tr>
                            <th>Roll No</th>
                            <th>Name</th>
                            <th>Year</th>
                            <th>Semester</th>
                            <th>Department</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map(student => (
                                <tr key={student._id}>
                                    <td style={{ fontWeight: '500' }}>{student.rollNumber}</td>
                                    <td>{student.name}</td>
                                    <td>
                                        <span className={`status-badge ${student.year === 'IV' ? 'warning' : 'success'}`}>
                                            {student.year} Year
                                        </span>
                                    </td>
                                    <td>{student.semester}</td>
                                    <td>{student.department}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                                    No students found matching your filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function FacultyListViewOnly() {
    const [faculty, setFaculty] = useState([])
    useEffect(() => {
        fetch(`${API_BASE_URL}/api/faculty`).then(res => res.json()).then(setFaculty)
    }, [])

    return (
        <div className="full-width-container">
            <div className="full-width-header">
                <h4 style={{ margin: 0 }}>Faculty Directory (View Only)</h4>
            </div>
            <div className="full-table-wrapper">
                <table className="clean-table" style={{ minWidth: '1000px' }}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Designation</th>
                            <th>Qualification</th>
                            <th>Mobile</th>
                            <th>Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        {faculty.map(fac => (
                            <tr key={fac._id}>
                                <td>
                                    <div style={{ fontWeight: 'bold' }}>{fac.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{fac.email}</div>
                                </td>
                                <td>{fac.designation}</td>
                                <td>{fac.qualification}</td>
                                <td>{fac.mobileNumber}</td>
                                <td>
                                    <span style={{
                                        padding: '2px 8px', borderRadius: '4px',
                                        background: fac.type === 'Regular' ? '#dcfce7' : '#fef9c3',
                                        color: fac.type === 'Regular' ? '#166534' : '#854d0e',
                                        fontSize: '0.85rem'
                                    }}>{fac.type}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function TimetableStatsViewOnly() {
    const [timetable, setTimetable] = useState(null);
    const [selectedSemester, setSelectedSemester] = useState('I-B.Tech I Sem');

    const fetchTimetable = useCallback(() => {
        setTimetable(null);
        fetch(`${API_BASE_URL}/api/timetables?semester=${encodeURIComponent(selectedSemester)}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) setTimetable(data[0]);
                else if (data && data.schedule) setTimetable(data);
                else setTimetable(null);
            })
            .catch(console.error);
    }, [selectedSemester]);

    useEffect(() => { fetchTimetable(); }, [fetchTimetable]);

    return (
        <div className="full-width-container">
            <div className="full-width-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h4 style={{ margin: 0 }}>Class Timetables (View Only)</h4>
                    <select
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                        style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
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
            </div>

            <div className="full-table-wrapper">
                {timetable ? (
                    <div>
                        <div style={{ textAlign: 'center', padding: '0.75rem', background: '#f8fafc', fontWeight: 'bold', borderBottom: '1px solid #e2e8f0', color: '#334155' }}>
                            {timetable.className} - {selectedSemester}
                        </div>
                        <table className="clean-table" style={{ textAlign: 'center', width: '100%', tableLayout: 'fixed' }}>
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
                                {timetable.schedule.map((day, dIndex) => {
                                    const morning = day.periods.filter(p => !p.time.includes('12:30 - ') && !p.time.includes('02:00') && !p.time.includes('03:') && !p.time.includes('04:') && p.type !== 'Break');
                                    const afternoon = day.periods.filter(p => p.time.startsWith('02') || p.time.startsWith('03') || p.time.startsWith('04'));
                                    const renderBlock = (periods) => (
                                        <div style={{ display: 'flex', height: '100%', gap: '4px' }}>
                                            {periods.map((p, i) => (
                                                <div key={i}
                                                    style={{
                                                        flex: p.credits || 1,
                                                        backgroundColor: p.type === 'Lab' ? '#e6f4ff' : (p.type === 'Theory' ? '#fffbeb' : '#f4f4f5'),
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '6px',
                                                        padding: '4px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: '600',
                                                        overflow: 'hidden',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'center'
                                                    }}
                                                    title={p.subject}
                                                >
                                                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.subject}</div>
                                                    {p.faculty && <div style={{ fontSize: '0.7rem', color: '#2563eb' }}>{p.faculty}</div>}
                                                </div>
                                            ))}
                                        </div>
                                    );
                                    return (
                                        <tr key={dIndex} style={{ height: '80px' }}>
                                            <td style={{ fontWeight: 'bold' }}>{day.day}</td>
                                            <td colSpan={3} style={{ padding: '4px' }}>{renderBlock(morning)}</td>
                                            <td style={{ backgroundColor: '#f1f5f9', fontWeight: 'bold', fontSize: '0.8rem' }}>BREAK</td>
                                            <td colSpan={3} style={{ padding: '4px' }}>{renderBlock(afternoon)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
                        <p>No timetable found for {selectedSemester}.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

function StatCard({ title, value, change, color }) {
    return (
        <div className="card stat-card">
            <span className="stat-title">{title}</span>
            <div className="stat-value">{value}</div>
            <span className="stat-change" style={{ color: color === 'red' || color === 'orange' ? color : 'green' }}>{change}</span>
        </div>
    )
}

export default PrincipalDashboard
