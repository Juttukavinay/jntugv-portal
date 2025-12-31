const mongoose = require('mongoose');
const Subject = require('./models/subjectModel');
const Course = require('./models/courseModel');
require('dotenv').config();

const clearData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');

        // Clear Subjects
        const subjectResult = await Subject.deleteMany({});
        console.log(`Deleted ${subjectResult.deletedCount} subjects.`);

        // Clear Courses (Since subjects are linked to courses, we shoud probably clear courses too to have a clean slate)
        const courseResult = await Course.deleteMany({});
        console.log(`Deleted ${courseResult.deletedCount} courses.`);

        console.log('Database subject data cleared successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error clearing data:', error);
        process.exit(1);
    }
};

clearData();
