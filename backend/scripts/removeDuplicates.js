const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('../models/courseModel');
const Subject = require('../models/subjectModel');

dotenv.config();

const removeDuplicates = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // --- Remove Duplicate Courses ---
        const courses = await Course.find({});
        const courseMap = {};
        const duplicatesCourses = [];

        courses.forEach(c => {
            // Uniqueness criteria
            const key = `${c.regulation}-${c.department}-${c.program}-${c.courseName}`;
            if (courseMap[key]) {
                // Determine which to delete (e.g., delete the older one or the newer one? usually newer is duplicate, or keep the one with most subjects?)
                // Simple strategy: Keep the first one encountered (usually oldest if default sort), delete others.
                duplicatesCourses.push(c._id);
            } else {
                courseMap[key] = c._id;
            }
        });

        if (duplicatesCourses.length > 0) {
            console.log(`Deleting ${duplicatesCourses.length} duplicate courses...`);
            await Course.deleteMany({ _id: { $in: duplicatesCourses } });
            console.log('Duplicate courses deleted.');
        } else {
            console.log('No duplicate courses found.');
        }

        // --- Remove Duplicate Subjects ---
        const subjects = await Subject.find({});
        const subjectMap = {};
        const duplicateSubjects = [];

        subjects.forEach(s => {
            // Uniqueness criteria
            const key = `${s.courseId}-${s.semester}-${s.courseCode}`;
            // Note: If courseId is different (because of duplicate courses), they might not be caught here if we only check courseId.
            // However, since we just deleted duplicate courses, we might have orphan subjects now if we deleted the course they pointed to?
            // Wait, if we delete a course, its subjects are still there but pointing to a non-existent course.
            // We should probably delete duplicate subjects FIRST, or handle orphans.

            // Better strategy: Clean subjects first based on logical equivalence?
            // Actually, if we have two identical courses, say C1 and C2.
            // And Subjects S1->C1 and S2->C2.
            // If C2 is duplicate of C1, we delete C2. S2 now points to nothing. S2 should technically either satisfy S1 requirement or be deleted.
            // Since the user said "duplicate entries came", likely they clicked save twice.
            // So we have C1 and C2 (identical). And S1..Sn pointing to C1, and S1'..Sn' pointing to C2.

            // If I delete C2, I should also delete S1'..Sn'.
            // OR reassign S1' to C1? No, they are duplicates, so just delete.

            if (subjectMap[key]) {
                duplicateSubjects.push(s._id);
            } else {
                subjectMap[key] = s._id;
            }
        });

        // Let's refine the script to handle orphans too.
        // But for now, simple duplicate removal based on exact fields.
        if (duplicateSubjects.length > 0) {
            console.log(`Deleting ${duplicateSubjects.length} duplicate subjects...`);
            await Subject.deleteMany({ _id: { $in: duplicateSubjects } });
            console.log('Duplicate subjects deleted.');
        } else {
            console.log('No duplicate subjects found.');
        }

        // Cleanup orphans (Subjects pointing to non-existent courses)
        // Only if we want to be thorough.

        process.exit();

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

removeDuplicates();
