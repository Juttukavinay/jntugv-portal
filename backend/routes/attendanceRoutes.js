const express = require('express');
const router = express.Router();
const Attendance = require('../models/attendanceModel');
const Student = require('../models/studentModel');

// GET /api/attendance/students?semester=...
// Fetch students for a specific class to take attendance
router.get('/students', async (req, res) => {
    const { semester, department } = req.query;
    try {
        let query = {};
        if (semester) {
            const match = semester.match(/^(I{1,3}|IV|V)\-([A-Za-z\.]+)\s+(I{1,3}|IV|V)\s+Sem/i);
            if (match) {
                const romanToNum = (roman) => {
                    const map = { 'I': '1', 'II': '2', 'III': '3', 'IV': '4', 'V': '5' };
                    return map[roman.toUpperCase()] || roman;
                };
                query.$or = [
                    { semester: semester },
                    { 
                        year: romanToNum(match[1]), 
                        course: match[2], 
                        semester: romanToNum(match[3])
                    }
                ];
            } else {
                query.semester = semester;
            }
        }
        if (department) query.department = department; // Optional

        const students = await Student.find(query).sort({ rollNumber: 1 });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/attendance
// Save attendance record
router.post('/', async (req, res) => {
    try {
        const { date, subject, semester, room, facultyId, facultyName, periodTime, records } = req.body;

        // Check if attendance already taken for this slot? (Optional logic)
        // For now, allow multiple updates or overwrites

        const attendance = await Attendance.create({
            date, subject, semester, room, facultyId, facultyName, periodTime, records
        });

        res.status(201).json(attendance);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
