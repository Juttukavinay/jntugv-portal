const Timetable = require('../models/timetableModel');
const Faculty = require('../models/facultyModel');
const Subject = require('../models/subjectModel');

async function handleOfflineRequest(question) {
    const q = question.toLowerCase();

    // 1. Clash Detection
    if (q.includes('clash') || q.includes('conflict') || q.includes('double book')) {
        return await detectClashes();
    }

    // 2. Faculty Search
    if (q.includes('where is') || q.includes('professor') || q.includes('faculty')) {
        return await searchFaculty(q);
    }

    // 3. Room Search
    if (q.includes('room') || q.includes('hall') || q.includes('lab')) {
        return await searchRoom(q);
    }

    // 4. General Stats
    if (q.includes('how many') || q.includes('total') || q.includes('stats')) {
        return await getUniversityStats();
    }

    // Default Fallback
    return "Greetings. I am your JNTU-GV Academic Assistant. While my advanced neural processing (Gemini) is currently restricted, I can still provide authoritative data from our internal records. 

I am specialized in:
- ** Timetable Audit **: Ask me to 'Check for clashes'.
- ** Faculty Directory **: Inquire about a specific professor, e.g., 'Where is Professor Smith?'.
- ** Facility Management **: Ask for 'Room availability' or hall locations.
- ** Institutional Metrics **: Request 'University statistics'.

How may I assist you with your academic inquiries today ? ";
}

async function detectClashes() {
    const all = await Timetable.find({});
    let clashes = [];
    const facultyMap = {}; // faculty -> { day -> [ {time, semester} ] }

    all.forEach(t => {
        t.schedule.forEach(day => {
            day.periods.forEach(p => {
                if (p.faculty && p.faculty !== 'N/A' && p.faculty !== '') {
                    if (!facultyMap[p.faculty]) facultyMap[p.faculty] = {};
                    if (!facultyMap[p.faculty][day.day]) facultyMap[p.faculty][day.day] = [];

                    // Check for overlap in existing records for this faculty
                    const existing = facultyMap[p.faculty][day.day];
                    existing.forEach(entry => {
                        if (checkOverlap(entry.time, p.time)) {
                            clashes.push(`⚠️ Conflict: **${p.faculty}** is scheduled for both **${t.className}** and **${entry.semester}** at the same time (**${p.time}**) on **${day.day}**.`);
                        }
                    });

                    facultyMap[p.faculty][day.day].push({ time: p.time, semester: t.className });
                }
            });
        });
    });

    if (clashes.length === 0) return "✅ System Scan Complete: No timetable clashes detected in any department!";
    return "🔍 **Clash Detection Results:**\n\n" + clashes.join('\n');
}

async function searchFaculty(q) {
    const profs = await Faculty.find({});
    let target = null;
    for (const f of profs) {
        if (q.includes(f.name.toLowerCase())) {
            target = f;
            break;
        }
    }

    if (!target) return "I couldn't find a professor with that name in my directory. Please use their full name.";

    const timetables = await Timetable.find({});
    let schedules = [];
    timetables.forEach(t => {
        t.schedule.forEach(day => {
            day.periods.forEach(p => {
                if (p.faculty === target.name) {
                    schedules.push(`- **${day.day}**: ${p.time} (${t.className} - ${p.subject})`);
                }
            });
        });
    });

    if (schedules.length === 0) return `Results for **${target.name}**:\n- Designation: ${target.designation}\n- Department: ${target.department}\n- Status: No active classes scheduled.`;

    return `📅 **Schedule for ${target.name} (${target.designation}):**\n\n` + schedules.join('\n');
}

async function searchRoom(q) {
    const rooms = await Timetable.distinct('schedule.periods.room');
    const validRooms = rooms.filter(r => r && r !== '');

    if (validRooms.length === 0) return "No room assignments found in the database yet.";

    return "🏢 **Room Directory:**\n" + validRooms.map(r => `- ${r}`).join('\n') + "\n\nAsk me about a specific room like 'Who is in Room 101?'";
}

async function getUniversityStats() {
    const [fCount, sCount, dCount] = await Promise.all([
        Faculty.countDocuments(),
        Subject.countDocuments(),
        Timetable.countDocuments()
    ]);

    return `📊 **JNTU-GV University Portfolio:**\n- Total Faculty Members: ${fCount}\n- Total Registered Subjects: ${sCount}\n- Active Timetables Generated: ${dCount}\n- Department Leadership: Fully Configured.`;
}

function checkOverlap(time1, time2) {
    const parse = (tStr) => {
        const [s, e] = tStr.split(' - ');
        const toM = (str) => {
            let [h, m] = str.split(':').map(Number);
            // Handle 12h-ish format if present, but based on server data it looks like 24h strings
            return h * 60 + m;
        }
        return { start: toM(s), end: toM(e) };
    }
    try {
        const t1 = parse(time1);
        const t2 = parse(time2);
        return (t1.start < t2.end) && (t2.start < t1.end);
    } catch (e) {
        return false;
    }
}

module.exports = { handleOfflineRequest };
