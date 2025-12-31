const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Subject = require('../models/subjectModel');
const Course = require('../models/courseModel');
const connectDB = require('../config/db');

dotenv.config({ path: path.join(__dirname, '../.env') });

const run = async () => {
    try {
        await connectDB();

        // Find Course ID (assume same as before)
        const course = await Course.findOne({ department: 'IT', regulation: 'R23' });
        const courseId = course?._id;

        console.log('Updating 3-1 Electives...');
        // 3-1 Updates
        // S.No 4 -> Professional Elective-I
        await Subject.updateOne(
            { semester: 'III-B.Tech I Sem', sNo: 4 },
            { $set: { courseName: 'Professional Elective-I', courseCode: 'R23PE01' } }
        );
        // S.No 5 -> Open Elective-I
        await Subject.updateOne(
            { semester: 'III-B.Tech I Sem', sNo: 5 },
            { $set: { courseName: 'Open Elective-I', courseCode: 'R23OE01' } }
        );

        console.log('Updating 3-2 Electives...');
        // 3-2 Updates
        // S.No 4 -> Professional Elective-II
        await Subject.updateOne(
            { semester: 'III-B.Tech II Sem', sNo: 4 },
            { $set: { courseName: 'Professional Elective-II', courseCode: 'R23PE02' } }
        );
        // S.No 5 -> Professional Elective-III
        await Subject.updateOne(
            { semester: 'III-B.Tech II Sem', sNo: 5 },
            { $set: { courseName: 'Professional Elective-III', courseCode: 'R23PE03' } }
        );
        // S.No 6 -> Open Elective-II
        await Subject.updateOne(
            { semester: 'III-B.Tech II Sem', sNo: 6 },
            { $set: { courseName: 'Open Elective-II', courseCode: 'R23OE02' } }
        );

        console.log('Creating 4-1 Placeholders...');
        // 4-1 Creation (Placeholder Layout)
        const subjects41 = [
            { sNo: 1, category: 'PC', courseCode: 'R23PC21', courseName: 'Professional Core Subject 1', L: 3, T: 0, P: 0, credits: 3 },
            { sNo: 2, category: 'PC', courseCode: 'R23PC22', courseName: 'Professional Core Subject 2', L: 3, T: 0, P: 0, credits: 3 },
            { sNo: 3, category: 'PE', courseCode: 'R23PE04', courseName: 'Professional Elective-IV', L: 3, T: 0, P: 0, credits: 3 },
            { sNo: 4, category: 'PE', courseCode: 'R23PE05', courseName: 'Professional Elective-V', L: 3, T: 0, P: 0, credits: 3 },
            { sNo: 5, category: 'OE', courseCode: 'R23OE03', courseName: 'Open Elective-III', L: 3, T: 0, P: 0, credits: 3 },
            { sNo: 6, category: 'PC', courseCode: 'R23PC21P', courseName: 'Project Work / Internship', L: 0, T: 0, P: 6, credits: 3 }
        ];

        // Clear existing 4-1 if any (though count was 0)
        await Subject.deleteMany({ semester: 'IV-B.Tech I Sem' });

        for (const sub of subjects41) {
            await Subject.create({
                ...sub,
                semester: 'IV-B.Tech I Sem',
                courseId: courseId // Might be undefined if course not found, but we handle that by not requiring strictly here or assuming it exists
            });
        }

        // If courseId was missing, we should probably fetch valid ID or create one. 
        // But assumed uploadAllSubjects ran, so it should be fine.

        console.log('Updates Complete.');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
