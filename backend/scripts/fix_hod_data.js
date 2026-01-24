const mongoose = require('mongoose');
const Faculty = require('../models/facultyModel');
const Department = require('../models/departmentModel');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const fix = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/jntugv-portal');
        console.log('Connected to DB');

        // 1. Find exact HOD by email
        const bindu = await Faculty.findOne({ email: 'drch1@jntugv.edu.in' });
        if (!bindu) return console.log('HOD User Not Found (drch1@jntugv.edu.in)');

        console.log(`Fixing HOD for: ${bindu.name}`);

        // 2. Update Dept (Force IT)
        await Department.findOneAndUpdate(
            { name: 'IT' },
            { hodId: bindu._id, hodName: bindu.name }
        );

        // 3. Update User Role
        await Faculty.findByIdAndUpdate(bindu._id, { role: 'hod' });

        console.log('SUCCESS: Bindu is now HOD of IT (Data Fixed).');

    } catch (e) {
        console.error(e);
    } finally {
        mongoose.connection.close();
    }
};

fix();
