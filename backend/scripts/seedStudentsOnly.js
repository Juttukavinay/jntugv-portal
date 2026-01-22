const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Student = require('../models/studentModel');

dotenv.config();

const generateStudents = () => {
    let students = [];
    const department = 'IT'; // Defaulting all to IT as per context/faculty

    // B.Tech: 4 Years, 60 students each
    // Years: 1, 2, 3, 4
    // Batches (Assuming current academic year 2025-26 or similar for context)
    // 1st Year (2025 admitted): 25VV1A12..
    // 2nd Year (2024 admitted): 24VV1A12..
    // 3rd Year (2023 admitted): 23VV1A12..
    // 4th Year (2022 admitted): 22VV1A12..
    const btechYears = [
        { year: '1', batch: '25' },
        { year: '2', batch: '24' },
        { year: '3', batch: '23' },
        { year: '4', batch: '22' }
    ];

    btechYears.forEach(({ year, batch }) => {
        for (let i = 1; i <= 60; i++) {
            const rollSuffix = i < 10 ? `0${i}` : `${i}`;
            students.push({
                rollNumber: `${batch}VV1A12${rollSuffix}`,
                name: `B.Tech Student ${year}-${i}`,
                year: year,
                semester: '1', // Defaulting to 1st sem of that year for now
                course: 'B.Tech',
                department: department,
                email: `${batch}vv1a12${rollSuffix}@jntugv.edu`
            });
        }
    });

    // M.Tech: 2 Years, 30 students each
    // 1st Year (2025): 25VV1D12..
    // 2nd Year (2024): 24VV1D12..
    const mtechYears = [
        { year: '1', batch: '25' },
        { year: '2', batch: '24' }
    ];

    mtechYears.forEach(({ year, batch }) => {
        for (let i = 1; i <= 30; i++) {
            const rollSuffix = i < 10 ? `0${i}` : `${i}`;
            students.push({
                rollNumber: `${batch}VV1D12${rollSuffix}`,
                name: `M.Tech Student ${year}-${i}`,
                year: year,
                semester: '1',
                course: 'M.Tech',
                department: department,
                email: `${batch}vv1d12${rollSuffix}@jntugv.edu`
            });
        }
    });

    // MCA: 2 Years, 30 students each
    // 1st Year (2025): 25VV1F00..
    // 2nd Year (2024): 24VV1F00.. (Assuming 00 is code for MCA or similar)
    // Let's use 1F00 based on standard JNTU MCA patterns sometimes being different, but 1F is common for MCA.
    const mcaYears = [
        { year: '1', batch: '25' },
        { year: '2', batch: '24' }
    ];

    mcaYears.forEach(({ year, batch }) => {
        for (let i = 1; i <= 30; i++) {
            const rollSuffix = i < 10 ? `0${i}` : `${i}`;
            students.push({
                rollNumber: `${batch}VV1F00${rollSuffix}`,
                name: `MCA Student ${year}-${i}`,
                year: year,
                semester: '1',
                course: 'MCA',
                department: department, // MCA is often its own dept, but putting IT here as per "keep all... to IT" vibe or just IT stream.
                email: `${batch}vv1f00${rollSuffix}@jntugv.edu`
            });
        }
    });

    return students;
};

const importData = async () => {
    try {
        await connectDB();
        await Student.deleteMany({});
        console.log('Student Collection Cleared.');

        const students = generateStudents();
        await Student.insertMany(students);
        console.log(`Imported ${students.length} Students (B.Tech, M.Tech, MCA)!`);

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

importData();
