const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Student = require('../models/studentModel');

dotenv.config();

const semesters = [
    { name: "I-B.Tech I Sem", year: "1", course: "B.Tech", code: "24131A05" },
    { name: "I-B.Tech II Sem", year: "1", course: "B.Tech", code: "24131A05" }, // Can share prefix but use different numbers
    { name: "II-B.Tech I Sem", year: "2", course: "B.Tech", code: "23131A05" },
    { name: "II-B.Tech II Sem", year: "2", course: "B.Tech", code: "23131A05" },
    { name: "III-B.Tech I Sem", year: "3", course: "B.Tech", code: "22131A05" },
    { name: "III-B.Tech II Sem", year: "3", course: "B.Tech", code: "22131A05" },
    { name: "IV-B.Tech I Sem", year: "4", course: "B.Tech", code: "21131A05" },
    { name: "IV-B.Tech II Sem", year: "4", course: "B.Tech", code: "21131A05" },
    { name: "I-M.Tech I Sem", year: "1", course: "M.Tech", code: "24131D05" },
    { name: "I-M.Tech II Sem", year: "1", course: "M.Tech", code: "24131D05" },
    { name: "II-M.Tech I Sem", year: "2", course: "M.Tech", code: "23131D05" },
    { name: "II-M.Tech II Sem", year: "2", course: "M.Tech", code: "23131D05" },
    { name: "I-MCA I Sem", year: "1", course: "MCA", code: "24131F05" },
    { name: "I-MCA II Sem", year: "1", course: "MCA", code: "24131F05" },
    { name: "II-MCA I Sem", year: "2", course: "MCA", code: "23131F05" },
    { name: "II-MCA II Sem", year: "2", course: "MCA", code: "23131F05" },
];

const seedStudents = async () => {
    try {
        console.log('Connecting to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('MongoDB Connected for seeding...');

        // Optional: Clear existing students to avoid duplicate roll numbers during tests
        // await Student.deleteMany({});
        // console.log('Existing students cleared');

        const studentData = [];
        let rollCounter = 1;

        for (const sem of semesters) {
            console.log(`Generating 30 students for ${sem.name}...`);
            // Reset rollCounter for each semester group start if we want them grouped
            // but roll numbers must be unique across the DB.
            // Using a more distinct roll number scheme to avoid collisions.

            for (let i = 1; i <= 30; i++) {
                const num = i.toString().padStart(2, '0');
                const semTag = sem.name.includes('I Sem') ? '1' : '2';
                const rollNumber = `${sem.code}${semTag}${num}`; // e.g. 24131A05101, 24131A05201

                studentData.push({
                    rollNumber,
                    name: `Student ${i} (${sem.course} ${sem.year}Y)`,
                    year: sem.year,
                    semester: sem.name, // Storing the full name as expected by the attendance route
                    course: sem.course,
                    department: 'IT',
                    email: `student${rollNumber.toLowerCase()}@example.com`
                });
            }
        }

        // Use bulk insert and ignore duplicates if they exist
        for (const student of studentData) {
            try {
                await Student.findOneAndUpdate(
                    { rollNumber: student.rollNumber },
                    student,
                    { upsert: true, new: true }
                );
            } catch (err) {
                console.error(`Error inserting ${student.rollNumber}: ${err.message}`);
            }
        }

        console.log(`Seeding complete. Processed ${studentData.length} students.`);
        process.exit();
    } catch (error) {
        console.error('Error during seeding:', error);
        process.exit(1);
    }
};

seedStudents();
