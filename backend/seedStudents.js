const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Student = require('./models/studentModel');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const seedStudents = async () => {
    await connectDB();

    try {
        // Clear existing students to avoid dupes/conflicts for this seed
        // await Student.deleteMany({}); 
        // console.log('Existing students removed (optional - uncomment if needed)');

        const batches = [
            { year: '4', batchCode: '21' },
            { year: '3', batchCode: '22' },
            { year: '2', batchCode: '23' },
            { year: '1', batchCode: '24' }
        ];

        const semesters = ['1', '2'];
        const department = 'IT';

        let studentsToAdd = [];

        // Generate names
        const firstNames = ['Aditya', 'Sai', 'Rohan', 'Priya', 'Anjali', 'Karthik', 'Rahul', 'Sneha', 'Divya', 'Varun', 'Harsha', 'Deepa'];
        const lastNames = ['Reddy', 'Rao', 'Kumar', 'Sharma', 'Verma', 'Singh', 'Chowdary', 'Naidu', 'Murthy', 'Krishna'];

        const getRandomName = () => `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;

        for (const batch of batches) {
            for (const sem of semesters) {
                console.log(`Generating students for ${batch.year}-${sem}...`);

                for (let i = 1; i <= 10; i++) {
                    // Unique Roll Number Logic: BatchCode + Department Code (12 for IT) + Year(BatchYear) + Index
                    // Standard JNTU format: 21MH1A1201
                    // To differentiate semesters for this seed (since students are usually same year/sem in real life, but here we want fake data for all years), 
                    // we will just assign them to the current year/sem.
                    // Note: In reality, a student is in ONE sem at a time. But the user asked for "1-1 to 4-2 data". 
                    // This implies they want data available for testing VIEWS of those semesters.

                    // We will create unique roll numbers for each "Year-Sem" group so they don't collide if we insert them all.
                    // E.g., 1-1 student: 24MH1A1201, 1-2 student: 24MH1A1251 (artificially distinct)

                    const offset = sem === '1' ? 0 : 50;
                    const rollNumSuffix = (i + offset).toString().padStart(2, '0');
                    const rollNumber = `${batch.batchCode}MH1A12${rollNumSuffix}`;

                    studentsToAdd.push({
                        rollNumber: rollNumber,
                        name: getRandomName(),
                        year: batch.year,
                        semester: sem,
                        department: department,
                        email: `${rollNumber.toLowerCase()}@jntugv.edu.in`
                    });
                }
            }
        }

        // Upsert to avoid duplicate key errors if run multiple times
        for (const student of studentsToAdd) {
            await Student.updateOne(
                { rollNumber: student.rollNumber },
                { $set: student },
                { upsert: true }
            );
        }

        console.log(`Successfully seeded ${studentsToAdd.length} students!`);
        process.exit();

    } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
    }
};

seedStudents();
