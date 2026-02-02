const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const Course = require('../models/courseModel');
const Subject = require('../models/subjectModel');

const upload = multer({ dest: 'uploads/' });

// Helper for CSV Promise
const parseCsv = (filePath) => {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (d) => results.push(d))
            .on('end', () => resolve(results))
            .on('error', (e) => reject(e));
    });
}

router.post('/preview', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const ext = path.extname(req.file.originalname).toLowerCase();

        // --- CSV HANDLING ---
        if (ext === '.csv') {
            const rawData = await parseCsv(req.file.path);
            const subjects = rawData.map((row, i) => {
                // Flexible Key Matching
                const getVal = (key) => row[Object.keys(row).find(k => k.toLowerCase() === key.toLowerCase())];

                return {
                    sNo: getVal('sno') || i + 1,
                    category: getVal('category') || 'PC',
                    courseCode: getVal('code') || getVal('coursecode') || '',
                    courseName: getVal('title') || getVal('name') || getVal('subject') || '',
                    L: getVal('l') || 0,
                    T: getVal('t') || 0,
                    P: getVal('p') || 0,
                    credits: getVal('c') || getVal('credits') || 0,
                    semester: 'Uploaded'
                };
            }).filter(s => s.courseName); // Filter empty rows

            fs.unlinkSync(req.file.path);
            return res.json({ success: true, subjects });
        }

        // --- PDF HANDLING (Existing Logic) ---
        const dataBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdf(dataBuffer);
        const text = pdfData.text;

        const subjectsToPreview = [];
        const lines = text.split('\n');
        let currentSem = null;
        let pendingSubject = null;

        const finalizeSubject = (sub) => {
            if (sub && sub.courseName && sub.courseName.length > 2) {
                const cleanName = sub.courseName.trim();
                const invalid = ['TITLE', 'TOTAL CREDITS', 'S.NO', 'CATEGORY'];
                if (!invalid.some(w => cleanName.toUpperCase().includes(w))) {
                    subjectsToPreview.push({ ...sub, courseName: cleanName });
                }
            }
        };

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            if (!line) continue;
            let combinedLine = line;
            if (lines[i + 1]) combinedLine += " " + lines[i + 1].trim();

            const isHeader = (combinedLine.includes('Semester') || combinedLine.includes('SEMESTER') || combinedLine.includes('Sem')) &&
                (combinedLine.includes('Year') || combinedLine.includes('B.Tech'));

            if (isHeader) {
                const yM = combinedLine.match(/\b(I|II|III|IV)\s*(-|Year|B\.Tech)/i);
                const sM = combinedLine.match(/\b(I|II)\s*(-|Semester|Sem)/i);
                if (yM && sM) {
                    if (pendingSubject) { finalizeSubject(pendingSubject); pendingSubject = null; }
                    currentSem = `${yM[1].toUpperCase()}-B.Tech ${sM[1].toUpperCase()} Sem`;
                    if (!line.includes('Semester') && lines[i + 1] && lines[i + 1].includes('Semester')) i++;
                    continue;
                }
            }

            if (!currentSem) continue;

            const cleanLineForStats = line.replace(/[^\w\s\.\-]/g, '');
            const isCreditsLine = /^[\d\s\.\-]+$/.test(cleanLineForStats) && cleanLineForStats.trim().length > 0;
            const startsWithNum = /^\d+\.?$/.test(line.split(/\s+/)[0]);

            if (startsWithNum && !isCreditsLine && !pendingSubject) {
                // New Row Logic
                const parts = line.split(/\s+/);
                const sNo = parseInt(parts[0]);
                let codeIndex = -1;

                // Find Code Anchor (R23...)
                for (let k = 1; k < parts.length; k++) {
                    if (/^(R\d+|[A-Z]+\d+[A-Z]*\d*)$/.test(parts[k])) { codeIndex = k; break; }
                }

                if (codeIndex !== -1) {
                    let nameParts = parts.slice(codeIndex + 1);
                    // Filter stats from end
                    while (nameParts.length > 0 && (/^[\d\.\-]+$/.test(nameParts[nameParts.length - 1]))) nameParts.pop();

                    pendingSubject = {
                        sNo, semester: currentSem, category: parts.slice(1, codeIndex).join(' '),
                        courseCode: parts[codeIndex], courseName: nameParts.join(' '),
                        L: 0, T: 0, P: 0, credits: 0
                    };
                }
            } else if (pendingSubject) {
                // Check for stats line
                const numsMatch = line.match(/((?:[\d\.\-]+\s*)+)$/);
                if (numsMatch) {
                    const vals = numsMatch[1].trim().split(/\s+/).map(v => (v === '-' || v === '.') ? 0 : parseFloat(v));
                    if (vals.length >= 1 && vals[vals.length - 1] <= 10) {
                        pendingSubject.credits = vals[vals.length - 1];
                        if (vals.length >= 2) pendingSubject.P = vals[vals.length - 2];
                        if (vals.length >= 3) pendingSubject.T = vals[vals.length - 3];
                        if (vals.length >= 4) pendingSubject.L = vals[vals.length - 4];

                        const textPart = line.substring(0, line.length - numsMatch[1].length).trim();
                        if (textPart) pendingSubject.courseName += ' ' + textPart;
                    }
                } else if (!/^\d+$/.test(line)) {
                    pendingSubject.courseName += ' ' + line;
                }
            }
        }
        if (pendingSubject) finalizeSubject(pendingSubject); // Final Valid Subject

        fs.unlinkSync(req.file.path);
        res.json({ success: true, subjects: subjectsToPreview });

    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        console.error('PARSE ERROR:', error);
        res.status(500).json({ message: 'Error parsing file: ' + error.message });
    }
});

router.post('/save', async (req, res) => {
    try {
        const { regulation, department, program, courseName, fileName, subjects } = req.body;
        if (!subjects || subjects.length === 0) return res.status(400).json({ message: 'No subjects provided' });

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

        const incomingSemesters = [...new Set(subjects.map(s => s.semester))];
        await Subject.deleteMany({ courseId: course._id, semester: { $in: incomingSemesters } });

        const dbSubjects = subjects.map(sub => ({
            courseId: course._id,
            semester: sub.semester,
            sNo: sub.sNo,
            courseCode: sub.courseCode,
            courseName: sub.courseName,
            category: sub.category || 'PC',
            credits: sub.credits,
            L: sub.L || 0, T: sub.T || 0, P: sub.P || 0,
            assignedFaculty: sub.assignedFaculty || 'N/A',
            assignedAssistants: sub.assignedAssistants || []
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

// DELETE Single Subject
router.delete('/subject/:id', async (req, res) => {
    try {
        const deleted = await Subject.findByIdAndDelete(req.params.id);
        if (deleted) res.json({ success: true, message: 'Subject deleted' });
        else res.status(404).json({ message: 'Subject not found' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

module.exports = router;
