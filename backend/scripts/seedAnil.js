const mongoose = require('mongoose');
require('dotenv').config();
const Faculty = require('../models/facultyModel');
const Student = require('../models/studentModel');
const Timetable = require('../models/timetableModel');
const Attendance = require('../models/attendanceModel');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // 1. Get Anil Wurity
        let anil = await Faculty.findOne({ name: 'Mr.AnilWurity' });
        if (!anil) {
            console.log('Anil not found, creating...');
            anil = await Faculty.create({
                name: 'Mr.AnilWurity',
                email: 'anilwurity@jntugv.edu',
                mobileNumber: '9701458518',
                designation: 'Assistant Professor',
                department: 'IT',
                subject: 'Data Structures'
            });
        }
        console.log('Target Faculty:', anil.name);

        // 2. Create Tons of Students for "I-B.Tech II Sem"
        console.log('Seeding Students...');
        await Student.deleteMany({ semester: 'I-B.Tech II Sem' }); // Clean slate for this sem
        const students = [];
        for (let i = 1; i <= 60; i++) {
            const num = i.toString().padStart(2, '0');
            students.push({
                rollNumber: `21131A05${num}`,
                name: `Student ${num}`,
                semester: 'I-B.Tech II Sem',
                department: 'IT',
                email: `21131A05${num}@jntugv.edu`
            });
        }
        await Student.insertMany(students);
        const studentDocs = await Student.find({ semester: 'I-B.Tech II Sem' });

        // 3. Update Timetable to give Anil classes EVERY DAY (including Sunday for Demo)
        console.log('Seeding Timetable...');
        await Timetable.deleteMany({ className: 'I-B.Tech II Sem' });

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const schedule = days.map(day => {
            return {
                day: day,
                periods: [
                    { time: '10:00 - 11:00', subject: 'Data Structures', type: 'Theory', faculty: anil.name, room: 'Room 304' },
                    { time: '11:00 - 12:00', subject: 'Java Programming', type: 'Theory', faculty: 'Dr. Other', room: 'Room 304' },
                    { time: '14:00 - 16:00', subject: 'DS Lab', type: 'Lab', faculty: anil.name, room: 'Lab 2' },
                    { time: '16:00 - 17:00', subject: 'Counseling', type: 'Theory', faculty: anil.name, room: 'Staff Room' },
                ]
            };
        });

        await Timetable.create({
            className: 'I-B.Tech II Sem',
            schedule: schedule
        });

        // 4. Generate Past Attendance Data (Last 30 Days)
        console.log('Seeding Past Attendance...');
        await Attendance.deleteMany({ facultyName: anil.name });

        const today = new Date();
        const pastAttendance = [];

        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            // Morning Class
            const recordsDS = studentDocs.map(s => ({
                studentId: s._id,
                rollNumber: s.rollNumber,
                name: s.name,
                status: Math.random() > 0.1 ? 'Present' : 'Absent' // 90% attendance
            }));

            pastAttendance.push({
                date: dateStr,
                subject: 'Data Structures',
                semester: 'I-B.Tech II Sem',
                room: 'Room 304',
                facultyId: anil._id,
                facultyName: anil.name,
                periodTime: '10:00 - 11:00',
                records: recordsDS
            });

            // Lab Class (Every other day)
            if (i % 2 === 0) {
                const recordsLab = studentDocs.map(s => ({
                    studentId: s._id,
                    rollNumber: s.rollNumber,
                    name: s.name,
                    status: Math.random() > 0.05 ? 'Present' : 'Absent'
                }));

                pastAttendance.push({
                    date: dateStr,
                    subject: 'DS Lab',
                    semester: 'I-B.Tech II Sem',
                    room: 'Lab 2',
                    facultyId: anil._id,
                    facultyName: anil.name,
                    periodTime: '14:00 - 16:00',
                    records: recordsLab
                });
            }
        }

        await Attendance.insertMany(pastAttendance);

        console.log('DONE! Database populated for Anil Wurity.');
        process.exit(0);

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedData();
