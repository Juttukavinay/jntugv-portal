const mongoose = require('mongoose');
const dotenv = require('dotenv');

// We run this from backend root, so paths are relative to backend
const Student = require('./models/studentModel');
const Faculty = require('./models/facultyModel');
const Department = require('./models/departmentModel');
const Timetable = require('./models/timetableModel');
const Attendance = require('./models/attendanceModel');
const Course = require('./models/courseModel');
const Subject = require('./models/subjectModel');
const Room = require('./models/roomModel');

dotenv.config();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/timetable_db';

const firstNames = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Riyansh", "Ayaan", "Krishna", "Ishaan", "Shaurya", "Atharv", "Dhruv", "Ananya", "Myra", "Ira", "Naya", "Misha", "Aditi", "Riya", "Aarohi", "Saanvi", "Diya", "Kavya", "Aisha", "Anika", "Navya", "Meera"];
const lastNames = ["Rao", "Reddy", "Choudhary", "Patil", "Desai", "Joshi", "Sharma", "Varma", "Kumar", "Singh", "Nair", "Iyer", "Yadav", "Patel", "Das", "Murthy", "Naidu"];

function getRandomName() {
    const f = firstNames[Math.floor(Math.random() * firstNames.length)];
    const l = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${f} ${l}`;
}

async function seedData() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB for Seeding...");

        console.log("Emptying existing collections...");
        await Promise.all([
            Student.deleteMany({}),
            Faculty.deleteMany({}),
            Department.deleteMany({}),
            Timetable.deleteMany({}),
            Attendance.deleteMany({}),
            Course.deleteMany({}),
            Subject.deleteMany({}),
            Room.deleteMany({})
        ]);

        console.log("Creating Departments...");
        const depts = ['IT', 'CSE', 'ECE', 'MECH', 'CIVIL'];
        const deptDocs = await Department.insertMany(depts.map(d => ({ name: d })));
        
        console.log("Creating Rooms...");
        const rooms = [];
        for (let i = 1; i <= 20; i++) {
            rooms.push({ name: `B-${100 + i}`, capacity: 60, type: 'Classroom', department: depts[i % depts.length] });
        }
        await Room.insertMany(rooms);

        console.log("Creating Courses...");
        const course = new Course({
            regulation: "R20", 
            department: "IT", 
            program: "UG", 
            courseName: "B.Tech"
        });
        await course.save();

        console.log("Creating Subjects...");
        const subjectsList = [
            { courseId: course._id, semester: 'III-B.Tech I Sem IT', sNo: 1, category: 'PC', courseCode: 'CS101', courseName: 'Data Structures', L: 3, T: 0, P: 0, credits: 3 },
            { courseId: course._id, semester: 'III-B.Tech I Sem IT', sNo: 2, category: 'PC', courseCode: 'CS102', courseName: 'Operating Systems', L: 3, T: 0, P: 0, credits: 3 },
            { courseId: course._id, semester: 'III-B.Tech I Sem IT', sNo: 3, category: 'PC', courseCode: 'CS103', courseName: 'Database Management Systems', L: 3, T: 0, P: 0, credits: 3 },
            { courseId: course._id, semester: 'III-B.Tech I Sem IT', sNo: 4, category: 'PC', courseCode: 'CS104', courseName: 'Computer Networks', L: 3, T: 0, P: 0, credits: 3 },
            { courseId: course._id, semester: 'III-B.Tech I Sem IT', sNo: 5, category: 'PC', courseCode: 'CS201', courseName: 'Web Technologies Lab', L: 0, T: 0, P: 3, credits: 2 },
            { courseId: course._id, semester: 'III-B.Tech I Sem IT', sNo: 6, category: 'PC', courseCode: 'IT101', courseName: 'Machine Learning', L: 3, T: 0, P: 0, credits: 3 },
            { courseId: course._id, semester: 'III-B.Tech I Sem IT', sNo: 7, category: 'PC', courseCode: 'IT102', courseName: 'Artificial Intelligence', L: 3, T: 0, P: 0, credits: 3 },
        ];
        const subjectDocs = await Subject.insertMany(subjectsList);

        console.log("Creating Faculties...");
        const faculties = [];

        // Principal
        faculties.push({
            facultyId: 'PRIN01', name: 'Dr. Principal Rao', designation: 'Principal', 
            qualification: 'Ph.D', email: 'principal@jntugv.edu.in', mobileNumber: '9876543200', 
            type: 'Regular', department: 'IT', role: 'principal'
        });

        // HODs
        depts.forEach((d, idx) => {
            faculties.push({
                facultyId: `HOD0${idx+1}`, name: `Dr. HOD ${getRandomName()}`, designation: 'Professor & HOD',
                qualification: 'Ph.D', email: `hod${d.toLowerCase()}@jntugv.edu.in`, mobileNumber: `987654321${idx}`, 
                type: 'Regular', department: d, role: 'hod'
            });
        });

        // Faculties
        let facCounter = 1;
        depts.forEach(d => {
            for (let i = 0; i < 6; i++) {
                faculties.push({
                    facultyId: `FAC0${facCounter}`, name: `Mr. ${getRandomName()}`, designation: 'Assistant Professor',
                    qualification: 'M.Tech', email: `fac${facCounter}@jntugv.edu.in`, mobileNumber: `88765432${String(facCounter).padStart(2, '0')}`,
                    type: 'Regular', department: d, role: 'faculty'
                });
                facCounter++;
            }
        });

        const createdFaculties = await Faculty.insertMany(faculties);

        // Update Departments with HOD
        for (const dept of deptDocs) {
            const hod = createdFaculties.find(f => f.department === dept.name && f.role === 'hod');
            if (hod) {
                dept.hodId = hod._id;
                dept.hodName = hod.name;
                await dept.save();
            }
        }

        console.log("Creating Students...");
        const classes = ['III-B.Tech I Sem IT', 'III-B.Tech I Sem CSE', 'II-B.Tech I Sem IT'];
        const students = [];
        let rollCounter = 1;
        classes.forEach(clsStr => {
            const match = clsStr.match(/(III|II)-B\.Tech (I|II) Sem (.*)/);
            if (!match) return;
            const yearStr = match[1] === 'III' ? '3' : '2';
            const semStr = match[2] === 'I' ? '1' : '2';
            const dept = match[3];

            const baseRoll = yearStr === '3' ? '21' : '22';
            for (let i = 1; i <= 60; i++) {
                const roll = `${baseRoll}VV1A${dept === 'IT' ? '12' : '05'}${String(i).padStart(2, '0')}`;
                students.push({
                    rollNumber: roll, name: getRandomName(), year: yearStr, semester: semStr,
                    course: 'B.Tech', email: `${roll.toLowerCase()}@jntugv.edu.in`, department: dept
                });
            }
        });

        const createdStudents = await Student.insertMany(students);

        console.log("Creating Timetables...");
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const periodTimes = ['09:00 - 09:50', '09:50 - 10:40', '10:50 - 11:40', '11:40 - 12:30', '13:30 - 14:20', '14:20 - 15:10', '15:10 - 16:00'];
        
        const timetables = [];
        for (const cls of classes) {
            const clsDept = cls.split(' ').pop();
            const deptFaculties = createdFaculties.filter(f => f.department === clsDept && f.role === 'faculty');
            
            const schedule = days.map(day => {
                const periods = periodTimes.map(time => {
                    const rndIdx = Math.floor(Math.random() * subjectsList.length);
                    const isLab = Math.random() > 0.8;
                    const subject = subjectsList[rndIdx].courseName;
                    const f = deptFaculties[Math.floor(Math.random() * deptFaculties.length)];
                    return {
                        time,
                        subject: isLab ? 'Web Technologies Lab' : subject,
                        type: isLab ? 'Practical' : 'Theory',
                        faculty: f.name,
                        assistants: isLab ? [deptFaculties[0]?.name, deptFaculties[1]?.name] : [],
                        credits: 3,
                        ltp: '3-0-0',
                        room: `B-${100 + Math.floor(Math.random()*20+1)}`,
                        wing: 'Main',
                        isFixed: true
                    };
                });
                return { day, periods };
            });
            timetables.push({ className: cls, schedule });
        }
        await Timetable.insertMany(timetables);

        console.log("Creating Attendance Records...");
        // For the past 5 days
        const attendanceDocs = [];
        for (let i = 0; i < 5; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
            
            if (dayName === 'Sunday') continue;

            for (const tt of timetables) {
                const daySchedule = tt.schedule.find(s => s.day === dayName);
                if (!daySchedule) continue;

                const clsStudents = createdStudents.filter(s => 
                    s.year === (tt.className.includes('III') ? '3' : '2') && 
                    s.department === tt.className.split(' ').pop()
                );

                for (const period of daySchedule.periods) {
                    const facultyDoc = createdFaculties.find(f => f.name === period.faculty);
                    
                    const records = clsStudents.map(s => ({
                        studentId: s._id,
                        rollNumber: s.rollNumber,
                        name: s.name,
                        status: Math.random() > 0.15 ? 'Present' : 'Absent'
                    }));

                    attendanceDocs.push({
                        date: dateStr,
                        subject: period.subject,
                        semester: tt.className,
                        room: period.room,
                        facultyId: facultyDoc ? facultyDoc._id : createdFaculties[3]._id,
                        facultyName: period.faculty,
                        department: tt.className.split(' ').pop(),
                        periodTime: period.time,
                        records: records
                    });
                }
            }
        }
        await Attendance.insertMany(attendanceDocs);

        console.log("Successfully seeded database with fake realistic data!");
        process.exit();
    } catch (err) {
        console.error("Error seeding DB:", err.message);
        process.exit();
    }
}

seedData();
