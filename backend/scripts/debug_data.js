const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1);
    }
};

const Department = require('../models/departmentModel');
const Faculty = require('../models/facultyModel');

const debugData = async () => {
    await connectDB();

    try {
        const depts = await Department.find({});
        console.log('--- DEPARTMENTS ---');
        console.log(JSON.stringify(depts, null, 2));

        const faculty = await Faculty.find({});
        console.log('--- FACULTY ---');
        console.log(`Count: ${faculty.length}`);
        if (faculty.length > 0) console.log(JSON.stringify(faculty[0], null, 2)); // Show sample

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.disconnect();
    }
};

debugData();
