const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Subject = require('../models/subjectModel');
const connectDB = require('../config/db');

dotenv.config({ path: path.join(__dirname, '../.env') });

const run = async () => {
    await connectDB();
    const subs = await Subject.find({ semester: 'I-B.Tech I Sem' }).sort({ sNo: 1 });
    console.log('--- I-B.Tech I Sem Subjects ---');
    subs.forEach(s => {
        console.log(`${s.sNo}. ${s.courseName} (${s.category}) [${s.courseCode}] - Credits: ${s.credits}`);
    });

    // Calculate total
    const total = subs.reduce((sum, s) => sum + s.credits, 0);
    console.log(`Total Credits: ${total}`);

    process.exit();
};

run();
