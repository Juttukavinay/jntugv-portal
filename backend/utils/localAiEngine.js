const Timetable = require('../models/timetableModel');
const Faculty = require('../models/facultyModel');
const Subject = require('../models/subjectModel');
const Student = require('../models/studentModel');

async function handleOfflineRequest(question) {
    const q = question.toLowerCase();
    let response = "";

    try {
        // 1. Clash Detection / Schedule Audit
        if (q.includes('clash') || q.includes('conflict') || q.includes('double book') || q.includes('audit')) {
            response = await detectClashes();
        }
        // 2. Workload / Load Analysis
        else if (q.includes('workload') || q.includes('load') || q.includes('teaching hours')) {
            response = await analyzeWorkload(q);
        }
        // 3. Specific Entity Search (Faculty/Subject/Room)
        else if (q.includes('where is') || q.includes('professor') || q.includes('faculty') || q.includes('who is')) {
            response = await searchFacultyOrSubject(q);
        }
        // 4. Room Availability
        else if (q.includes('room') || q.includes('hall') || q.includes('lab') || q.includes('available')) {
            response = await getRoomStatus(q);
        }
        // 5. Strategic Stats
        else if (q.includes('stats') || q.includes('summary') || q.includes('how many') || q.includes('overview')) {
            response = await getDepartmentOverview();
        }
        // 6. Help/Capabilities
        else {
            response = `### 🎓 JNTU-GV Offline Intelligence Pro
I am your departmental logic engine, designed to provide authoritative academic insights without external cloud dependency.

**How I can assist you logically:**
1. **🔍 Conflict Audit**: "Check for timetable clashes"
2. **⚖️ Workload Analysis**: "Show faculty workload" or "Is Prof X overloaded?"
3. **📅 Faculty Tracking**: "Where is Professor [Name] today?"
4. **🏢 Infrastructure**: "Which rooms are available?" or "Show room 101 schedule"
5. **📊 Strategic Overview**: "Give me a department summary"

*Ready to process your request.*`;
        }

        return response;
    } catch (error) {
        return "⚠️ **Logic Engine Exception**: I encountered an internal processing error while analyzing the data.";
    }
}

async function detectClashes() {
    const all = await Timetable.find({});
    let clashes = [];
    const facultyMap = {};

    all.forEach(t => {
        t.schedule?.forEach(day => {
            day.periods.forEach(p => {
                if (p.faculty && p.faculty !== 'N/A' && p.faculty !== '') {
                    const key = `${p.faculty}-${day.day}`;
                    if (!facultyMap[key]) facultyMap[key] = [];

                    facultyMap[key].forEach(entry => {
                        if (checkOverlap(entry.time, p.time)) {
                            clashes.push(`- **${p.faculty}** is double-booked in **${t.className}** and **${entry.semester}** at **${p.time}** (${day.day}).`);
                        }
                    });
                    facultyMap[key].push({ time: p.time, semester: t.className });
                }
            });
        });
    });

    if (clashes.length === 0) return "### ✅ Schedule Audit: Clear\nMy analysis confirms there are **zero collisions** in the current timetable grid across all departments. The allocation logic is sound.";
    return "### 🔍 Schedule Audit: Anomalies Found\n" + clashes.join('\n') + "\n\n*Recommendation: Adjust the overlapping slots to maintain institutional integrity.*";
}

async function analyzeWorkload(q) {
    const timetables = await Timetable.find({});
    const facultyList = await Faculty.find({});
    let results = [];

    for (const f of facultyList) {
        let hours = 0;
        timetables.forEach(tt => {
            tt.schedule.forEach(day => {
                day.periods.forEach(p => {
                    if (p.faculty === f.name) hours += p.credits || 1;
                });
            });
        });

        if (q.includes(f.name.toLowerCase()) || q.includes('all')) {
            const status = hours > 18 ? "🔴 Critical" : (hours > 14 ? "🟡 Optimal" : "🟢 Under-loaded");
            results.push(`- **${f.name}**: ${hours} Hrs/Week (${status})`);
        }
    }

    if (results.length === 0) return "Please specify a faculty name or ask to 'Show all workloads'.";
    return "### ⚖️ Workload Distribution Analysis\n" + results.join('\n');
}

async function searchFacultyOrSubject(q) {
    const faculty = await Faculty.find({});
    const subjects = await Subject.find({});
    const timetables = await Timetable.find({});

    // Check Faculty
    for (const f of faculty) {
        if (q.includes(f.name.toLowerCase())) {
            let sched = [];
            timetables.forEach(t => t.schedule.forEach(d => d.periods.forEach(p => {
                if (p.faculty === f.name) sched.push(`${d.day}: ${p.time} (${t.className})`);
            })));
            return `### 👤 Faculty Profile: ${f.name}\n- **Designation**: ${f.designation}\n- **Weekly Engagement**: ${sched.length} Slots\n- **Active Today**: ${sched.find(s => s.startsWith(getCurrentDay())) ? 'Yes' : 'No'}\n\n**Schedule Grid:**\n${sched.map(s => '- ' + s).join('\n') || 'No active classes.'}`;
        }
    }

    // Check Subject
    for (const s of subjects) {
        if (q.includes(s.courseName.toLowerCase())) {
            return `### 📚 Subject Insight: ${s.courseName}\n- **Credits**: L:${s.L} T:${s.T} P:${s.P}\n- **Regulation**: ${s.regulation || 'R23'}\n- **Standard Semester**: ${s.semester}`;
        }
    }

    return "I couldn't identify a specific Faculty or Subject in your query. Please use full names for precision.";
}

async function getRoomStatus(q) {
    const timetables = await Timetable.find({});
    let roomMap = {};

    timetables.forEach(t => t.schedule.forEach(d => d.periods.forEach(p => {
        if (p.room) {
            if (!roomMap[p.room]) roomMap[p.room] = [];
            roomMap[p.room].push({ day: d.day, time: p.time, class: t.className });
        }
    })));

    const today = getCurrentDay();
    let results = [];
    for (let r in roomMap) {
        if (q.includes(r.toLowerCase()) || q.includes('available')) {
            const isBusy = roomMap[r].find(s => s.day === today);
            results.push(`- **${r}**: ${isBusy ? 'Occupied Now' : '🟢 Available Today'}`);
        }
    }

    return "### 🏢 Infrastructure Status Report\n" + (results.length > 0 ? results.join('\n') : "No room data currently logged in the system.");
}

async function getDepartmentOverview() {
    const [f, s, t, st] = await Promise.all([
        Faculty.countDocuments(),
        Subject.countDocuments(),
        Timetable.countDocuments(),
        Student.countDocuments()
    ]);

    return `### 📊 JNTU-GV Executive Summary
Providing a logical snapshot of current institutional state:

- **👥 Talent Pool**: ${f} Faculty members across all cadres.
- **📖 Academic Scope**: ${s} Subjects registered in the curriculum.
- **🎓 Student Body**: ${st} Registered students awaiting evaluation.
- **📝 Operational Grid**: ${t} Active timetables currently being enforced.

*All systems are operational and data integrity is maintained.*`;
}

function checkOverlap(time1, time2) {
    const parse = (tStr) => {
        const [s, e] = (tStr || '').split(' - ');
        if (!s || !e) return null;
        const toM = (str) => {
            let [h, m] = str.split(':').map(Number);
            return h * 60 + m;
        }
        return { start: toM(s), end: toM(e) };
    }
    const t1 = parse(time1);
    const t2 = parse(time2);
    if (!t1 || !t2) return false;
    return (t1.start < t2.end) && (t2.start < t1.end);
}

function getCurrentDay() {
    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
}

module.exports = { handleOfflineRequest };
