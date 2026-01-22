const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Subject = require('../models/subjectModel');
const Course = require('../models/courseModel');

dotenv.config({ path: './backend/.env' });
connectDB();

const seedSubjects = async () => {
    try {
        console.log('🧹 Clearing old data...');
        await Subject.deleteMany({});
        await Course.deleteMany({});

        // --- Create Courses ---
        const btech = await Course.create({
            regulation: 'R23',
            department: 'IT',
            program: 'UG',
            courseName: 'B.Tech',
            fileName: 'Seeded Data'
        });

        const mtech = await Course.create({
            regulation: 'R23',
            department: 'IT',
            program: 'PG',
            courseName: 'M.Tech',
            fileName: 'Seeded Data'
        });

        const mca = await Course.create({
            regulation: 'R23',
            department: 'IT',
            program: 'PG',
            courseName: 'MCA',
            fileName: 'Seeded Data'
        });

        console.log('✅ Courses Created:', btech._id, mtech._id, mca._id);

        const subjectsData = [
            // --- B.Tech I-I ---
            { courseId: btech._id, semester: 'I-B.Tech I Sem', sNo: 1, category: 'BS', courseCode: 'R23BS01', courseName: 'Linear Algebra & Calculus', L: 3, T: 0, P: 0, credits: 3 },
            { courseId: btech._id, semester: 'I-B.Tech I Sem', sNo: 2, category: 'BS', courseCode: 'R23BS03T', courseName: 'Engineering Physics', L: 3, T: 0, P: 0, credits: 3 },
            { courseId: btech._id, semester: 'I-B.Tech I Sem', sNo: 3, category: 'HS', courseCode: 'R23HS01T', courseName: 'Communicative English', L: 2, T: 0, P: 0, credits: 2 },
            { courseId: btech._id, semester: 'I-B.Tech I Sem', sNo: 4, category: 'ES', courseCode: 'R23ES01', courseName: 'Basic Civil & Mechanical Engineering', L: 3, T: 0, P: 0, credits: 3 },
            { courseId: btech._id, semester: 'I-B.Tech I Sem', sNo: 5, category: 'ES', courseCode: 'R23ES07T', courseName: 'Introduction to Programming', L: 3, T: 0, P: 0, credits: 3 },
            { courseId: btech._id, semester: 'I-B.Tech I Sem', sNo: 6, category: 'HS', courseCode: 'R23HS01P', courseName: 'Communicative English Lab', L: 0, T: 0, P: 2, credits: 1 },
            { courseId: btech._id, semester: 'I-B.Tech I Sem', sNo: 7, category: 'BS', courseCode: 'R23BS03P', courseName: 'Engineering Physics Lab', L: 0, T: 0, P: 2, credits: 1 },
            { courseId: btech._id, semester: 'I-B.Tech I Sem', sNo: 8, category: 'BS', courseCode: 'R23ES02', courseName: 'Engineering Workshop', L: 0, T: 0, P: 3, credits: 1.5 },
            { courseId: btech._id, semester: 'I-B.Tech I Sem', sNo: 9, category: 'ES', courseCode: 'R23ES06', courseName: 'IT Workshop', L: 0, T: 0, P: 2, credits: 1 },
            { courseId: btech._id, semester: 'I-B.Tech I Sem', sNo: 10, category: 'ES', courseCode: 'R23ES07P', courseName: 'Computer Programming Lab', L: 0, T: 0, P: 3, credits: 1.5 },
            { courseId: btech._id, semester: 'I-B.Tech I Sem', sNo: 11, category: 'Audit', courseCode: 'R23MC01', courseName: 'Health and Wellness, Yoga, and Sports', L: 0, T: 0, P: 1, credits: 0.5 },

            // --- B.Tech I-II ---
            { courseId: btech._id, semester: 'I-B.Tech II Sem', sNo: 1, category: 'BS', courseCode: 'R23BS02', courseName: 'Differential Equations and Vector Calculus', L: 3, T: 0, P: 0, credits: 3 },
            { courseId: btech._id, semester: 'I-B.Tech II Sem', sNo: 2, category: 'BS', courseCode: 'R23BS04T', courseName: 'Engineering Chemistry', L: 3, T: 0, P: 0, credits: 3 },
            { courseId: btech._id, semester: 'I-B.Tech II Sem', sNo: 3, category: 'ES', courseCode: 'R23ES03T', courseName: 'Basic Electrical & Electronics Engineering', L: 3, T: 0, P: 0, credits: 3 },
            { courseId: btech._id, semester: 'I-B.Tech II Sem', sNo: 4, category: 'ES', courseCode: 'R23ES04', courseName: 'Engineering Graphics', L: 1, T: 0, P: 4, credits: 3 },
            { courseId: btech._id, semester: 'I-B.Tech II Sem', sNo: 5, category: 'PC', courseCode: 'R23PC01T', courseName: 'Data Structures', L: 3, T: 0, P: 0, credits: 3 },
            { courseId: btech._id, semester: 'I-B.Tech II Sem', sNo: 6, category: 'BS', courseCode: 'R23BS04P', courseName: 'Engineering Chemistry Lab', L: 0, T: 0, P: 2, credits: 1 },
            { courseId: btech._id, semester: 'I-B.Tech II Sem', sNo: 7, category: 'ES', courseCode: 'R23ES03P', courseName: 'Electrical & Electronics Engineering Lab', L: 0, T: 0, P: 3, credits: 1.5 },
            { courseId: btech._id, semester: 'I-B.Tech II Sem', sNo: 8, category: 'PC', courseCode: 'R23PC01P', courseName: 'Data Structures Lab', L: 0, T: 0, P: 3, credits: 1.5 },
            { courseId: btech._id, semester: 'I-B.Tech II Sem', sNo: 9, category: 'Audit', courseCode: 'R23MC02', courseName: 'NSS/NCC/Scouts & Guides/Community Service', L: 0, T: 0, P: 1, credits: 0.5 },

            // --- B.Tech II-I ---
            { courseId: btech._id, semester: 'II-B.Tech I Sem', sNo: 1, category: 'BS', courseCode: 'R20BS2103', courseName: 'Mathematics-III', L: 3, T: 0, P: 0, credits: 3 },
            { courseId: btech._id, semester: 'II-B.Tech I Sem', sNo: 2, category: 'PC', courseCode: 'R20CS2101', courseName: 'Mathematical Foundations of Computer Science', L: 3, T: 0, P: 0, credits: 3 },
            { courseId: btech._id, semester: 'II-B.Tech I Sem', sNo: 3, category: 'PC', courseCode: 'R20CS2102', courseName: 'Software Engineering', L: 3, T: 0, P: 0, credits: 3 },
            { courseId: btech._id, semester: 'II-B.Tech I Sem', sNo: 4, category: 'PC', courseCode: 'R20CS2103', courseName: 'Python Programming', L: 3, T: 0, P: 0, credits: 3 },
            { courseId: btech._id, semester: 'II-B.Tech I Sem', sNo: 6, category: 'PC', courseCode: 'R20CS2105', courseName: 'Python Programming Lab', L: 0, T: 0, P: 3, credits: 1.5 },
            { courseId: btech._id, semester: 'II-B.Tech I Sem', sNo: 7, category: 'PC', courseCode: 'R20CS2106', courseName: 'Software Engineering Lab', L: 0, T: 0, P: 3, credits: 1.5 },
            { courseId: btech._id, semester: 'II-B.Tech I Sem', sNo: 9, category: 'SC', courseCode: 'R20CS2108', courseName: 'Skill Oriented Course - I', L: 1, T: 0, P: 2, credits: 2 },

            // --- B.Tech II-II ---
            { courseId: btech._id, semester: 'II-B.Tech II Sem', sNo: 1, category: 'BS', courseCode: 'R20BS2203', courseName: 'Probability and Statistics', L: 3, T: 0, P: 0, credits: 3 },
            { courseId: btech._id, semester: 'II-B.Tech II Sem', sNo: 2, category: 'PC', courseCode: 'R20CS2201', courseName: 'Database Management Systems', L: 3, T: 0, P: 0, credits: 3 },
            { courseId: btech._id, semester: 'II-B.Tech II Sem', sNo: 3, category: 'PC', courseCode: 'R20CS2202', courseName: 'Formal Languages and Automata Theory', L: 3, T: 0, P: 0, credits: 3 },
            { courseId: btech._id, semester: 'II-B.Tech II Sem', sNo: 4, category: 'PC', courseCode: 'R20CS2203', courseName: 'Java Programming', L: 3, T: 0, P: 0, credits: 3 },
            { courseId: btech._id, semester: 'II-B.Tech II Sem', sNo: 5, category: 'PC', courseCode: 'R20CS2204', courseName: 'Database Management Systems Lab', L: 0, T: 0, P: 3, credits: 1.5 },
            { courseId: btech._id, semester: 'II-B.Tech II Sem', sNo: 7, category: 'PC', courseCode: 'R20CS2206', courseName: 'Java Programming Lab', L: 0, T: 0, P: 3, credits: 1.5 },
            { courseId: btech._id, semester: 'II-B.Tech II Sem', sNo: 9, category: 'SC', courseCode: 'R20CS2208', courseName: 'Skill Oriented Course - II', L: 1, T: 0, P: 2, credits: 2 },

            // --- B.Tech III-I ---
            { courseId: btech._id, semester: 'III-B.Tech I Sem', sNo: 1, category: 'PC', courseCode: 'R20CS3101', courseName: 'Computer Networks', L: 3, T: 0, P: 0, credits: 3 },
            { courseId: btech._id, semester: 'III-B.Tech I Sem', sNo: 2, category: 'PC', courseCode: 'R20CS3102', courseName: 'Design and Analysis of Algorithms', L: 3, T: 0, P: 0, credits: 3 },
            { courseId: btech._id, semester: 'III-B.Tech I Sem', sNo: 3, category: 'PC', courseCode: 'R20CS3103', courseName: 'Data Warehousing and Data Mining', L: 3, T: 0, P: 0, credits: 3 },
            { courseId: btech._id, semester: 'III-B.Tech I Sem', sNo: 4, category: 'PE', courseCode: 'R20CS3104', courseName: 'Artificial Intelligence', L: 3, T: 0, P: 0, credits: 3 },
            { courseId: btech._id, semester: 'III-B.Tech I Sem', sNo: 5, category: 'PE', courseCode: 'R20CS3105', courseName: 'Software Testing Methodologies', L: 3, T: 0, P: 0, credits: 3 },
            { courseId: btech._id, semester: 'III-B.Tech I Sem', sNo: 6, category: 'PC', courseCode: 'R20CS3106', courseName: 'Computer Networks Lab', L: 0, T: 0, P: 3, credits: 1.5 },
            { courseId: btech._id, semester: 'III-B.Tech I Sem', sNo: 7, category: 'PC', courseCode: 'R20CS3107', courseName: 'Data Mining Lab', L: 0, T: 0, P: 3, credits: 1.5 },
            { courseId: btech._id, semester: 'III-B.Tech I Sem', sNo: 8, category: 'PE', courseCode: 'R20CS3108', courseName: 'AI Tools & Techniques Lab', L: 0, T: 0, P: 3, credits: 1.5 },

            // --- B.Tech III-II ---
            { courseId: btech._id, semester: 'III-B.Tech II Sem', sNo: 1, category: 'PC', courseCode: 'R20CS3201', courseName: 'Machine Learning', L: 3, T: 0, P: 0, credits: 3 },
            { courseId: btech._id, semester: 'III-B.Tech II Sem', sNo: 2, category: 'PC', courseCode: 'R20CS3202', courseName: 'Web Technologies', L: 3, T: 0, P: 0, credits: 3 },
            { courseId: btech._id, semester: 'III-B.Tech II Sem', sNo: 3, category: 'PC', courseCode: 'R20CS3203', courseName: 'Cryptography and Network Security', L: 3, T: 0, P: 0, credits: 3 },
            { courseId: btech._id, semester: 'III-B.Tech II Sem', sNo: 6, category: 'PC', courseCode: 'R20CS3206', courseName: 'Machine Learning Lab', L: 0, T: 0, P: 3, credits: 1.5 },
            { courseId: btech._id, semester: 'III-B.Tech II Sem', sNo: 7, category: 'PC', courseCode: 'R20CS3207', courseName: 'Web Technologies Lab', L: 0, T: 0, P: 3, credits: 1.5 },

            // --- B.Tech IV-I ---
            { courseId: btech._id, semester: 'IV-B.Tech I Sem', sNo: 1, category: 'PE', courseCode: 'R20CS4101', courseName: 'Cloud Computing', L: 3, T: 0, P: 0, credits: 3 },
            { courseId: btech._id, semester: 'IV-B.Tech I Sem', sNo: 2, category: 'PE', courseCode: 'R20CS4102', courseName: 'Deep Learning', L: 3, T: 0, P: 0, credits: 3 },
            { courseId: btech._id, semester: 'IV-B.Tech I Sem', sNo: 3, category: 'OE', courseCode: 'R20CS4103', courseName: 'Open Elective - III', L: 3, T: 0, P: 0, credits: 3 },
            { courseId: btech._id, semester: 'IV-B.Tech I Sem', sNo: 4, category: 'OE', courseCode: 'R20CS4104', courseName: 'Open Elective - IV', L: 3, T: 0, P: 0, credits: 3 },
            { courseId: btech._id, semester: 'IV-B.Tech I Sem', sNo: 5, category: 'HS', courseCode: 'R20HS4105', courseName: 'Management Science', L: 3, T: 0, P: 0, credits: 3 },

            // --- B.Tech IV-II ---
            { courseId: btech._id, semester: 'IV-B.Tech II Sem', sNo: 1, category: 'PW', courseCode: 'R20CS4201', courseName: 'Project Work', L: 0, T: 0, P: 0, credits: 12 },

            // --- M.Tech I-I ---
            { courseId: mtech._id, semester: 'I-M.Tech I Sem', sNo: 1, category: 'PC', courseCode: 'MT2101', courseName: 'Advanced Data Structures & Algorithms', L: 3, T: 0, P: 0, credits: 3 },
            { courseId: mtech._id, semester: 'I-M.Tech I Sem', sNo: 2, category: 'PC', courseCode: 'MT2102', courseName: 'Mathematical Foundations of Computer Science', L: 3, T: 0, P: 0, credits: 3 },
            { courseId: mtech._id, semester: 'I-M.Tech I Sem', sNo: 3, category: 'PE', courseCode: 'MT2103', courseName: 'Machine Learning', L: 3, T: 0, P: 0, credits: 3 },
            { courseId: mtech._id, semester: 'I-M.Tech I Sem', sNo: 4, category: 'PC', courseCode: 'MT2104', courseName: 'ADS Lab', L: 0, T: 0, P: 4, credits: 2 },

            // --- M.Tech I-II ---
            { courseId: mtech._id, semester: 'I-M.Tech II Sem', sNo: 1, category: 'PC', courseCode: 'MT2201', courseName: 'Big Data Analytics', L: 3, T: 0, P: 0, credits: 3 },
            { courseId: mtech._id, semester: 'I-M.Tech II Sem', sNo: 2, category: 'PC', courseCode: 'MT2202', courseName: 'Advanced Network Security', L: 3, T: 0, P: 0, credits: 3 },
            { courseId: mtech._id, semester: 'I-M.Tech II Sem', sNo: 3, category: 'PE', courseCode: 'MT2203', courseName: 'Deep Learning', L: 3, T: 0, P: 0, credits: 3 },

            // --- MCA I-I ---
            { courseId: mca._id, semester: 'I-MCA I Sem', sNo: 1, category: 'PC', courseCode: 'MCA1101', courseName: 'Problem Solving with C', L: 3, T: 0, P: 0, credits: 3 },
            { courseId: mca._id, semester: 'I-MCA I Sem', sNo: 2, category: 'PC', courseCode: 'MCA1102', courseName: 'Computer Organization', L: 3, T: 0, P: 0, credits: 3 },

            // --- MCA I-II ---
            { courseId: mca._id, semester: 'I-MCA II Sem', sNo: 1, category: 'PC', courseCode: 'MCA1201', courseName: 'Object Oriented Programming through Java', L: 3, T: 0, P: 0, credits: 3 },
            { courseId: mca._id, semester: 'I-MCA II Sem', sNo: 2, category: 'PC', courseCode: 'MCA1202', courseName: 'Database Management Systems', L: 3, T: 0, P: 0, credits: 3 }
        ];

        await Subject.insertMany(subjectsData);
        console.log('✅ Subjects Seeded Successfully (B.Tech 1-4, M.Tech, MCA)');
        process.exit();
    } catch (error) {
        console.error('❌ Error seeding subjects:', error);
        process.exit(1);
    }
};

seedSubjects();
