const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Student = require('../models/studentModel');
const Faculty = require('../models/facultyModel');
const Department = require('../models/departmentModel');
const Course = require('../models/courseModel');
const Subject = require('../models/subjectModel');
const Room = require('../models/roomModel');
const Timetable = require('../models/timetableModel');
const Attendance = require('../models/attendanceModel');

dotenv.config();

const seedAllData = async () => {
    try {
        console.log('Connecting to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected. Clearing database...');

        // 1. Clear All Collections
        await Promise.all([
            Student.deleteMany({}),
            Faculty.deleteMany({}),
            Department.deleteMany({}),
            Course.deleteMany({}),
            Subject.deleteMany({}),
            Room.deleteMany({}),
            Timetable.deleteMany({}),
            Attendance.deleteMany({})
        ]);

        // 2. Seed Departments
        console.log('Seeding Departments...');
        const depts = await Department.insertMany([
            { name: 'IT' },
            { name: 'CSE' },
            { name: 'ECE' },
            { name: 'EEE' },
            { name: 'MECH' }
        ]);

        // 3. Seed Faculty
        console.log('Seeding Faculty...');
        const facultyData = [];
        const deptNames = ['IT', 'CSE', 'ECE', 'EEE', 'MECH'];
        
        for (const dept of deptNames) {
            for (let i = 1; i <= 5; i++) {
                facultyData.push({
                    name: `Prof. ${dept} Teacher ${i}`,
                    email: `${dept.toLowerCase()}teacher${i}@jntugv.edu.in`,
                    mobileNumber: `98765432${deptNames.indexOf(dept)}${i}`,
                    department: dept,
                    designation: i === 1 ? 'Professor & HOD' : 'Assistant Professor',
                    role: i === 1 ? 'hod' : 'faculty'
                });
            }
        }
        const createdFaculty = await Faculty.insertMany(facultyData);

        // Update HODs in Departments
        for (const dept of depts) {
            const hod = createdFaculty.find(f => f.department === dept.name && f.role === 'hod');
            if (hod) {
                dept.hodId = hod._id;
                dept.hodName = hod.name;
                await dept.save();
            }
        }

        // 4. Seed Courses
        console.log('Seeding Courses...');
        const courseData = [
            { regulation: 'R23', department: 'IT', courseName: 'B.Tech', program: 'UG' },
            { regulation: 'R23', department: 'CSE', courseName: 'B.Tech', program: 'UG' },
            { regulation: 'R20', department: 'IT', courseName: 'MCA', program: 'PG' }
        ];
        const createdCourses = await Course.insertMany(courseData);

        // 5. Seed Students (20 per group for B.Tech IT & CSE)
        console.log('Seeding Students...');
        const groups = [
            { name: "I-B.Tech I Sem", year: "1", course: "B.Tech", code: "24131A05", dept: 'IT' },
            { name: "II-B.Tech I Sem", year: "2", course: "B.Tech", code: "23131A05", dept: 'IT' },
            { name: "III-B.Tech I Sem", year: "3", course: "B.Tech", code: "22131A05", dept: 'IT' },
            { name: "IV-B.Tech I Sem", year: "4", course: "B.Tech", code: "21131A05", dept: 'IT' }
        ];

        const allStudents = [];
        for (const group of groups) {
            for (let i = 1; i <= 20; i++) {
                const num = i.toString().padStart(2, '0');
                allStudents.push({
                    rollNumber: `${group.code}${num}`,
                    name: `Student ${num} (${group.name})`,
                    year: group.year,
                    semester: group.name,
                    course: group.course,
                    department: group.dept,
                    email: `student${group.code}${num}@jntugv.edu.in`
                });
            }
        }
        const createdStudents = await Student.insertMany(allStudents);

        // 6. Seed Subjects
        console.log('Seeding Subjects...');
        const subjectsData = [];
        const itCourse = createdCourses.find(c => c.department === 'IT' && c.courseName === 'B.Tech');
        
        const coreSubjects = [
            { code: 'IT101', name: 'Mathematics-I', cat: 'BS' },
            { code: 'IT102', name: 'Python Programming', cat: 'ES' },
            { code: 'IT103', name: 'Data Structures', cat: 'PC' },
            { code: 'IT104', name: 'Operating Systems', cat: 'PC' },
            { code: 'IT105', name: 'Web Technologies', cat: 'PC' }
        ];

        for (const group of groups) {
            coreSubjects.forEach((sub, idx) => {
                subjectsData.push({
                    courseId: itCourse._id,
                    semester: group.name,
                    sNo: idx + 1,
                    category: sub.cat,
                    courseCode: `${sub.code}-${group.year}`,
                    courseName: sub.name,
                    credits: 3,
                    L: 3, T: 0, P: 0
                });
            });
        }
        const createdSubjects = await Subject.insertMany(subjectsData);

        // 7. Seed Rooms
        console.log('Seeding Rooms...');
        const roomData = [
            { name: 'CR-101', type: 'Classroom', wing: 'A-Block', department: 'IT' },
            { name: 'CR-102', type: 'Classroom', wing: 'A-Block', department: 'IT' },
            { name: 'IT-LAB-1', type: 'Lab', wing: 'B-Block', department: 'IT' },
            { name: 'CSE-LAB-1', type: 'Lab', wing: 'C-Block', department: 'CSE' }
        ];
        await Room.insertMany(roomData);

        // 8. Seed Timetable
        console.log('Seeding Timetable...');
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const times = ['09:00 - 10:00', '10:00 - 11:00', '11:10 - 12:10', '12:10 - 01:10', '02:00 - 03:00', '03:00 - 04:00'];
        
        for (const group of groups) {
            const groupSchedule = [];
            const groupSubjects = createdSubjects.filter(s => s.semester === group.name);
            
            for (const day of days) {
                const periods = times.map((time, tIdx) => ({
                    time,
                    subject: groupSubjects[tIdx % groupSubjects.length].courseName,
                    type: 'Lecture',
                    faculty: 'TBA',
                    room: 'CR-101',
                    isFixed: true
                }));
                groupSchedule.push({ day, periods });
            }

            await Timetable.create({
                className: group.name,
                schedule: groupSchedule
            });
        }

        // 9. Seed Attendance (Last 5 days)
        console.log('Seeding Attendance records...');
        const today = new Date();
        const attendanceRecords = [];

        for (let d = 0; d < 5; d++) {
            const date = new Date(today);
            date.setDate(today.getDate() - d);
            const dateStr = date.toISOString().split('T')[0];

            for (const group of groups) {
                const groupStudents = createdStudents.filter(s => s.semester === group.name);
                const groupSubjects = createdSubjects.filter(s => s.semester === group.name);
                
                // Seed attendance for 2 subjects per day
                for (let s = 0; s < 2; s++) {
                    const subject = groupSubjects[s];
                    attendanceRecords.push({
                        date: dateStr,
                        subject: subject.courseName,
                        semester: group.name,
                        room: 'CR-101',
                        facultyName: 'Sample Teacher',
                        periodTime: times[s],
                        records: groupStudents.map(student => ({
                            studentId: student._id,
                            rollNumber: student.rollNumber,
                            name: student.name,
                            status: Math.random() > 0.1 ? 'Present' : 'Absent'
                        }))
                    });
                }
            }
        }
        await Attendance.insertMany(attendanceRecords);

        console.log('Database Fully Populated Ready for Demo!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

seedAllData();
