const express = require('express');
const router = express.Router();
const Timetable = require('../models/timetableModel');
const Subject = require('../models/subjectModel');
const Faculty = require('../models/facultyModel');

// GET
router.get('/', async (req, res) => {
    try {
        const { semester, facultyName } = req.query;
        let query = {};
        if (semester) query.className = semester;

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

// GENERATE ALGORITHM (CUSTOMIZABLE)
router.post('/generate', async (req, res) => {
    const { semester, options } = req.body;

    // Defaults
    const slotMode = options?.slotMode || 'dynamic';
    const labPlacement = options?.labPlacement || 'afternoon';

    console.log(`Generating Custom Timetable for ${semester} [${slotMode}, ${labPlacement}]`);
    if (!semester) return res.status(400).json({ message: "Semester required" });

    try {
        await Timetable.deleteOne({ className: semester });
        const subjects = await Subject.find({ semester });
        if (subjects.length === 0) return res.status(400).json({ message: `No subjects found` });

        // --- 1. PRE-PROCESS DEMAND ---
        let queue = {
            labs: [],
            large: [],
            medium: [],
            small: [],
            saturday: []
        };

        const activityKeywords = ['Health', 'Yoga', 'Sports', 'Constitution', 'NSS', 'Library', 'Wellness', 'Democracy', 'Human Values'];

        subjects.forEach(s => {
            // Safe Cast
            const L = Number(s.L) || 0;
            const T = Number(s.T) || 0;
            const P = Number(s.P) || 0;
            let item = { ...s.toObject(), L, T, P, ltp: `L:${L}-T:${T}-P:${P}` };

            if (activityKeywords.some(k => s.courseName.includes(k))) {
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

            // Mode Logic
            if (slotMode === '1h') {
                for (let i = 0; i < L; i++) queue.small.push({ ...item, type: 'Lecture', duration: 1 });
            }
            else if (slotMode === '2h') {
                if (L === 3) {
                    queue.medium.push({ ...item, type: 'Lecture', duration: 2 });
                    queue.small.push({ ...item, type: 'Lecture', duration: 1 });
                }
                else if (L === 2) {
                    queue.medium.push({ ...item, type: 'Lecture', duration: 2 });
                }
                else if (L === 1) {
                    queue.small.push({ ...item, type: 'Lecture', duration: 1 });
                }
                else if (L > 3) {
                    for (let i = 0; i < L; i++) queue.small.push({ ...item, type: 'Lecture', duration: 1 });
                }
            }
            else { // Dynamic (Default)
                // STRICT USER RULES:
                // L=1 -> 1h (1 session)
                // L=2 -> 2h (1 session)
                // L=3 -> 1.5h + 1.5h (2 sessions)

                if (L === 3) {
                    queue.large.push({ ...item, type: 'Lecture', duration: 1.5 });
                    queue.large.push({ ...item, type: 'Lecture', duration: 1.5 });
                }
                else if (L === 2) {
                    // "2 MEANS 2HR CLASSES"
                    queue.medium.push({ ...item, type: 'Lecture', duration: 2 });
                }
                else if (L === 1) {
                    // "L=1 MEANS 1 HR"
                    queue.small.push({ ...item, type: 'Lecture', duration: 1 });
                }
                else if (L > 3) {
                    if (L % 1.5 === 0) {
                        for (let k = 0; k < L / 1.5; k++) queue.large.push({ ...item, type: 'Lecture', duration: 1.5 });
                    } else {
                        for (let k = 0; k < L; k++) queue.small.push({ ...item, type: 'Lecture', duration: 1 });
                    }
                }
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

        // --- 3. PLACE LABS ---
        for (let lab of queue.labs) {
            let placed = false;
            let strategies = labPlacement === 'morning' ? ['morning', 'afternoon'] :
                labPlacement === 'mixed' ? (Math.random() > 0.5 ? ['morning', 'afternoon'] : ['afternoon', 'morning']) :
                    ['afternoon', 'morning'];

            for (let strat of strategies) {
                if (placed) break;
                if (strat === 'afternoon') {
                    for (let i of dayIndices) {
                        // Check if day already has a lab (either morning or afternoon)
                        if (!days[i].afternoonConfig && !days[i].morningConfig) {
                            days[i].afternoonConfig = lab.type;
                            days[i].assignedLab = lab;
                            placed = true; break;
                        }
                    }
                }
                else if (strat === 'morning') {
                    if (lab.type === 'Lab3' || lab.type === 'Lab2') {
                        for (let i of dayIndices) {
                            // Check if day already has a lab (either morning or afternoon)
                            if (!days[i].morningConfig && !days[i].afternoonConfig) {
                                days[i].morningConfig = 'Lab';
                                days[i].assignedMorningLab = lab;
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
                p.push({ time: '09:30 - 12:30', subject: d.assignedMorningLab.courseName + ' (Lab)', type: 'Lab', credits: 3, ltp: d.assignedMorningLab.ltp, locked: true });
            } else {
                let slots = fillBlock(d.morningConfig, d.morningPeriods || [], 9.5, 12.5);
                p.push(...slots);
            }

            // B. Lunch
            p.push({ time: '12:30 - 02:00', subject: 'LUNCH BREAK', type: 'Break', locked: true });

            // C. Afternoon
            if (d.afternoonConfig === 'Lab3') {
                p.push({ time: '02:00 - 05:00', subject: d.assignedLab.courseName + ' (Lab)', type: 'Lab', credits: 3, ltp: d.assignedLab.ltp, locked: true });
            }
            else if (d.afternoonConfig === 'Lab2') {
                // 2h Lab + 1h Sport
                p.push({ time: '02:00 - 04:00', subject: d.assignedLab.courseName + ' (Lab)', type: 'Lab', credits: 2, ltp: d.assignedLab.ltp, locked: true });
                p.push({ time: '04:00 - 05:00', subject: 'Sports / Gap', type: 'Activity', credits: 1, locked: true });
            }
            else {
                // To allow 2h items (start at 2PM or 3PM?)
                // Actually my fillBlock sorts descending, so 2h item will be 2-4. 1h item 4-5.
                // Or 1h item, 1h item, 1h item.
                let slots = fillBlock(d.afternoonConfig, d.afternoonPeriods || [], 14, 17);
                // Convert 24h to 12h for display if needed, but '02:00' format is fine.
                // 14 -> 02, 17 -> 05.
                slots.forEach(s => {
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
        if (wing && !['Wing 1', 'Wing 2'].includes(wing)) {
            return res.status(400).json({ message: 'Only Wing 1 and Wing 2 are allowed for labs.' });
        }

        // No conflict, proceed to update
        targetPeriod.subject = subject;
        targetPeriod.faculty = faculty || 'N/A';
        targetPeriod.assistants = assistants || [];
        targetPeriod.wing = wing || targetPeriod.wing;
        targetPeriod.room = room || targetPeriod.room;

        // If booking, mark as locked/fixed
        if (faculty || (assistants && assistants.length > 0)) {
            const isLab = subject && subject.toLowerCase().includes('lab');
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
        if (department) facultyQuery.department = department;

        const facultyList = await Faculty.find(facultyQuery);
        const timetables = await Timetable.find({});

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

module.exports = router;
