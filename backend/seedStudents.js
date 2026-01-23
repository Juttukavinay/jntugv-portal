const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Student = require('./models/studentModel');

dotenv.config();

const departments = ['IT'];
const course = 'B.Tech';

const seedStudents = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/jntugv-portal');
        console.log('MongoDB Connected');

        // Clear existing students to avoid duplicates/clashes for this demo
        // await Student.deleteMany({});
        // console.log('Cleared existing students');

        const students = [];

        // Generate 40 students
        // Years 1 to 4
        for (let year = 1; year <= 4; year++) {
            // Determine batch prefix based on year (assuming current year is 2025-26 academic year roughly)
            // Year 4 -> 2022 Join (22JJ)
            // Year 3 -> 2023 Join (23JJ)
            // Year 2 -> 2024 Join (24JJ)
            // Year 1 -> 2025 Join (25JJ)
            const batchUser = 26 - year;
            const prefix = `${batchUser}JJ1A12`;

            // 10 students per year
            for (let i = 1; i <= 10; i++) {
                // Odd sem (1) for first 5, Even sem (2) for next 5
                const semester = i <= 5 ? '1' : '2';
                const sNo = i.toString().padStart(2, '0');

                students.push({
                    rollNumber: `${prefix}${sNo}`,
                    name: `Student Y${year} S${semester} - ${i}`,
                    year: year.toString(),
                    semester: semester,
                    course: course,
                    department: 'IT',
                    email: `student${year}${semester}${i}@jntugv.edu.in`
                });
            }
        }

        for (const student of students) {
            await Student.findOneAndUpdate(
                { rollNumber: student.rollNumber },
                student,
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
        }

        console.log(`Seeded ${students.length} students successfully!`);
        process.exit();
    } catch (error) {
        console.error('Error seeding students:', error);
        process.exit(1);
    }
};

seedStudents();
