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

// GET /api/attendance?date=YYYY-MM-DD&semester=...&subject=...
router.get('/', async (req, res) => {
    const { date, semester, subject, facultyName, department, periodTime } = req.query;
    try {
        const query = {};
        if (date) query.date = date;
        if (semester) query.semester = semester;
        if (subject) query.subject = subject;
        if (facultyName) query.facultyName = facultyName;
        if (department) query.department = department;
        if (periodTime) query.periodTime = periodTime;

        const records = await Attendance.find(query).sort({ createdAt: -1 });
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/attendance
router.post('/', async (req, res) => {
    try {
        const { date, subject, semester, room, facultyId, facultyName, department, periodTime, records } = req.body;

        const mongoose = require('mongoose');
        const safeFacultyId = facultyId && mongoose.Types.ObjectId.isValid(facultyId) ? facultyId : undefined;

        const attendance = await Attendance.create({
            date,
            subject,
            semester,
            room,
            facultyId: safeFacultyId,
            facultyName,
            department,
            periodTime,
            records
        });

        res.status(201).json(attendance);
    } catch (error) {
        console.error('Attendance save error:', error.message);
        res.status(400).json({ message: error.message });
    }
});

// GET /api/attendance/student/:rollNumber
router.get('/student/:rollNumber', async (req, res) => {
    try {
        const { rollNumber } = req.params;
        const sessions = await Attendance.find({
            "records.rollNumber": rollNumber
        }).sort({ date: -1 });

        const result = sessions.map(session => {
            const studentRecord = session.records.find(r => r.rollNumber === rollNumber);
            return {
                date: session.date,
                subject: session.subject,
                facultyName: session.facultyName,
                periodTime: session.periodTime,
                status: studentRecord ? studentRecord.status : 'N/A'
            };
        });

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
