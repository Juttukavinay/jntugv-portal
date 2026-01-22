import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API_BASE_URL from '../../config'
import '../../App.css'

// --- UPGRADED STUDENT TAB (Full Management) ---
function StudentManager() {
    const [students, setStudents] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalType, setModalType] = useState('') // 'add', 'edit', 'delete'
    const [currentStudent, setCurrentStudent] = useState(null)
    const [formData, setFormData] = useState({ rollNumber: '', name: '', year: '3', semester: '1', department: 'IT' })
    const [activeCourse, setActiveCourse] = useState('B.Tech');
    const [activeYear, setActiveYear] = useState('All');

    const fetchStudents = () => {
        fetch(`${API_BASE_URL}/api/students`)
            .then(res => res.json())
            .then(data => setStudents(data))
            .catch(err => console.error(err))
    }

    useEffect(() => { fetchStudents() }, [])

    const openAddModal = () => {
        setModalType('add')
        setFormData({ rollNumber: '', name: '', year: '3', semester: '1', department: 'IT' })
        setIsModalOpen(true)
    }

    const openEditModal = (student) => {
        setModalType('edit')
        setCurrentStudent(student)
        setFormData({ ...student })
        setIsModalOpen(true)
    }

    const openDeleteModal = (student) => {
        setModalType('delete')
        setCurrentStudent(student)
        setIsModalOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const url = modalType === 'add' ? '/api/students' : `/api/students/${currentStudent._id}`
        const method = modalType === 'add' ? 'POST' : 'PUT'

        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })

        setIsModalOpen(false)
        fetchStudents()
    }

    const confirmDelete = async () => {
        await fetch(`${API_BASE_URL}/api/students/${currentStudent._id}`, { method: 'DELETE' })
        setIsModalOpen(false)
        fetchStudents()
    }

    return (
        <div className="full-width-container">
            <div className="full-width-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <h4 style={{ margin: 0 }}>Student Directory (IT Dept)</h4>
                        {/* Course Toggle */}
                        <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: '8px', padding: '2px' }}>
                            {['B.Tech', 'M.Tech', 'MCA'].map(c => (
                                <button
                                    key={c}
                                    onClick={() => setActiveCourse(c)}
                                    style={{
                                        padding: '4px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                                        background: activeCourse === c ? '#fff' : 'transparent',
                                        color: activeCourse === c ? '#0f172a' : '#64748b',
                                        fontWeight: '600', fontSize: '0.85rem', boxShadow: activeCourse === c ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                                    }}
                                >{c}</button>
                            ))}
                        </div>
                    </div>
                    <button className="btn" onClick={openAddModal}>+ Add Student</button>
                </div>

                {/* Year Filter */}
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
            </div>
            <div className="full-table-wrapper">
                <table className="clean-table">
                    <thead>
                        <tr>
                            <th>Roll No</th>
                            <th>Name</th>
                            <th>Course</th>
                            <th>Year</th>
                            <th>Semester</th>
                            <th>Department</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.filter(s => {
                            const matchesCourse = (s.course === activeCourse) ||
                                (!s.course && (
                                    (activeCourse === 'B.Tech' && s.rollNumber.includes('1A')) ||
                                    (activeCourse === 'M.Tech' && s.rollNumber.includes('1D')) ||
                                    (activeCourse === 'MCA' && s.rollNumber.includes('1F'))
                                ));
                            const matchesYear = activeYear === 'All' || s.year.toString() === activeYear;
                            return matchesCourse && matchesYear;
                        }).map(student => (
                            <tr key={student._id}>
                                <td style={{ fontWeight: 'bold' }}>{student.rollNumber}</td>
                                <td>{student.name}</td>
                                <td>{student.course}</td>
                                <td>{student.year}</td>
                                <td>{student.semester}</td>
                                <td>{student.department}</td>
                                <td>
                                    <div className="action-btns">
                                        <button className="btn-icon" style={{ color: 'blue' }} onClick={() => openEditModal(student)}>✏️</button>
                                        <button className="btn-icon" style={{ color: 'red' }} onClick={() => openDeleteModal(student)}>🗑️</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODALS */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {modalType === 'add' && 'Add New Student'}
                                {modalType === 'edit' && 'Edit Student'}
                                {modalType === 'delete' && 'Confirm Delete'}
                            </h3>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
                        </div>

                        {modalType === 'delete' ? (
                            <div>
                                <p>Are you sure you want to delete <b>{currentStudent?.name}</b>?</p>
                                <div className="modal-actions">
                                    <button className="btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button className="btn" style={{ backgroundColor: 'red' }} onClick={confirmDelete}>Confirm Delete</button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="form-grid">
                                <div className="form-group">
                                    <label>Roll Number</label>
                                    <input required value={formData.rollNumber} onChange={e => setFormData({ ...formData, rollNumber: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Year</label>
                                        <input required value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Semester</label>
                                        <input required value={formData.semester} onChange={e => setFormData({ ...formData, semester: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Department</label>
                                    <select value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}>
                                        <option>IT</option>
                                    </select>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn">Save Student</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

// --- UPGRADED FACULTY TAB (Full Management) ---
function FacultyManager() {
    const [faculty, setFaculty] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalType, setModalType] = useState('')
    const [currentFac, setCurrentFac] = useState(null)
    const [formData, setFormData] = useState({})
    const [facultyWorkload, setFacultyWorkload] = useState({})

    const emptyForm = { sNo: '', name: '', email: '', mobileNumber: '', qualification: '', university: '', gradYear: '', designation: '', dateOfJoining: '', subject: '', type: 'Regular' }

    const fetchFaculty = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/faculty`)
            const data = await res.json()
            setFaculty(data)

            // Also calc workload
            const allTtRes = await fetch(`${API_BASE_URL}/api/timetables`);
            const allTtData = await allTtRes.json();
            const workloads = {};
            if (Array.isArray(allTtData)) {
                allTtData.forEach(tt => {
                    if (!tt.schedule) return;
                    tt.schedule.forEach(day => {
                        day.periods.forEach(p => {
                            if (p.faculty && p.faculty !== 'N/A') {
                                const name = p.faculty;
                                if (!workloads[name]) workloads[name] = { total: 0 };
                                let hours = p.credits || (p.type === 'Lab' || (p.subject && p.subject.toLowerCase().includes('lab')) ? 3 : 1);
                                hours = Number(hours) || 1;
                                workloads[name].total += hours;
                            }
                        });
                    });
                });
            }
            setFacultyWorkload(workloads);
        } catch (e) { console.error(e) }
    }

    useEffect(() => { fetchFaculty() }, [])

    const openAddModal = () => {
        setModalType('add')
        setFormData({ ...emptyForm, sNo: faculty.length + 1 })
        setIsModalOpen(true)
    }

    const openEditModal = (fac) => {
        setModalType('edit')
        setCurrentFac(fac)
        setFormData({ ...fac })
        setIsModalOpen(true)
    }

    const openDeleteModal = (fac) => {
        setModalType('delete')
        setCurrentFac(fac)
        setIsModalOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const url = modalType === 'add' ? '/api/faculty' : `/api/faculty/${currentFac._id}`
        const method = modalType === 'add' ? 'POST' : 'PUT'

        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        setIsModalOpen(false)
        fetchFaculty()
    }

    const confirmDelete = async () => {
        await fetch(`${API_BASE_URL}/api/faculty/${currentFac._id}`, { method: 'DELETE' })
        setIsModalOpen(false)
        fetchFaculty()
    }

    return (
        <div className="full-width-container">
            <div className="full-width-header">
                <h4 style={{ margin: 0 }}>Faculty Management (IT)</h4>
                <button className="btn" onClick={openAddModal}>+ Add Faculty</button>
            </div>
            <div className="full-table-wrapper">
                <table className="clean-table" style={{ minWidth: '1000px' }}>
                    <thead>
                        <tr>
                            <th>S.No</th>
                            <th>Name</th>
                            <th>Designation</th>
                            <th>Workload</th>
                            <th>Mobile</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {faculty.map(fac => (
                            <tr key={fac._id}>
                                <td>{fac.sNo}</td>
                                <td>
                                    <div style={{ fontWeight: 'bold' }}>{fac.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{fac.email}</div>
                                </td>
                                <td>
                                    <span style={{ fontSize: '0.85rem', padding: '2px 8px', borderRadius: '12px', background: '#e2e8f0' }}>{fac.designation}</span>
                                </td>
                                <td>
                                    {(() => {
                                        let min = 16;
                                        const d = (fac.designation || '').toLowerCase();
                                        if (d.includes('associate')) min = 14;
                                        else if (d.includes('assistant')) min = 16;
                                        else if (d.includes('professor')) min = 10;

                                        const load = facultyWorkload[fac.name]?.total || 0;
                                        const isLow = load < min;
                                        return (
                                            <span style={{ fontWeight: 'bold', color: isLow ? '#eab308' : '#22c55e' }}>
                                                {load}h <span style={{ color: '#94a3b8', fontWeight: 'normal', fontSize: '0.8rem' }}>(Min {min})</span>
                                            </span>
                                        );
                                    })()}
                                </td>
                                <td>{fac.mobileNumber}</td>
                                <td>
                                    <div className="action-btns" style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn-sm btn-outline" style={{ color: '#2563eb', borderColor: '#bfdbfe' }} onClick={() => openEditModal(fac)}>Edit</button>
                                        <button className="btn-sm btn-outline" style={{ color: '#ef4444', borderColor: '#fecaca' }} onClick={() => openDeleteModal(fac)}>Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* FACULTY MODALS - Reused from Principle */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {modalType === 'delete' ? 'Confirm Delete' : (modalType === 'add' ? 'Add Faculty' : 'Edit Faculty')}
                            </h3>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
                        </div>

                        {modalType === 'delete' ? (
                            <div>
                                <p>Are you sure you want to delete <b>{currentFac?.name}</b>?</p>
                                <div className="modal-actions">
                                    <button className="btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button className="btn" style={{ backgroundColor: 'red' }} onClick={confirmDelete}>Confirm Delete</button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="form-grid">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>S.No</label>
                                        <input required type="number" value={formData.sNo} onChange={e => setFormData({ ...formData, sNo: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Date of Joining</label>
                                        <input required value={formData.dateOfJoining} onChange={e => setFormData({ ...formData, dateOfJoining: e.target.value })} />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Mobile</label>
                                        <input required value={formData.mobileNumber} onChange={e => setFormData({ ...formData, mobileNumber: e.target.value })} />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Faculty Name</label>
                                    <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Qualification</label>
                                        <input required value={formData.qualification} onChange={e => setFormData({ ...formData, qualification: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>University</label>
                                        <input required value={formData.university} onChange={e => setFormData({ ...formData, university: e.target.value })} />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Grad Year</label>
                                        <input value={formData.gradYear} onChange={e => setFormData({ ...formData, gradYear: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Designation</label>
                                        <input required value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Dept Name</label>
                                        <input required value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Type</label>
                                        <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                            <option>Regular</option>
                                            <option>Contract</option>
                                            <option>Adjunct</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="modal-actions">
                                    <button type="button" className="btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn">{modalType === 'add' ? 'Add Faculty' : 'Update Faculty'}</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

// --- UPGRADED TIMETABLE MANAGER (Full Generation) ---
function TimetableManager() {
    const [timetable, setTimetable] = useState(null)
    const [loading, setLoading] = useState(false)
    const [selectedSemester, setSelectedSemester] = useState('I-B.Tech I Sem')
    const [showPreview, setShowPreview] = useState(false)
    const [previewData, setPreviewData] = useState({ theory: [], labs: [] })
    const [showSettings, setShowSettings] = useState(false)
    const [genOptions, setGenOptions] = useState({
        slotMode: 'dynamic',
        labPlacement: 'afternoon',
        lunchTime: '12:30'
    })
    const [activeCourse, setActiveCourse] = useState('B.Tech');

    // Automatically switch default sem when program changes
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

    useEffect(() => { fetchTimetable() }, [fetchTimetable])

    const handlePreview = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/subjects?semester=${encodeURIComponent(selectedSemester)}`)
            const data = await res.json()
            if (!res.ok) throw new Error(data.message)
            const labs = data.filter(s => s.P >= 2)
            const theory = data.filter(s => s.P < 2)
            setPreviewData({ theory, labs })
            setShowPreview(true)
        } catch (err) { alert('Error fetching subjects: ' + err.message) }
    }

    const generateTimetable = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/timetables/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ semester: selectedSemester, options: genOptions })
            })
            const data = await res.json()
            if (res.ok) {
                if (data.unallocated && data.unallocated.length > 0) {
                    alert(`⚠️ Timetable generated with warnings!\n\nCould not allocate:\n- ${data.unallocated.join('\n- ')}`)
                } else {
                    alert("✅ Timetable Generated Successfully!")
                }
                fetchTimetable()
            } else {
                alert("Error: " + data.message)
            }
        } catch (err) {
            console.error(err)
            alert("Failed to connect to generator.")
        } finally {
            setLoading(false)
        }
    }

    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingSlot, setBookingSlot] = useState(null);
    const [allFaculty, setAllFaculty] = useState([]);

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/faculty`).then(res => res.json()).then(setAllFaculty).catch(console.error);
    }, []);

    const updateCell = (dayIndex, periodIndex, currentSubject) => {
        // Open Modal instead of prompt
        const day = timetable.schedule[dayIndex];
        const period = day.periods[periodIndex];
        setBookingSlot({
            dayIndex,
            periodIndex,
            day: day.day,
            time: period.time,
            currentSubject: period.subject === '-' ? '' : period.subject,
            faculty: period.faculty || '',
            assistants: period.assistants || []
        });
        setShowBookingModal(true);
    }

    const handleConfirmBooking = async (details) => {
        try {
            const res = await fetch('/api/timetables/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dayIndex: bookingSlot.dayIndex,
                    periodIndex: bookingSlot.periodIndex,
                    subject: details.subject || '-',
                    faculty: details.faculty,
                    assistants: details.assistants,
                    semester: selectedSemester
                })
            });
            const data = await res.json();
            if (res.ok) {
                alert('Slot Updated!');
                setShowBookingModal(false);
                fetchTimetable();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (e) {
            console.error(e);
            alert('Failed to update slot');
        }
    }

    return (
        <div className="full-width-container">
            <div className="full-width-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h4 style={{ margin: 0 }}>Academic Timetable Manager</h4>
                    <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: '8px', padding: '2px' }}>
                        {['B.Tech', 'M.Tech', 'MCA'].map(c => (
                            <button
                                key={c}
                                onClick={() => setActiveCourse(c)}
                                style={{
                                    padding: '4px 8px', border: 'none', borderRadius: '4px', cursor: 'pointer',
                                    background: activeCourse === c ? '#fff' : 'transparent',
                                    color: activeCourse === c ? '#0f172a' : '#64748b',
                                    fontWeight: '600', fontSize: '0.8rem'
                                }}
                            >{c}</button>
                        ))}
                    </div>
                    <select
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                        style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                    >
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
                <div style={{ display: 'flex', gap: '10px' }}>
                    {timetable && (
                        <button className="btn" style={{ backgroundColor: '#ef4444', color: 'white', border: 'none' }}
                            onClick={async () => {
                                if (confirm(`⚠️ Delete timetable for ${selectedSemester}?`)) {
                                    await fetch(`${API_BASE_URL}/api/timetables?semester=${encodeURIComponent(selectedSemester)}`, { method: 'DELETE' });
                                    fetchTimetable();
                                }
                            }}>
                            🗑️ Delete
                        </button>
                    )}
                    <button className="btn" onClick={() => setShowSettings(true)} style={{ backgroundColor: '#64748b', color: 'white' }}>⚙️ Settings</button>
                    <button className="btn" onClick={handlePreview} disabled={loading}>{loading ? 'Generating...' : '⚡ Auto-Generate'}</button>
                </div>
            </div>

            <div className="full-table-wrapper">
                {timetable ? (
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
                                const afternoon = day.periods.filter(p => p.time.startsWith('02:') || p.time.startsWith('03:') || p.time.startsWith('04:'));
                                const renderBlock = (periods) => (
                                    <div style={{ display: 'flex', height: '100%', gap: '4px' }}>
                                        {periods.map((p, i) => (
                                            <div key={i} onClick={() => updateCell(dIndex, day.periods.indexOf(p))}
                                                style={{
                                                    flex: p.credits || 1,
                                                    backgroundColor: p.type === 'Lab' ? '#e6f4ff' : (p.type === 'Theory' ? '#fffbeb' : '#f4f4f5'),
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '6px',
                                                    padding: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '600',
                                                    overflow: 'hidden'
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
                ) : (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
                        <p>No timetable found for {selectedSemester}.</p>
                        <button className="btn-primary" onClick={handlePreview}>Generate Now</button>
                    </div>
                )}
            </div>

            {timetable && (
                <div className="full-table-wrapper" style={{ marginTop: '2rem' }}>
                    <h4 style={{ padding: '0 1rem' }}>Faculty Allocation Summary</h4>
                    <table className="clean-table" style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th style={{ width: '60%' }}>Subject</th>
                                <th>Faculty</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(() => {
                                const allocationMap = new Map();
                                timetable.schedule.forEach(day => {
                                    day.periods.forEach(p => {
                                        if (p.subject === '-' || p.type === 'Break' || p.type === 'Free') return;
                                        if (!allocationMap.has(p.subject)) {
                                            allocationMap.set(p.subject, new Set());
                                        }
                                        if (p.faculty && p.faculty !== 'N/A') {
                                            allocationMap.get(p.subject).add(p.faculty);
                                        }
                                        if (p.assistants && Array.isArray(p.assistants)) {
                                            p.assistants.forEach(a => allocationMap.get(p.subject).add(a));
                                        }
                                    });
                                });

                                // Convert to array and sort
                                const rows = Array.from(allocationMap.entries()).map(([sub, facSet]) => ({
                                    subject: sub,
                                    faculty: Array.from(facSet)
                                })).sort((a, b) => a.subject.localeCompare(b.subject));

                                return rows.length > 0 ? rows.map((row, idx) => (
                                    <tr key={idx}>
                                        <td style={{ fontWeight: '500' }}>{row.subject}</td>
                                        <td>
                                            {row.faculty.length > 0 ? (
                                                row.faculty.map((f, i) => (
                                                    <div key={i}>{f}</div>
                                                ))
                                            ) : (
                                                <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not Assigned</span>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="2" style={{ textAlign: 'center', color: '#666' }}>No subjects allocated yet.</td></tr>
                                );
                            })()}
                        </tbody>
                    </table>
                </div>
            )}


            {showBookingModal && bookingSlot && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '600px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0 }}>Edit Slot: {bookingSlot.day} ({bookingSlot.time})</h3>
                            <button onClick={() => setShowBookingModal(false)} style={{ border: 'none', background: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
                        </div>

                        <BookingForm
                            initialData={bookingSlot}
                            facultyList={allFaculty}
                            onSubmit={handleConfirmBooking}
                            onCancel={() => setShowBookingModal(false)}
                        />
                    </div>
                </div>
            )}

            {showSettings && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <h3 className="modal-title">Auto-Generation Settings</h3>
                        <div style={{ marginBottom: '1rem' }}>
                            <label>Slot Mode</label>
                            <select style={{ width: '100%', padding: '0.5rem' }} value={genOptions.slotMode} onChange={e => setGenOptions({ ...genOptions, slotMode: e.target.value })}>
                                <option value="dynamic">Dynamic</option>
                                <option value="1h">1 Hour Fixed</option>
                                <option value="1.5h">1.5 Hour Fixed</option>
                            </select>
                        </div>
                        <button className="btn" onClick={() => setShowSettings(false)}>Done</button>
                    </div>
                </div>
            )}
            {showPreview && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Confirm Subjects</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <h4>Theory</h4>
                                {previewData.theory.map(s => <div key={s._id}>{s.courseName}</div>)}
                            </div>
                            <div>
                                <h4>Labs</h4>
                                {previewData.labs.map(s => <div key={s._id}>{s.courseName}</div>)}
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-outline" onClick={() => setShowPreview(false)}>Cancel</button>
                            <button className="btn" onClick={() => { setShowPreview(false); generateTimetable() }}>Confirm & Generate</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function HodDashboard() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('overview')

    // Subjects State for the SubjectsTab component (moved from outside or redefined here)
    // To save space, we will assume SubjectsTab is defined or we import the logic.
    // For now, I'll use the one defined in Principal dashboard but injected here.
    // Wait, I need a SubjectsTab component. Principal has SubjectList.
    // I will use SubjectList here too as "SubjectsTab".

    const renderContent = () => {
        switch (activeTab) {
            case 'students': return <StudentManager />
            case 'faculty': return <FacultyManager />
            case 'timetable': return <TimetableManager />
            case 'subjects': return <SubjectsTabWrapper />
            default: return <HodOverview onNavigate={setActiveTab} />
        }
    }

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f8fafc' }}>
            {/* Sidebar */}
            <aside style={{ width: '260px', flexShrink: 0, background: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column', height: '100vh' }}>
                <div style={{ padding: '2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #1e293b' }}>
                    <img src="/jntugv-logo.png" alt="Logo" style={{ width: '40px', height: 'auto' }} />
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>JNTU-GV</h2>
                </div>
                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem', overflowY: 'auto' }}>
                    {[
                        { id: 'overview', label: 'Dashboard', icon: '📊' },
                        { id: 'timetable', label: 'Timetable Manager', icon: '📅' },
                        { id: 'faculty', label: 'Faculty Mgmt', icon: '👥' },
                        { id: 'students', label: 'Students', icon: '🎓' },
                        { id: 'subjects', label: 'Curriculum', icon: '📚' },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            style={{
                                background: activeTab === item.id ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                                color: activeTab === item.id ? '#60a5fa' : '#94a3b8',
                                border: 'none', textAlign: 'left', padding: '12px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem', fontWeight: activeTab === item.id ? '600' : 'normal'
                            }}
                        >
                            <span>{item.icon}</span> {item.label}
                        </button>
                    ))}
                </nav>
                <div style={{ padding: '1.5rem', borderTop: '1px solid #1e293b', background: '#0f172a' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>H</div>
                        <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Head of Dept</div>
                            <button
                                onClick={() => {
                                    localStorage.removeItem('user');
                                    navigate('/login', { replace: true });
                                }}
                                style={{ fontSize: '0.75rem', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, height: '100vh', overflowY: 'auto', background: '#f8fafc', padding: '2rem' }}>
                {renderContent()}
            </main>
        </div>
    )
}

function HodOverview({ onNavigate }) {
    // Determine stats
    const [stats, setStats] = useState({ students: 0, faculty: 0, alerts: 2 })
    useEffect(() => {
        // Quick fetch for stats
        Promise.all([fetch(`${API_BASE_URL}/api/students`), fetch(`${API_BASE_URL}/api/faculty`)]).then(async ([s, f]) => {
            const sData = await s.json();
            const fData = await f.json();
            setStats({ students: sData.length, faculty: fData.length, alerts: 2 });
        }).catch(e => console.error(e));
    }, []);

    return (
        <div style={{ animation: 'fadeIn 0.5s', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 className="title-gradient" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome Back, HOD</h2>
                    <p style={{ color: '#64748b', fontSize: '1rem', marginTop: 0 }}>Here's what's happening in your department today.</p>
                </div>
                <div style={{ background: 'white', padding: '0.5rem 1rem', borderRadius: '50px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                    <span>🕒</span>
                    <span style={{ fontWeight: 500 }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                </div>
            </div>

            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div className="card stat-card" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Total Students</div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '5px' }}>{stats.students}</div>
                        </div>
                        <div style={{ fontSize: '2rem', opacity: 0.2 }}>🎓</div>
                    </div>
                </div>

                <div className="card stat-card" style={{ background: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="stat-title">Faculty Members</div>
                            <div className="stat-value" style={{ color: '#0f172a' }}>{stats.faculty}</div>
                        </div>
                        <div style={{ fontSize: '2rem', opacity: 0.1 }}>👥</div>
                    </div>
                </div>

                <div className="card stat-card" style={{ background: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="stat-title">Pending Approvals</div>
                            <div className="stat-value" style={{ color: '#f59e0b' }}>{stats.alerts}</div>
                        </div>
                        <div style={{ fontSize: '2rem', opacity: 0.1 }}>⚠️</div>
                    </div>
                </div>

                <div className="card stat-card" style={{ background: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="stat-title">Avg Attendance</div>
                            <div className="stat-value" style={{ color: '#10b981' }}>87%</div>
                        </div>
                        <div style={{ fontSize: '2rem', opacity: 0.1 }}>📈</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginTop: '2rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#334155' }}>Quick Management Categories</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div onClick={() => onNavigate('timetable')} style={{ cursor: 'pointer', background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', transition: 'transform 0.2s', border: '1px solid #f1f5f9' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div style={{ width: '40px', height: '40px', background: '#eff6ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1rem', color: '#3b82f6' }}>📅</div>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>Manage Timetables</h4>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Create, edit, and publish weekly schedules.</p>
                        </div>

                        <div onClick={() => onNavigate('subjects')} style={{ cursor: 'pointer', background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', transition: 'transform 0.2s', border: '1px solid #f1f5f9' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div style={{ width: '40px', height: '40px', background: '#fef3c7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1rem', color: '#d97706' }}>📚</div>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>Curriculum Setup</h4>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Update subjects, electives, and credits.</p>
                        </div>

                        <div onClick={() => onNavigate('faculty')} style={{ cursor: 'pointer', background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', transition: 'transform 0.2s', border: '1px solid #f1f5f9' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div style={{ width: '40px', height: '40px', background: '#f0fdf4', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1rem', color: '#16a34a' }}>👥</div>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>Faculty Allocations</h4>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Assign tasks and monitor faculty workload.</p>
                        </div>

                        <div onClick={() => onNavigate('students')} style={{ cursor: 'pointer', background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', transition: 'transform 0.2s', border: '1px solid #f1f5f9' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div style={{ width: '40px', height: '40px', background: '#f3e8ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1rem', color: '#9333ea' }}>🎓</div>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>Student Records</h4>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>View lists, attendance, and performance.</p>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#334155' }}>Department Notices</h3>
                    <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                            <div style={{ width: '4px', background: '#ef4444', borderRadius: '2px' }}></div>
                            <div>
                                <h5 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem' }}>Meeting with Principal</h5>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Today, 03:00 PM - Conference Hall</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                            <div style={{ width: '4px', background: '#3b82f6', borderRadius: '2px' }}></div>
                            <div>
                                <h5 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem' }}>Timetable Finalization</h5>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Due by Friday, 5 PM</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ width: '4px', background: '#10b981', borderRadius: '2px' }}></div>
                            <div>
                                <h5 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem' }}>New Faculty Orientation</h5>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Monday, 10:00 AM</p>
                            </div>
                        </div>
                        <button style={{ width: '100%', marginTop: '1.5rem', padding: '0.6rem', border: '1px dashed #cbd5e1', background: 'transparent', borderRadius: '6px', color: '#64748b', cursor: 'pointer' }}>+ Add Notice</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Re-implementing SubjectsTabWrapper by copying SubjectList logic from Principal roughly
// To avoid massive code duplication, I'll rely on the user having told me to MOVE functionality.
// So I will implement a fully functional Subjects Manager here.


function SubjectsTabWrapper() {
    const [viewMode, setViewMode] = useState('list');
    const [subjects, setSubjects] = useState([]);
    const [regulation, setRegulation] = useState('R23');
    const [activeCourse, setActiveCourse] = useState('B.Tech');
    const [courseName, setCourseName] = useState('B.Tech');
    const [semesterName, setSemesterName] = useState('I-B.Tech I Sem');
    const [editRows, setEditRows] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    const fetchSubjects = useCallback(() => {
        fetch(`${API_BASE_URL}/api/subjects?t=${Date.now()}`).then(res => res.json()).then(setSubjects).catch(console.error);
    }, []);

    useEffect(() => { fetchSubjects(); }, [fetchSubjects]);

    useEffect(() => {
        const currentSemSubjects = subjects.filter(s => s.semester === semesterName);
        if (currentSemSubjects.length > 0) {
            setEditRows(currentSemSubjects.map(s => ({ ...s })));
        } else {
            setEditRows([{ sNo: 1, category: 'PC', courseCode: '', courseName: '', L: '', T: '', P: '', credits: '', semester: semesterName }]);
        }
    }, [subjects, semesterName]);

    const handleSubjectChange = (index, field, value) => {
        const newRows = [...editRows];
        newRows[index] = { ...newRows[index], [field]: value };
        setEditRows(newRows);
    }
    const addSubjectRow = () => {
        setEditRows([...editRows, { sNo: editRows.length + 1, category: 'PC', semester: semesterName }]);
    }
    const saveSubjects = async () => {
        const validRows = editRows.filter(r => r.courseName);
        if (validRows.length === 0) return alert("Please fill at least one subject");
        const payload = {
            regulation, activeCourse, courseName, department: 'IT',
            subjects: validRows.map(r => ({ ...r, semester: semesterName }))
        };
        const res = await fetch(`${API_BASE_URL}/api/courses/save`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if ((await res.json()).success) { alert('Saved!'); fetchSubjects(); }
    }

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploading(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`${API_BASE_URL}/api/courses/preview`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                // Map preview subjects to rows
                const mapped = data.subjects.map((s, i) => ({
                    sNo: s.sNo || i + 1,
                    category: s.category || 'PC',
                    courseCode: s.courseCode || '',
                    courseName: s.courseName || '',
                    L: s.L || 0,
                    T: s.T || 0,
                    P: s.P || 0,
                    credits: s.credits || 0,
                    semester: semesterName // Assign to current selected sem
                }));
                setEditRows(mapped);
                alert('✅ Syllabus Parsed! Please review and save.');
            } else {
                alert('❌ Failed to parse: ' + data.message);
            }
        } catch (err) {
            console.error(err);
            alert('Error uploading file');
        } finally {
            setIsUploading(false);
            e.target.value = null; // Reset input
        }
    }

    return (
        <div className="full-width-container">
            <div className="full-width-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <h4 style={{ margin: 0 }}>Curriculum Manager</h4>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <label className="btn-outline" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {isUploading ? '⏳ Parsing...' : '📄 Upload PDF Syllabus'}
                            <input type="file" accept="application/pdf" onChange={handleFileUpload} style={{ display: 'none' }} disabled={isUploading} />
                        </label>
                        <button className="btn-primary" onClick={saveSubjects}>💾 Save Changes</button>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', width: '100%' }}>
                    <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: '8px', padding: '2px' }}>
                        {['B.Tech', 'M.Tech', 'MCA'].map(c => (
                            <button
                                key={c}
                                onClick={() => { setActiveCourse(c); if (c === 'B.Tech') setSemesterName('I-B.Tech I Sem'); else if (c === 'M.Tech') setSemesterName('I-M.Tech I Sem'); else setSemesterName('I-MCA I Sem'); }}
                                style={{
                                    padding: '4px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer',
                                    background: activeCourse === c ? '#fff' : 'transparent',
                                    color: activeCourse === c ? '#0f172a' : '#64748b',
                                    fontWeight: '600', fontSize: '0.85rem', boxShadow: activeCourse === c ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                                }}
                            >{c}</button>
                        ))}
                    </div>

                    <select value={semesterName} onChange={e => setSemesterName(e.target.value)} className="search-input-premium" style={{ width: '200px', backgroundImage: 'none' }}>
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
            </div>

            <div className="full-table-wrapper">
                <table className="clean-table">
                    <thead>
                        <tr>
                            <th style={{ width: '50px' }}>S.No</th>
                            <th>Category</th>
                            <th>Code</th>
                            <th>Subject Title</th>
                            <th>L</th><th>T</th><th>P</th>
                            <th>Credits</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {editRows.map((row, i) => (
                            <tr key={i}>
                                <td><input value={row.sNo || ''} onChange={e => handleSubjectChange(i, 'sNo', e.target.value)} style={{ width: '100%', border: 'none', background: 'transparent' }} /></td>
                                <td>
                                    <select value={row.category || 'PC'} onChange={e => handleSubjectChange(i, 'category', e.target.value)} style={{ width: '100%', border: 'none', background: 'transparent' }}>
                                        <option value="PC">PC</option><option value="BS">BS</option><option value="ES">ES</option><option value="MC">MC</option>
                                    </select>
                                </td>
                                <td><input value={row.courseCode || ''} onChange={e => handleSubjectChange(i, 'courseCode', e.target.value)} style={{ width: '100%', border: 'none', background: 'transparent' }} /></td>
                                <td><input value={row.courseName || ''} onChange={e => handleSubjectChange(i, 'courseName', e.target.value)} style={{ width: '100%', border: 'none', background: 'transparent' }} /></td>
                                <td><input value={row.L || ''} onChange={e => handleSubjectChange(i, 'L', e.target.value)} style={{ width: '30px', border: 'none', background: 'transparent', textAlign: 'center' }} /></td>
                                <td><input value={row.T || ''} onChange={e => handleSubjectChange(i, 'T', e.target.value)} style={{ width: '30px', border: 'none', background: 'transparent', textAlign: 'center' }} /></td>
                                <td><input value={row.P || ''} onChange={e => handleSubjectChange(i, 'P', e.target.value)} style={{ width: '30px', border: 'none', background: 'transparent', textAlign: 'center' }} /></td>
                                <td><input value={row.credits || ''} onChange={e => handleSubjectChange(i, 'credits', e.target.value)} style={{ width: '40px', border: 'none', background: 'transparent', textAlign: 'center', fontWeight: 'bold' }} /></td>
                                <td>
                                    <button onClick={() => {
                                        const newRows = editRows.filter((_, idx) => idx !== i);
                                        setEditRows(newRows);
                                    }} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button onClick={addSubjectRow} style={{ width: '100%', padding: '12px', marginTop: '10px', border: '2px dashed #cbd5e1', background: 'transparent', borderRadius: '8px', color: '#64748b', cursor: 'pointer' }}>+ Add Subject Row</button>
            </div>
        </div>
    )
}

// --- Booking Form Component ---
// --- Booking Form Component ---
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
            <optgroup label="Regular Faculty">
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
        if (isLab && assistants.length !== 2) {
            if (!confirm(`You have selected ${assistants.length} assistants. Usually labs require 2. Continue?`)) return;
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

export default HodDashboard
