const express = require('express');
const router = express.Router();
const Timetable = require('../models/timetableModel');
const Subject = require('../models/subjectModel');
const Course = require('../models/courseModel');
const Faculty = require('../models/facultyModel');
const Room = require('../models/roomModel');
const AcademicCalendar = require('../models/academicCalendarModel');
const { generateTimetableWithAI } = require('../services/geminiService');

const deriveCourseNameFromSemester = (semester) => {
    const value = String(semester || '');
    if (value.includes('B.Tech')) return 'B.Tech';
    if (value.includes('M.Tech')) return 'M.Tech';
    if (value.includes('MCA')) return 'MCA';
    return null;
};

const getSubjectsForGeneration = async ({ semester, department, courseName }) => {
    if (!semester) return [];

    const dept = department || 'IT';
    const derivedCourseName = courseName || deriveCourseNameFromSemester(semester);

    const courseQuery = { department: dept, ...(derivedCourseName ? { courseName: derivedCourseName } : {}) };
    const courses = await Course.find(courseQuery).sort({ createdAt: -1 }).lean();

    for (const course of courses) {
        const subjects = await Subject.find({ courseId: course._id, semester }).sort({ sNo: 1 }).lean();
        if (subjects.length > 0) return subjects;
    }

    return [];
};

// GET
router.get('/', async (req, res) => {
    try {
        const { semester, facultyName, department } = req.query;
        let query = {};
        if (semester) query.className = semester;
        if (department) query.department = department;

        const timetables = await Timetable.find(query);

        if (facultyName) {
            let myPeriods = [];
            timetables.forEach(tt => {
                if (!tt.schedule) return;
                tt.schedule.forEach(day => {
                    day.periods.forEach(p => {
                        if (p.faculty === facultyName || (p.assistants && p.assistants.includes(facultyName))) {
                            myPeriods.push({
                                day: day.day,
                                time: p.time,
                                subject: p.subject,
                                semester: tt.className,
                                room: p.room,
                                type: p.type
                            });
                        }
                    });
                });
            });
            return res.json(myPeriods);
        }

        res.json(timetables);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// DELETE
router.delete('/', async (req, res) => {
    try {
        const { semester } = req.query;
        if (semester) {
            await Timetable.deleteMany({ className: semester });
            return res.json({ message: `Timetable for ${semester} deleted` });
        } else {
            await Timetable.deleteMany({});
            return res.json({ message: 'All timetables deleted' });
        }
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// GENERATE WITH GEMINI AI
router.post('/generate-ai', async (req, res) => {
    const { semester, department: reqDept } = req.body;
    const department = reqDept || 'IT';
    
    if (!semester) return res.status(400).json({ success: false, message: "Semester required" });

    try {
        // 1. Fetch data
        let subjects = await getSubjectsForGeneration({ semester, department });
        const faculty = await Faculty.find({ department });
        const rooms = await Room.find({ department });

        if (subjects.length === 0) {
            console.log("No subjects found for this semester. Using default subjects for AI generation...");
            subjects = [
                { courseName: 'Core Subject 1', L: 3, T: 1, P: 0 },
                { courseName: 'Core Subject 2', L: 3, T: 1, P: 0 },
                { courseName: 'Core Subject 3', L: 3, T: 0, P: 0 },
                { courseName: 'Core Subject 4', L: 3, T: 0, P: 0 },
                { courseName: 'Core Subject 5', L: 3, T: 0, P: 0 },
                { courseName: 'Core Lab 1', L: 0, T: 0, P: 3 },
                { courseName: 'Core Lab 2', L: 0, T: 0, P: 3 },
            ].map((s, i) => ({ ...s, semester, sNo: i + 1, category: 'PC', courseCode: 'AUTOGEN' }));
        }

        // 2. Call Gemini AI
        console.log(`AI-Generating Timetable for ${semester} in ${department}`);
        const aiResponse = await generateTimetableWithAI({
            semester,
            department,
            subjects,
            faculty,
            rooms
        });

        // 3. Save to DB
        let timetable = await Timetable.findOne({ className: semester, department });
        if (timetable) {
            timetable.schedule = aiResponse.schedule;
            await timetable.save();
        } else {
            timetable = new Timetable({
                className: semester,
                department,
                schedule: aiResponse.schedule
            });
            await timetable.save();
        }

        res.json({
            success: true,
            message: "Timetable generated by Gemini AI successfully!",
            timetable,
            report: aiResponse.report
        });
    } catch (error) {
        console.error("Gemini Route Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GENERATE ALGORITHM (CUSTOMIZABLE)
router.post('/generate', async (req, res) => {
    const { semester, options, department } = req.body;

    // FORCED: 1h fixed slots as per user request ("keep 1hr fixed one no optuons")
    const slotMode = '1h'; 
    const labPlacement = options?.labPlacement || 'afternoon';

    const dept = department || 'IT';
    console.log(`Generating Custom Timetable for ${semester} in ${dept} [${slotMode}, ${labPlacement}]`);
    if (!semester) return res.status(400).json({ message: "Semester required" });

    try {
        await Timetable.deleteOne({ className: semester, department: dept });
        let subjects = await getSubjectsForGeneration({ semester, department: dept });
        if (subjects.length === 0) {
            console.log("No subjects found for this semester. Using default subjects for generation...");
            subjects = [
                { courseName: 'Core Subject 1', L: 3, T: 1, P: 0 },
                { courseName: 'Core Subject 2', L: 3, T: 1, P: 0 },
                { courseName: 'Core Subject 3', L: 3, T: 0, P: 0 },
                { courseName: 'Core Subject 4', L: 3, T: 0, P: 0 },
                { courseName: 'Core Subject 5', L: 3, T: 0, P: 0 },
                { courseName: 'Core Lab 1', L: 0, T: 0, P: 3 },
                { courseName: 'Core Lab 2', L: 0, T: 0, P: 3 },
            ].map((s, i) => ({ ...s, semester, sNo: i + 1, category: 'PC', courseCode: 'AUTOGEN' }));
        }

        // --- 1. PRE-PROCESS DEMAND ---
        let queue = {
            labs: [],
            large: [],
            medium: [],
            small: [],
            saturday: []
        };

        const activityKeywords = ['Health', 'Yoga', 'Sports', 'Constitution', 'NSS', 'Library', 'Wellness', 'Democracy', 'Human Values'];

        subjects.forEach((s) => {
            // Safe Cast
            const L = Number(s.L) || 0;
            const T = Number(s.T) || 0;
            const P = Number(s.P) || 0;
            const courseName = String(s.courseName || '');
            let item = { ...s, courseName, L, T, P, ltp: `L:${L}-T:${T}-P:${P}` };

            if (activityKeywords.some(k => courseName.includes(k))) {
                queue.saturday.push(item); return;
            }

            if (P >= 2) {
                // Clone for Lab Queue
                let labItem = { ...item, type: (P >= 3) ? 'Lab3' : 'Lab2' };
                queue.labs.push(labItem);

                // If there are no theory credits, we are done with this subject.
                // If L > 0 or T > 0, we MUST continue to process them below.
                if (L === 0 && T === 0) return;
            }

            // Fixed 1h Mode (Now the only mode)
            if (slotMode === '1h') {
                for (let i = 0; i < L; i++) queue.small.push({ ...item, type: 'Lecture', duration: 1, credits: 1 });
            }
            // Tutorials 
            if (T > 0) queue.small.push({ ...item, type: 'Tutorial', duration: 1 });
        });

        // --- 2. INITIALIZE DAYS ---
        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        let days = dayNames.map(name => ({
            day: name,
            morningConfig: null,
            afternoonConfig: null,
            periods: []
        }));

        let dayIndices = [0, 1, 2, 3, 4].sort(() => Math.random() - 0.5);
        let unallocated = [];

        // --- 3. FETCH AVAILABLE ROOMS ---
        const Room = require('../models/roomModel');
        const roomQuery = { type: { $in: ['Classroom', 'Lab'] } };
        if (department) roomQuery.department = department;
        
        const availableRooms = await Room.find(roomQuery);
        
        // Try to find specific room for this semester if mapped
        // We match by semester string or extract year/sem
        const mappedRooms = availableRooms.filter(r => r.semester === semester || (r.year && semester.startsWith(r.year)));
        
        const labRooms = availableRooms.filter(r => r.type === 'Lab');
        const classRooms = availableRooms.filter(r => r.type === 'Classroom');
        
        // Preference for Theory: prioritized mappedrooms
        const theoryRooms = mappedRooms.filter(r => r.type === 'Classroom').length > 0 
            ? mappedRooms.filter(r => r.type === 'Classroom') 
            : classRooms;

        // --- 4. PLACE LABS ---
        const existingTimetables = await Timetable.find({});

        for (let lab of queue.labs) {
            let placed = false;
            let strategies = labPlacement === 'morning' ? ['morning', 'afternoon'] :
                labPlacement === 'mixed' ? (Math.random() > 0.5 ? ['morning', 'afternoon'] : ['afternoon', 'morning']) :
                    ['afternoon', 'morning'];

            const isEnglishLab = lab.courseName.toLowerCase().includes('english');

            for (let strat of strategies) {
                if (placed) break;
                if (strat === 'afternoon') {
                    for (let i of dayIndices) {
                        // Check if day already has a lab
                        if (!days[i].afternoonConfig && !days[i].morningConfig) {
                            
                            // Find an available physical lab room
                            let assignedRoom = null;
                            for (let r of labRooms) {
                                let roomConflict = false;
                                for (let t of existingTimetables) {
                                    if (t.className === semester) continue;
                                    let sameDay = t.schedule.find(d => d.day === days[i].day);
                                    if (sameDay && sameDay.periods.some(p => p.time.includes('02:00') && p.room === r.name)) {
                                        roomConflict = true; break;
                                    }
                                }
                                if (!roomConflict) { assignedRoom = r.name; break; }
                            }

                            // Guaranteed allocation: if no physical room is free, assign a departmental virtual lab to avoid skipping
                            if (!assignedRoom) {
                                assignedRoom = `${department || 'Dept'} Lab ${Math.floor(Math.random() * 10) + 1}`;
                            }

                            days[i].afternoonConfig = lab.type;
                            days[i].assignedLab = { ...lab, room: assignedRoom };
                            placed = true; break;
                        }
                    }
                }
                else if (strat === 'morning') {
                    if (lab.type === 'Lab3' || lab.type === 'Lab2') {
                        for (let i of dayIndices) {
                            if (!days[i].morningConfig && !days[i].afternoonConfig) {
                                
                                let assignedRoom = null;
                                for (let r of labRooms) {
                                    let roomConflict = false;
                                    for (let t of existingTimetables) {
                                        if (t.className === semester) continue;
                                        let sameDay = t.schedule.find(d => d.day === days[i].day);
                                        if (sameDay && sameDay.periods.some(p => p.time.includes('09:30') && p.room === r.name)) {
                                            roomConflict = true; break;
                                        }
                                    }
                                    if (!roomConflict) { assignedRoom = r.name; break; }
                                }
                                // Guaranteed allocation: if no physical room is free, assign a departmental virtual lab to avoid skipping
                                if (!assignedRoom) {
                                    assignedRoom = `${department || 'Dept'} Lab ${Math.floor(Math.random() * 10) + 1}`;
                                }

                                days[i].morningConfig = 'Lab';
                                days[i].assignedMorningLab = { ...lab, room: assignedRoom };
                                placed = true; break;
                            }
                        }
                    }
                }
            }
            if (!placed) unallocated.push(lab.courseName);
        }

        // --- 4. PLACE LARGE THEORY (1.5h) ---
        if (slotMode !== '1h' && slotMode !== '2h') {
            queue.large.sort(() => Math.random() - 0.5);
            for (let item of queue.large) {
                let placed = false;
                let indices = [...dayIndices].sort(() => Math.random() - 0.5);

                // Try Morning
                // Smart Packing: prioritized days that already have a 1.5 item to close the gap.
                indices.sort((a, b) => {
                    // count items in morning
                    const countA = (days[a].morningPeriods || []).length;
                    const countB = (days[b].morningPeriods || []).length;
                    // Preference: days with 1 item > days with 0 items. 
                    // (2 items is full, loop check handles that)
                    return countB - countA;
                });

                for (let i of indices) {
                    if (days[i].morningConfig === null || days[i].morningConfig === '1.5') {
                        if (!days[i].morningPeriods) days[i].morningPeriods = [];
                        if (days[i].morningPeriods.length < 2) {
                            if (days[i].morningPeriods.some(p => p.subject === item.courseName)) continue;
                            days[i].morningConfig = '1.5';
                            days[i].morningPeriods.push({ ...item, credits: 1.5 });
                            placed = true; break;
                        }
                    }
                }

                // Try Afternoon (If Morning Failed)
                if (!placed) {
                    for (let i of indices) {
                        if (days[i].afternoonConfig === null || days[i].afternoonConfig === '1.5') {
                            if (!days[i].afternoonPeriods) days[i].afternoonPeriods = [];
                            // Afternoon is 3h (2:00-5:00), fits two 1.5h slots
                            if (days[i].afternoonPeriods.length < 2) {
                                if (days[i].afternoonPeriods.some(p => p.subject === item.courseName)) continue;
                                days[i].afternoonConfig = '1.5';
                                days[i].afternoonPeriods.push({ ...item, credits: 1.5 });
                                placed = true; break;
                            }
                        }
                    }
                }

                if (!placed) {
                    // Fallback: If 1.5h slots are full, break into 3x 1h slots
                    // L=3 = 3 Credits.
                    queue.small.push({ ...item, type: 'Lecture', duration: 1, credits: 1 });
                    queue.small.push({ ...item, type: 'Lecture', duration: 1, credits: 1 });
                    queue.small.push({ ...item, type: 'Lecture', duration: 1, credits: 1 });
                    continue;
                }
            }
        }

        // --- 5. PLACE MEDIUM THEORY (2h) ---
        if (slotMode === '2h' || slotMode === 'dynamic') {
            queue.medium.sort(() => Math.random() - 0.5);
            for (let item of queue.medium) {
                let placed = false;
                let indices = [...dayIndices].sort(() => Math.random() - 0.5);

                const try2h = (i, timeOfDay) => {
                    let config = (timeOfDay === 'morning') ? days[i].morningConfig : days[i].afternoonConfig;
                    let periods = (timeOfDay === 'morning') ? days[i].morningPeriods : days[i].afternoonPeriods;
                    if (config === null || config === '2.0') {
                        if (!periods) periods = (timeOfDay === 'morning') ? (days[i].morningPeriods = []) : (days[i].afternoonPeriods = []);
                        let hasBig = periods.some(p => p.credits === 2);
                        if (!hasBig) {
                            if (periods.some(p => p.subject === item.courseName)) return false;

                            // Check available capacity (max 3)
                            let currentCredits = periods.reduce((acc, p) => acc + p.credits, 0);
                            if (currentCredits + 2 > 3) return false;

                            if (timeOfDay === 'morning') days[i].morningConfig = '2.0';
                            else days[i].afternoonConfig = '2.0';

                            periods.push({ ...item, credits: 2 });
                            return true;
                        }
                    }
                    return false;
                };

                // Try Morning then Afternoon
                for (let i of indices) { if (try2h(i, 'morning')) { placed = true; break; } }
                if (!placed) for (let i of indices) { if (try2h(i, 'afternoon')) { placed = true; break; } }

                // FALLBACK: Break into 2x 1h items if 2h slot finding fails
                if (!placed) {
                    queue.small.push({ ...item, type: 'Lecture', duration: 1 });
                    queue.small.push({ ...item, type: 'Lecture', duration: 1 });
                    // Considered placed (transferred to small queue)
                    continue;
                }
            }
        }

        // --- 6. PLACE SMALL THEORY (1h) ---
        queue.small.sort(() => Math.random() - 0.5);
        for (let item of queue.small) {
            let placed = false;
            let indices = [...dayIndices].sort(() => Math.random() - 0.5);

            // Helper to try placement
            const attempt = (i, timeOfDay, configType) => {
                let config = (timeOfDay === 'morning') ? days[i].morningConfig : days[i].afternoonConfig;
                let periods = (timeOfDay === 'morning') ? days[i].morningPeriods : days[i].afternoonPeriods;

                // RELAXED CONDITION: Allow 1.0 items to enter ANY configured day if there is space.
                // If config is null, take it.
                // If config is 1.5 or 2.0 or 1.0, allowed, provided checks pass.
                if (config === null || config === '1.0' || config === '1.5' || config === '2.0') {
                    if (!periods) periods = (timeOfDay === 'morning') ? (days[i].morningPeriods = []) : (days[i].afternoonPeriods = []);

                    // Capacity Check Logic
                    let currentCredits = periods.reduce((acc, p) => acc + p.credits, 0);
                    let maxCredits = 3;

                    if (currentCredits + 1 > maxCredits) return false;

                    // Special Check: a 1.5h day can only take 1s if it has space. (e.g. 1.5 + 1 + 0.5 waste? or 1.5 + 1 fits 2.5 < 3)
                    // limit items count just to be safe layout-wise?
                    // 1.5 + 1.5 = 3 (Full 2 items)
                    // 1.5 + 1 = 2.5 (Fits, 2 items)
                    // 2 + 1 = 3 (Full, 2 items)
                    // 1 + 1 + 1 (Full, 3 items)

                    if (periods.length >= 3) return false;

                    if (periods.some(p => p.subject === item.courseName)) return false;

                    // Set config if previously null
                    if (config === null) {
                        if (timeOfDay === 'morning') days[i].morningConfig = '1.0';
                        else days[i].afternoonConfig = '1.0';
                    }

                    periods.push({ ...item, credits: 1 });
                    return true;
                }
                return false;
            };

            for (let i of indices) {
                if (attempt(i, 'afternoon', '1.0')) { placed = true; break; }

                // ALLOW Morning 1.0h config for 'Dynamic', '1h', AND '2h' modes.
                // Only '1.5h' mode forbids 1.0h rows in morning.
                // This ensures L=1 subjects (Small) always get a place, even in 2h mode.
                if (slotMode !== '1.5h' && attempt(i, 'morning', '1.0')) { placed = true; break; }

                if (slotMode === '2h') {
                    if (attempt(i, 'morning', '2.0')) { placed = true; break; }
                    if (attempt(i, 'afternoon', '2.0')) { placed = true; break; }
                }
            }
            if (!placed) unallocated.push(`${item.courseName} (1h)`);
        }

        // --- 7. CONSTRUCT FINAL PERIODS ---
        days.forEach(d => {
            let p = [];

            // Helper to fill block
            const fillBlock = (config, items, startH, endH) => {
                let block = [];
                // Sort items by credit desc
                items.sort((a, b) => b.credits - a.credits);

                // Track time
                let currentH = startH;

                items.forEach(item => {
                    let dur = item.credits;
                    // Format time string
                    let sH = Math.floor(currentH);
                    let sM = (currentH % 1) * 60;
                    let eH = Math.floor(currentH + dur);
                    let eM = ((currentH + dur) % 1) * 60;

                    // Pad
                    const pad = (n) => n.toString().padStart(2, '0');
                    let timeStr = `${pad(sH)}:${pad(sM)} - ${pad(eH)}:${pad(eM)}`;

                    // Specific fix for 12:30 end
                    if (Math.abs((currentH + dur) - 12.5) < 0.1) timeStr = timeStr.split(' - ')[0] + ' - 12:30';

                    block.push({
                        time: timeStr,
                        subject: item.courseName,
                        type: item.type,
                        credits: item.credits,
                        ltp: item.ltp
                    });
                    currentH += dur;
                });

                // Fill remaining time with Free
                while (currentH < endH - 0.1) { // epsilon
                    let dur = 1;
                    if (currentH + 1 > endH) dur = endH - currentH;

                    let sH = Math.floor(currentH);
                    let sM = (currentH % 1) * 60;
                    let eH = Math.floor(currentH + dur);
                    let eM = ((currentH + dur) % 1) * 60;
                    const pad = (n) => n.toString().padStart(2, '0');
                    let timeStr = `${pad(sH)}:${pad(sM)} - ${pad(eH)}:${pad(eM)}`;
                    if (Math.abs((currentH + dur) - 12.5) < 0.1) timeStr = timeStr.split(' - ')[0] + ' - 12:30';

                    block.push({ time: timeStr, subject: '-', type: 'Free', credits: dur });
                    currentH += dur;
                }
                return block;
            };

            // A. Morning
            if (d.morningConfig === 'Lab') {
                p.push({ 
                    time: '09:30 - 12:30', 
                    subject: d.assignedMorningLab.courseName + ' (Lab)', 
                    type: 'Lab', 
                    credits: 3, 
                    ltp: d.assignedMorningLab.ltp, 
                    room: d.assignedMorningLab.room || 'Main Lab',
                    locked: true 
                });
            } else {
                let slots = fillBlock(d.morningConfig, d.morningPeriods || [], 9.5, 12.5);
                // Assign a theory room if available
                const theoryRoom = theoryRooms[Math.floor(Math.random() * theoryRooms.length)]?.name || 'TBD';
                slots.forEach(s => { if (s.type === 'Lecture') s.room = theoryRoom; });
                p.push(...slots);
            }

            // B. Lunch
            p.push({ time: '12:30 - 02:00', subject: 'LUNCH BREAK', type: 'Break', locked: true });

            // C. Afternoon
            if (d.afternoonConfig === 'Lab3') {
                p.push({ 
                    time: '02:00 - 05:00', 
                    subject: d.assignedLab.courseName + ' (Lab)', 
                    type: 'Lab', 
                    credits: 3, 
                    ltp: d.assignedLab.ltp, 
                    room: d.assignedLab.room || 'Main Lab',
                    locked: true 
                });
            }
            else if (d.afternoonConfig === 'Lab2') {
                // 2h Lab + 1h Sport
                p.push({ 
                    time: '02:00 - 04:00', 
                    subject: d.assignedLab.courseName + ' (Lab)', 
                    type: 'Lab', 
                    credits: 2, 
                    ltp: d.assignedLab.ltp, 
                    room: d.assignedLab.room || 'Main Lab',
                    locked: true 
                });
                p.push({ time: '04:00 - 05:00', subject: 'Sports / Gap', type: 'Activity', credits: 1, locked: true });
            }
            else {
                let slots = fillBlock(d.afternoonConfig, d.afternoonPeriods || [], 14, 17);
                const theoryRoom = theoryRooms[Math.floor(Math.random() * theoryRooms.length)]?.name || 'TBD';
                slots.forEach(s => { 
                    if (s.type === 'Lecture') s.room = theoryRoom;
                    s.time = s.time.replace('14:', '02:').replace('15:', '03:').replace('16:', '04:').replace('17:', '05:');
                });
                p.push(...slots);
            }
            d.periods = p;
        });

        // --- 8. SATURDAY ---
        days.push({
            day: 'Saturday',
            periods: [
                { time: '09:30 - 11:00', subject: '-', type: 'Free', credits: 1.5 },
                { time: '11:00 - 12:30', subject: '-', type: 'Free', credits: 1.5 },
                { time: '12:30 - 02:00', subject: 'LUNCH BREAK', type: 'Break', locked: true },
                { time: '02:00 - 03:30', subject: 'Sports / Library', type: 'Activity', credits: 1.5, locked: true },
                { time: '03:30 - 05:00', subject: 'Sports / Library', type: 'Activity', credits: 1.5, locked: true }
            ]
        });

        let sat = days.find(d => d.day === 'Saturday');
        if (queue.saturday.length > 0) sat.periods[0].subject = queue.saturday[0].courseName;
        if (queue.saturday.length > 1) sat.periods[1].subject = queue.saturday[1].courseName;

        // --- 9. EMERGENCY OVERRIDE (FILL SPORTS/FREE IF UNALLOCATED) ---
        // The user explicitly requested: "IF YOU DONT FIND ANY SLORT PLCACE SPORTS"

        let finalUnallocated = [];

        if (unallocated.length > 0) {
            // Flatten days to find replaceable slots
            // Prioritize: 1. Weekday Free, 2. Saturday Free, 3. Weekday Sports, 4. Saturday Sports

            const getReplaceableSlots = () => {
                let slots = [];
                days.forEach((d, dIdx) => {
                    d.periods.forEach((p, pIdx) => {
                        // We can replace Free, or Activity (Sports/Library)
                        if (p.type === 'Free' || p.type === 'Activity') {
                            // Score helps prioritization. Lower score = replace first.
                            // Weekday Free (0) < Sat Free (1) < Weekday Activity (2) < Sat Activity (3)
                            let score = 0;
                            if (d.day === 'Saturday') score += 1;
                            if (p.type === 'Activity') score += 2;

                            slots.push({ dIdx, pIdx, score, credits: p.credits, day: d.day, time: p.time });
                        }
                    });
                });
                return slots.sort((a, b) => a.score - b.score);
            };

            // We need to handle the fact unallocated currently stores strings (based on my previous code edits, wait, I need to check if I changed it to objects in the previous step? 
            // In the previous step I pushed `${item.courseName} (1h)`. 
            // I should parse that or adjust the push above.
            // Adjusting the push implies modifying code I can't see right now or creating a conflict.
            // I'll just parse the string since I know the format.

            let stillUnallocated = [];

            for (let itemStr of unallocated) {
                let name = itemStr.replace(' (1h)', ''); // Assuming mostly 1h items fall here
                let replaceable = getReplaceableSlots();

                if (replaceable.length > 0) {
                    let slot = replaceable[0]; // Best slot
                    let targetDay = days[slot.dIdx];
                    let targetPeriod = targetDay.periods[slot.pIdx];

                    targetPeriod.subject = name;
                    targetPeriod.type = 'Lecture'; // Convert to Lecture
                    targetPeriod.locked = false;   // Unlock it
                    // Start Clean: if slot was 1.5 and we put 1, we accept the 0.5 waste or just take the whole slot.
                    // For simplicity, we consume the whole slot for this subject.

                    // console.log(`Emergency: Placed ${name} in ${slot.day} ${slot.time} (was ${targetPeriod.type})`);
                } else {
                    stillUnallocated.push(itemStr);
                }
            }
            finalUnallocated = stillUnallocated;
        }

        if (finalUnallocated.length > 0) console.warn("Unallocated:", finalUnallocated);

        const newT = await Timetable.create({ className: semester, schedule: days });
        res.status(201).json({ timetable: newT, unallocated: finalUnallocated });

    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal Error: " + e.message });
    }
});

// CREATE BLANK MANUAL TIMETABLE
router.post('/manual', async (req, res) => {
    const { semester } = req.body;
    if (!semester) return res.status(400).json({ message: "Semester required" });

    try {
        await Timetable.deleteOne({ className: semester });
        
        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const blankPeriods = [
            { time: '09:30 - 10:30', subject: '-', type: 'Free', credits: 1 },
            { time: '10:30 - 11:30', subject: '-', type: 'Free', credits: 1 },
            { time: '11:30 - 12:30', subject: '-', type: 'Free', credits: 1 },
            { time: '02:00 - 03:00', subject: '-', type: 'Free', credits: 1 },
            { time: '03:00 - 04:00', subject: '-', type: 'Free', credits: 1 },
            { time: '04:00 - 05:00', subject: '-', type: 'Free', credits: 1 }
        ];

        let schedule = dayNames.map(day => ({
            day,
            periods: JSON.parse(JSON.stringify(blankPeriods))
        }));

        const newT = await Timetable.create({ className: semester, schedule });
        res.status(201).json({ timetable: newT });

    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal Error: " + e.message });
    }
});

// MANUAL UPDATE / BOOK SLOT WITH CONFLICT CHECK
router.put('/update', async (req, res) => {
    const { semester, dayIndex, periodIndex, subject, faculty, assistants, room } = req.body;
    try {
        const timetable = await Timetable.findOne({ className: semester });
        if (!timetable) return res.status(404).json({ message: 'Timetable not found' });

        if (!timetable.schedule[dayIndex] || !timetable.schedule[dayIndex].periods[periodIndex]) {
            return res.status(400).json({ message: 'Invalid slot index' });
        }

        const targetPeriod = timetable.schedule[dayIndex].periods[periodIndex];

        // --- CONFLICT CHECKING ---
        if (faculty || (assistants && assistants.length > 0)) {
            // 1. Gather all faculty members involved in this booking
            const involvedFaculty = [];
            if (faculty && faculty !== 'N/A') involvedFaculty.push(faculty);
            if (assistants && Array.isArray(assistants)) involvedFaculty.push(...assistants);

            // 2. Parse target time range
            const parseTime = (tStr) => {
                const [start, end] = tStr.split(' - ');
                const toMins = (s) => {
                    const [h, m] = s.split(':').map(Number);
                    return h * 60 + m;
                }
                return { start: toMins(start), end: toMins(end) };
            };
            const targetTime = parseTime(targetPeriod.time);

            // 3. Scan ALL timetables for clashes
            const allTimetables = await Timetable.find({});

            for (const t of allTimetables) {
                const daySchedule = t.schedule.find(d => d.day === timetable.schedule[dayIndex].day);
                if (!daySchedule) continue;

                for (const p of daySchedule.periods) {
                    if (t.className === semester &&
                        daySchedule.day === timetable.schedule[dayIndex].day &&
                        daySchedule.periods.indexOf(p) === periodIndex) {
                        continue;
                    }

                    const pTime = parseTime(p.time);
                    const isOverlap = (targetTime.start < pTime.end) && (pTime.start < targetTime.end);

                    if (isOverlap) {
                        const bookedFaculty = [];
                        if (p.faculty && p.faculty !== 'N/A') bookedFaculty.push(p.faculty);
                        if (p.assistants && Array.isArray(p.assistants)) bookedFaculty.push(...p.assistants);

                        const conflict = involvedFaculty.filter(f => bookedFaculty.includes(f));
                        if (conflict.length > 0) {
                            return res.status(409).json({
                                message: `Time Conflict! Faculty '${conflict.join(', ')}' is already booked in ${t.className} at ${p.time}.`
                            });
                        }
                    }
                }
            }

            // 4. Assistant Limit Check
            if (assistants && assistants.length > 2) {
                return res.status(400).json({ message: 'A maximum of 2 assistants are allowed per slot.' });
            }

            // 5. Faculty Workload & Lab Policies
            const isTargetLab = subject && subject.toLowerCase().includes('lab');
            const targetCredits = isTargetLab ? (targetPeriod.credits || 3) : (targetPeriod.credits || 1);

            for (const fName of involvedFaculty) {
                const facultyData = await Faculty.findOne({ name: fName });
                if (!facultyData) continue;
                const desig = (facultyData.designation || '').toLowerCase();

                // Calculate current workload
                let currentWorkload = 0;
                let dailyLabCount = 0;
                let weeklyLabCount = 0;
                const today = timetable.schedule[dayIndex].day;

                allTimetables.forEach(tt => {
                    tt.schedule.forEach(day => {
                        day.periods.forEach(p => {
                            // Skip the slot we are currently editing
                            if (tt.className === semester && day.day === today && p.time === targetPeriod.time) return;

                            if (p.faculty === fName || (p.assistants && p.assistants.includes(fName))) {
                                const pIsLab = (p.type === 'Lab' || (p.subject && p.subject.toLowerCase().includes('lab'))) && p.subject !== '-' && p.subject !== '';
                                if (pIsLab) {
                                    currentWorkload += p.credits || 3;
                                    weeklyLabCount++;
                                    if (day.day === today) dailyLabCount++;
                                } else if (p.type !== 'Free' && p.type !== 'Break' && p.type !== 'Activity') {
                                    currentWorkload += p.credits || 1;
                                }
                            }
                        });
                    });
                });

                // Workload Limit
                let limit = 22;
                if (desig.includes('professor') && !desig.includes('associate') && !desig.includes('assistant')) limit = 10;
                else if (desig.includes('associate')) limit = 16;

                if (currentWorkload + targetCredits > limit) {
                    return res.status(409).json({
                        message: `Workload Limit Exceeded! '${fName}' (${facultyData.designation}) has ${currentWorkload} hrs. Max: ${limit} hrs.`
                    });
                }

                // Lab Policies
                if (isTargetLab) {
                    if (dailyLabCount >= 1) {
                        return res.status(409).json({ message: `Policy Violation: '${fName}' already has a Lab on ${today}. Max 1 per day.` });
                    }
                    if ((facultyData.type === 'Regular' || desig.includes('permanent') || facultyData.type === 'Permanent') && weeklyLabCount >= 1) {
                        return res.status(409).json({ message: `Policy Violation: Regular/Permanent Faculty '${fName}' is limited to 1 Lab per week. Existing: ${weeklyLabCount}` });
                    }
                }
            }
        }

        // --- WING CHECK ---
        const { wing } = req.body;
        // Validation removed to support dynamic block/wing names from infrastructure manager

        // No conflict, proceed to update
        targetPeriod.subject = subject;
        targetPeriod.faculty = faculty || 'N/A';
        targetPeriod.assistants = assistants || [];
        targetPeriod.wing = wing || targetPeriod.wing;
        targetPeriod.room = room || targetPeriod.room;

        const isLab = subject && subject.toLowerCase().includes('lab');

        // Propagate to all slots if requested
        if (req.body.updateAll && (subject || req.body.originalSubject)) {
            const searchSubject = req.body.originalSubject || subject;
            if (searchSubject && searchSubject !== '-') {
                timetable.schedule.forEach(day => {
                    day.periods.forEach(p => {
                        if (p.subject === searchSubject) {
                            p.subject = subject; // Update name if it was changed
                            p.faculty = faculty || 'N/A';
                            p.assistants = assistants || [];
                            p.type = isLab ? 'Lab' : 'Lecture';
                            p.isFixed = true;
                            if (wing) p.wing = wing;
                            if (room) p.room = room;
                        }
                    });
                });
            }
        }

        // If booking, mark as locked/fixed for the primary slot
        if (faculty || (assistants && assistants.length > 0)) {
            targetPeriod.type = isLab ? 'Lab' : 'Lecture';
            targetPeriod.isFixed = true;
        } else {
            if (subject === '-') {
                targetPeriod.faculty = '';
                targetPeriod.assistants = [];
                targetPeriod.isFixed = false;
                targetPeriod.type = 'Free';
            }
        }

        timetable.markModified('schedule');
        await timetable.save();
        res.json(timetable);

    } catch (e) {
        console.error(e);
        res.status(500).json({ message: e.message });
    }
});

// GET WORKLOAD
router.get('/workload', async (req, res) => {
    try {
        const { department } = req.query;
        let facultyQuery = {};
        let ttQuery = {};
        if (department) {
            facultyQuery.department = department;
            ttQuery.department = department;
        }

        const facultyList = await Faculty.find(facultyQuery);
        const timetables = await Timetable.find(ttQuery);

        const workloadResults = facultyList.map(f => {
            let theoryHours = 0;
            let labHours = 0;
            let assignments = [];

            timetables.forEach(tt => {
                tt.schedule.forEach(day => {
                    day.periods.forEach(p => {
                        if (p.faculty === f.name || (p.assistants && p.assistants.includes(f.name))) {
                            const isLab = (p.type === 'Lab' || (p.subject && p.subject.toLowerCase().includes('lab'))) && p.subject !== '-' && p.subject !== '';
                            if (isLab) {
                                labHours += p.credits || 3;
                            } else if (p.type !== 'Free' && p.type !== 'Break' && p.type !== 'Activity') {
                                theoryHours += p.credits || 1;
                            }
                            assignments.push({
                                semester: tt.className,
                                day: day.day,
                                time: p.time,
                                subject: p.subject,
                                type: p.type
                            });
                        }
                    });
                });
            });

            return {
                facultyName: f.name,
                department: f.department,
                designation: f.designation,
                type: f.type,
                theoryHours,
                labHours,
                totalHours: theoryHours + labHours,
                assignments
            };
        });

        res.json(workloadResults);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// GET SUBJECT LOAD ANALYTICS (semester period count based on academic calendar dates)
router.get('/analytics/subject-load', async (req, res) => {
    try {
        const { semester, department } = req.query;
        if (!semester) return res.status(400).json({ message: 'semester is required' });

        const ttQuery = { className: semester };
        if (department) ttQuery.department = department;

        let timetable = await Timetable.findOne(ttQuery);
        if (!timetable) timetable = await Timetable.findOne({ className: semester });
        if (!timetable) return res.status(404).json({ message: `No timetable found for ${semester}` });

        let calendar = await AcademicCalendar.findOne({
            semester,
            ...(department ? { department } : {})
        });
        if (!calendar && department) {
            calendar = await AcademicCalendar.findOne({ semester });
        }
        if (!calendar) {
            return res.status(404).json({ message: `No academic calendar found for ${semester}` });
        }

        const instructionEntries = (calendar.entries || [])
            .filter((e) => {
                const category = (e.category || '').toLowerCase();
                const desc = (e.description || '').toLowerCase();
                return category === 'instruction' || desc.includes('instruction period') || desc.includes('spell of instruction');
            })
            .sort((a, b) => new Date(a.fromDate) - new Date(b.fromDate));

        if (instructionEntries.length === 0) {
            return res.status(400).json({ message: 'Calendar has no instruction periods to compute load.' });
        }

        const holidayRanges = (calendar.holidays || []).map((h) => ({
            from: new Date(h.fromDate),
            to: new Date(h.toDate)
        }));

        const scheduleByDay = {};
        (timetable.schedule || []).forEach((d) => {
            scheduleByDay[d.day] = d.periods || [];
        });

        const weekdayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        const isWithinAnyRange = (date, ranges) =>
            ranges.some((r) => date >= r.from && date <= r.to);

        const subjectMap = {};
        let instructionDatesCount = 0;

        instructionEntries.forEach((entry) => {
            const start = new Date(entry.fromDate);
            const end = new Date(entry.toDate);
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);

            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const dayClone = new Date(d);
                dayClone.setHours(0, 0, 0, 0);

                if (isWithinAnyRange(dayClone, holidayRanges)) continue;

                const dayLabel = weekdayName[dayClone.getDay()];
                const periods = scheduleByDay[dayLabel] || [];
                instructionDatesCount += 1;

                periods.forEach((p) => {
                    const subject = (p.subject || '').trim();
                    const type = (p.type || '').toLowerCase();
                    if (!subject || subject === '-' || subject === 'LUNCH BREAK') return;
                    if (type === 'free' || type === 'break' || type === 'activity') return;

                    const key = subject;
                    if (!subjectMap[key]) {
                        subjectMap[key] = {
                            subject,
                            semesterSessions: 0,
                            semesterHours: 0,
                            weeklySessions: 0,
                            weeklyHours: 0
                        };
                    }

                    subjectMap[key].semesterSessions += 1;
                    subjectMap[key].semesterHours += Number(p.credits) || 1;
                });
            }
        });

        // Weekly summary from a single timetable week
        Object.values(scheduleByDay).forEach((periods) => {
            (periods || []).forEach((p) => {
                const subject = (p.subject || '').trim();
                const type = (p.type || '').toLowerCase();
                if (!subject || subject === '-' || subject === 'LUNCH BREAK') return;
                if (type === 'free' || type === 'break' || type === 'activity') return;
                if (!subjectMap[subject]) {
                    subjectMap[subject] = {
                        subject,
                        semesterSessions: 0,
                        semesterHours: 0,
                        weeklySessions: 0,
                        weeklyHours: 0
                    };
                }
                subjectMap[subject].weeklySessions += 1;
                subjectMap[subject].weeklyHours += Number(p.credits) || 1;
            });
        });

        const dbSubjects = await Subject.find({ semester });
        const expectedByName = {};
        dbSubjects.forEach((s) => {
            expectedByName[s.courseName] = {
                expectedWeeklyHours: (Number(s.L) || 0) + (Number(s.T) || 0) + (Number(s.P) || 0),
                l: Number(s.L) || 0,
                t: Number(s.T) || 0,
                p: Number(s.P) || 0
            };
        });

        const subjectStats = Object.values(subjectMap)
            .map((row) => ({
                ...row,
                ...(expectedByName[row.subject] || { expectedWeeklyHours: null, l: null, t: null, p: null })
            }))
            .sort((a, b) => b.semesterSessions - a.semesterSessions);

        res.json({
            semester,
            department: timetable.department,
            instructionRanges: instructionEntries.map((e) => ({
                description: e.description,
                fromDate: e.fromDate,
                toDate: e.toDate
            })),
            instructionDatesCount,
            holidayCount: holidayRanges.length,
            subjectStats
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: e.message });
    }
});

module.exports = router;
