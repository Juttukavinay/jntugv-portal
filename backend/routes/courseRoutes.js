const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdf = require('pdf-parse');
const fs = require('fs');
const Course = require('../models/courseModel');
const Subject = require('../models/subjectModel');

const upload = multer({ dest: 'uploads/' });

router.post('/preview', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const dataBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdf(dataBuffer);
        const text = pdfData.text;

        const subjectsToPreview = [];
        const lines = text.split('\n');
        let currentSem = null;
        let pendingSubject = null;

        // Header Regex
        const semRegex = /(I|II|III|IV)(\s+Year|\-B\.Tech)\s+(I|II)\s+Semester/i;

        const finalizeSubject = (sub) => {
            if (sub && sub.courseName && sub.courseName.length > 2) {
                const cleanName = sub.courseName.trim();
                // Filter junk
                if (cleanName.toUpperCase() !== 'TITLE' &&
                    !cleanName.toLowerCase().includes('total credits') &&
                    !cleanName.toLowerCase().includes('s.no') &&
                    !cleanName.toLowerCase().includes('category')
                ) {
                    subjectsToPreview.push({ ...sub, courseName: cleanName });
                }
            }
        };

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            if (!line) continue;

            // 1. Detect Semester Header (Multi-line support)
            // Combine current and next line to check for split headers like "I-B.Tech I-\nSemester"
            let combinedLine = line;
            if (lines[i + 1]) combinedLine += " " + lines[i + 1].trim();

            const isHeader = (combinedLine.includes('Semester') || combinedLine.includes('SEMESTER') || combinedLine.includes('Sem')) &&
                (combinedLine.includes('Year') || combinedLine.includes('B.Tech'));

            if (isHeader) {
                // If it matched purely on combined, we might need to skip next line to avoid double processing
                // but let's just parse the combined string.

                const processHeaderLine = (text) => {
                    // Find Roman for Year (I, II, III, IV)
                    const yearMatch = text.match(/\b(I|II|III|IV)\b.*?(Year|B\.Tech)/i) || text.match(/(Year|B\.Tech).*?\b(I|II|III|IV)\b/i);

                    // Find Roman for Sem (I, II)
                    let semMatch = text.match(/\b(I|II)\b.*?Semester/i) || text.match(/Semester.*?\b(I|II)\b/i);
                    if (!semMatch) semMatch = text.match(/(I|II)Semester/i); // Joined case

                    const romans = text.match(/\b(IV|III|II|I)\b/g) || [];
                    let y = 'I';
                    let s = 'I';
                    let found = false;

                    // Year Logic
                    const yM = text.match(/\b(I|II|III|IV)\s*(-|Year|B\.Tech)/i);
                    if (yM) { y = yM[1]; found = true; }
                    else if (romans.length > 0) { y = romans[0]; found = true; }

                    // Sem Logic
                    const sM = text.match(/\b(I|II)\s*(-|Semester|Sem)/i);
                    if (sM) { s = sM[1]; }
                    else if (semMatch) { s = semMatch[1]; }
                    else if (romans.length > 1) { s = romans[1]; } /* Fallback */

                    return found ? { y, s } : null;
                };

                const headerData = processHeaderLine(combinedLine);

                if (headerData) {
                    if (pendingSubject) {
                        finalizeSubject(pendingSubject);
                        pendingSubject = null;
                    }
                    currentSem = `${headerData.y.toUpperCase()}-B.Tech ${headerData.s.toUpperCase()} Sem`;
                    // If we used the next line for this header, skip it
                    if (!line.includes('Semester') && lines[i + 1] && lines[i + 1].includes('Semester')) {
                        i++;
                    }
                    continue;
                }
            }

            if (!currentSem) continue;

            // 2. Identify if this line is purely a "Credits/L-T-P" line
            // Example: "3 0 0 3" or "0 0 2 1" or "- - 2 1"
            // Use a broader check: mostly digits, spaces, dots, dashes
            const cleanLineForStats = line.replace(/[^\w\s\.\-]/g, '');
            const isCreditsLine = /^[\d\s\.\-]+$/.test(cleanLineForStats) && cleanLineForStats.trim().length > 0;

            // Check if New Row
            // - Must start with a number
            // - Must NOT be a stats line
            const parts = line.split(/\s+/);
            const startsWithNum = /^\d+\.?$/.test(parts[0]);

            // Heuristic: If it looks like stats (sequence of 1-5 numbers/dashes), it belongs to previous subject
            const looksLikeStats = /^(\s*[\d\.\-]+\s+){0,4}[\d\.\-]+\s*$/.test(cleanLineForStats) && parts.length >= 1 && parts.length <= 6;

            const isNewRow = startsWithNum && !isCreditsLine && (!pendingSubject || !looksLikeStats);

            if (isNewRow) {
                if (pendingSubject) finalizeSubject(pendingSubject);

                const sNo = parseInt(parts[0].replace('.', ''));
                let credits = 0;
                let L = 0, T = 0, P = 0;

                // --- PIVOT STRATEGY: Find Code, then Split ---
                let ptr = 1;
                let codeIndex = -1;

                // 1. Scan for Course Code (Anchor)
                const badWords = ['COMPUTER', 'ADVANCED', 'DATA', 'MACHINE', 'SOFTWARE', 'DESIGN', 'WEB', 'DIGITAL', 'OBJECT', 'JAVA', 'PYTHON', 'C', 'PROGRAMMING', 'INTRODUCTION', 'ENGINEERING', 'LAB', 'WORKSHOP', 'HEALTH', 'WELLNESS', 'AUDIT'];

                for (let k = 1; k < parts.length; k++) {
                    const t = parts[k].toUpperCase();
                    // Clean token of dots/parens for checking
                    const cleanT = t.replace(/^[\.\(\)]+|[\.\(\)]+$/g, '');

                    if (cleanT.length < 2) continue; // Skip single chars/symbols

                    // Must have digits or look like R23...
                    if (!badWords.includes(cleanT)) {
                        // Regex: Start with R + digits, OR Alphanum with at least one digit
                        // e.g. R23BS01, or 23BS01 (sometimes R is missed)
                        if (/^(R\d+|[A-Z]+\d+[A-Z]*\d*|[A-Z0-9\-]+)$/.test(cleanT) && /\d/.test(cleanT)) {
                            codeIndex = k;
                            break;
                        }
                    }
                }

                let category = 'Unknown';
                let courseCode = 'N/A';

                if (codeIndex !== -1) {
                    // FOUND ANCHOR
                    courseCode = parts[codeIndex];

                    // Category is everything between sNo(0) and codeIndex
                    // We scan this range for known category keywords
                    const preCode = parts.slice(1, codeIndex);
                    // Filter meaningful tokens
                    const cleanPre = preCode.filter(t => /[a-zA-Z]/.test(t) && t.length > 1);

                    if (cleanPre.length > 0) {
                        category = cleanPre.join(' ');
                    }
                    ptr = codeIndex + 1;
                } else {
                    // NO ANCHOR found - fallback
                    // Try to find category linearly (Skip leading symbols like ".")
                    while (parts[ptr] && !/[a-zA-Z0-9]/.test(parts[ptr])) ptr++; // Skip symbols

                    if (parts[ptr]) {
                        category = parts[ptr];
                        ptr++;
                    }
                }

                // 2. Determine Name Boundaries
                let nameStart = ptr;

                // Scan from end for Numbers
                let numsEndIndex = parts.length - 1;
                // Helper: check if part is effectively a number
                const isNum = (s) => {
                    if (s === '-' || s === '.') return true;
                    return !isNaN(parseFloat(s)) && /\d/.test(s);
                };

                while (numsEndIndex >= nameStart) {
                    if (isNum(parts[numsEndIndex])) {
                        numsEndIndex--;
                    } else {
                        break;
                    }
                }

                let nameParts = parts.slice(nameStart, numsEndIndex + 1);
                // Strip leading/trailing non-alphanum from name
                while (nameParts.length > 0 && !/[a-zA-Z]/.test(nameParts[0])) nameParts.shift();

                // 6. Extract Credits from removed tail
                const tailNumbers = parts.slice(numsEndIndex + 1).map(s => {
                    if (s === '-' || s === '.') return 0;
                    return parseFloat(s);
                }).filter(n => !isNaN(n));

                // Mapping strategy: Right-to-Left [L, T, P, Credits]
                // If fewer than 4 numbers, fill from right (Credits -> P -> T -> L)
                if (tailNumbers.length > 0) {
                    credits = tailNumbers[tailNumbers.length - 1];
                    if (tailNumbers.length >= 2) P = tailNumbers[tailNumbers.length - 2];
                    if (tailNumbers.length >= 3) T = tailNumbers[tailNumbers.length - 3];
                    if (tailNumbers.length >= 4) L = tailNumbers[tailNumbers.length - 4];
                }

                pendingSubject = {
                    id: Math.random().toString(36).substr(2, 9),
                    semester: currentSem,
                    sNo,
                    courseCode,
                    courseName: nameParts.join(' '),
                    category,
                    credits: credits,
                    L, T, P
                };

            } else {
                // Continuation line or Credit Line
                if (pendingSubject) {
                    // Check specifically for Credits pattern at end of line
                    // Regex: Match a group of numbers (or dashes) at the end.
                    // e.g. "Theory 3 0 0 3" or " - - 2 1"
                    const numsMatch = line.match(/((?:[\d\.\-]+\s*)+)$/);
                    let foundStats = false;

                    if (numsMatch) {
                        const numStr = numsMatch[1];
                        const vals = numStr.trim().split(/\s+/).map(v => {
                            if (v === '-' || v === '.') return 0;
                            return parseFloat(v);
                        }).filter(n => !isNaN(n));

                        // Heuristic: If we found numbers, assume stats
                        if (vals.length >= 1) {
                            const lastVal = vals[vals.length - 1];
                            if (lastVal <= 10) { // Safety cap
                                pendingSubject.credits = lastVal;

                                // Right-to-Left mapping for Continuation too
                                if (vals.length >= 2) pendingSubject.P = vals[vals.length - 2];
                                if (vals.length >= 3) pendingSubject.T = vals[vals.length - 3];
                                if (vals.length >= 4) pendingSubject.L = vals[vals.length - 4];

                                foundStats = true;
                            }
                        }

                        // If found, remove these numbers from line to get text
                        if (foundStats) {
                            const textPart = line.substring(0, line.length - numStr.length).trim();
                            if (textPart.length > 0 && !/^\d+\.?$/.test(textPart)) {
                                pendingSubject.courseName += ' ' + textPart;
                            }
                        }
                    }

                    if (!foundStats) {
                        // No numbers at end, just append content
                        // Skip likely garbage
                        if (!/^\d+$/.test(line) && line.length > 1) {
                            pendingSubject.courseName += ' ' + line;
                        }
                    }
                }
            }
        }
        if (pendingSubject) finalizeSubject(pendingSubject);

        fs.unlinkSync(req.file.path);
        res.json({ success: true, subjects: subjectsToPreview });

    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        console.error('PDF PARSE SERVER ERROR:', error);
        res.status(500).json({ message: 'Error parsing PDF: ' + error.message });
    }
});

router.post('/save', async (req, res) => {
    try {
        const { regulation, department, program, courseName, fileName, subjects } = req.body;
        if (!subjects || subjects.length === 0) return res.status(400).json({ message: 'No subjects provided' });

        // Find existing course or create new
        let course = await Course.findOne({
            regulation: regulation || 'R23',
            department: department || 'IT',
            program: program || 'UG',
            courseName: courseName || 'B.Tech'
        });

        if (!course) {
            course = await Course.create({
                regulation: regulation || 'R23',
                department: department || 'IT',
                program: program || 'UG',
                courseName: courseName || 'B.Tech',
                fileName: fileName || 'Manual Entry'
            });
        }

        // Identify semesters being updated to avoid wiping entire course
        const incomingSemesters = [...new Set(subjects.map(s => s.semester))];

        // Remove old subjects for these specific semesters
        await Subject.deleteMany({
            courseId: course._id,
            semester: { $in: incomingSemesters }
        });

        const dbSubjects = subjects.map(sub => ({
            courseId: course._id,
            semester: sub.semester,
            sNo: sub.sNo,
            courseCode: sub.courseCode,
            courseName: sub.courseName,
            category: sub.category || 'PC',
            credits: sub.credits,
            L: sub.L || 0,
            T: sub.T || 0,
            P: sub.P || 0
        }));

        await Subject.insertMany(dbSubjects);
        res.json({ success: true, courseId: course._id, message: 'Curriculum updated successfully' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error saving curriculum' });
    }
});

router.get('/', async (req, res) => {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json(courses);
});

router.get('/:id/subjects', async (req, res) => {
    const subjects = await Subject.find({ courseId: req.params.id }).sort({ semester: 1, sNo: 1 });
    res.json(subjects);
});

module.exports = router;
