const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Student = require('../models/studentModel');

dotenv.config();

const semesters = [
    { name: "I-B.Tech I Sem", year: "1", course: "B.Tech", code: "24131A05" },
    { name: "I-B.Tech II Sem", year: "1", course: "B.Tech", code: "24131A052" },
    { name: "II-B.Tech I Sem", year: "2", course: "B.Tech", code: "23131A051" },
    { name: "II-B.Tech II Sem", year: "2", course: "B.Tech", code: "23131A052" },
    { name: "III-B.Tech I Sem", year: "3", course: "B.Tech", code: "22131A051" },
    { name: "III-B.Tech II Sem", year: "3", course: "B.Tech", code: "22131A052" },
    { name: "IV-B.Tech I Sem", year: "4", course: "B.Tech", code: "21131A051" },
    { name: "IV-B.Tech II Sem", year: "4", course: "B.Tech", code: "21131A052" },
    { name: "I-M.Tech I Sem", year: "1", course: "M.Tech", code: "24131D051" },
    { name: "II-M.Tech I Sem", year: "2", course: "M.Tech", code: "23131D051" },
    { name: "I-MCA I Sem", year: "1", course: "MCA", code: "24131F051" },
    { name: "II-MCA I Sem", year: "2", course: "MCA", code: "23131F051" },
];

const seedStudents = async () => {
    try {
        console.log('Connecting to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        // Clear existing students to ensure we have exactly 20 per group
        await Student.deleteMany({});
        console.log('Existing students cleared');

        const studentData = [];

        for (const sem of semesters) {
            console.log(`Generating 20 students for ${sem.name}...`);
            for (let i = 1; i <= 20; i++) {
                const num = i.toString().padStart(2, '0');
                const rollNumber = `${sem.code}${num}`;

                studentData.push({
                    rollNumber,
                    name: `Student ${num} (${sem.course} ${sem.year}Y)`,
                    year: sem.year,
                    semester: sem.name,
                    course: sem.course,
                    department: 'IT',
                    email: `student${rollNumber}@jntugv.edu.in`
                });
            }
        }

        await Student.insertMany(studentData);
        console.log(`Seeding complete. Added ${studentData.length} students.`);
        process.exit();
    } catch (error) {
        console.error('Error during seeding:', error);
        process.exit(1);
    }
};

seedStudents();
