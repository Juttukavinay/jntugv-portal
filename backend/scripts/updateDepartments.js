const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Faculty = require('../models/facultyModel');

dotenv.config({ path: 'backend/.env' });

const updateDepartments = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Database connected');

        const result = await Faculty.updateMany({}, { department: 'IT' });
        console.log(`Successfully updated ${result.modifiedCount} faculty records to IT department.`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error updating departments:', error);
        process.exit(1);
    }
};

updateDepartments();
