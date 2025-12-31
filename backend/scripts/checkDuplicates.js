const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('../models/courseModel');
const Subject = require('../models/subjectModel');

dotenv.config();

const checkDuplicates = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Check for Duplicate Courses
        const courses = await Course.find({});
        console.log(`Total Courses: ${courses.length}`);

        const courseMap = {};
        const duplicatesCourses = [];

        courses.forEach(c => {
            const key = `${c.regulation}-${c.department}-${c.program}-${c.courseName}`;
            if (courseMap[key]) {
                duplicatesCourses.push(c._id);
            } else {
                courseMap[key] = c._id;
            }
        });

        console.log(`Duplicate Courses Found: ${duplicatesCourses.length}`);
        if (duplicatesCourses.length > 0) console.log(duplicatesCourses);

        // Check for Duplicate Subjects
        const subjects = await Subject.find({});
        console.log(`Total Subjects: ${subjects.length}`);

        const subjectMap = {};
        const duplicateSubjects = [];

        subjects.forEach(s => {
            const key = `${s.courseId}-${s.semester}-${s.courseCode}`;
            if (subjectMap[key]) {
                duplicateSubjects.push(s._id);
            } else {
                subjectMap[key] = s._id;
            }
        });

        console.log(`Duplicate Subjects Found: ${duplicateSubjects.length}`);
        if (duplicateSubjects.length > 0) console.log(duplicateSubjects);

        process.exit();

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkDuplicates();
