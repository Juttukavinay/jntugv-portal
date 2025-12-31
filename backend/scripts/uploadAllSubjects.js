const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Course = require('../models/courseModel');
const Subject = require('../models/subjectModel');
const connectDB = require('../config/db');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const subjectsData = [
    // I-B.Tech I Sem
    { semester: 'I-B.Tech I Sem', sNo: 1, category: 'BS', courseCode: 'R23BS01', courseName: 'Linear Algebra & Calculus', L: 3, T: 0, P: 0, credits: 3 },
    { semester: 'I-B.Tech I Sem', sNo: 2, category: 'BS', courseCode: 'R23BS03T', courseName: 'Engineering Physics', L: 3, T: 0, P: 0, credits: 3 },
    { semester: 'I-B.Tech I Sem', sNo: 3, category: 'HS', courseCode: 'R23HS01T', courseName: 'Communicative English', L: 2, T: 0, P: 0, credits: 2 },
    { semester: 'I-B.Tech I Sem', sNo: 4, category: 'ES', courseCode: 'R23ES01', courseName: 'Basic Civil & Mechanical Engineering', L: 3, T: 0, P: 0, credits: 3 },
    { semester: 'I-B.Tech I Sem', sNo: 5, category: 'ES', courseCode: 'R23ES07T', courseName: 'Introduction to Programming', L: 3, T: 0, P: 0, credits: 3 },
    { semester: 'I-B.Tech I Sem', sNo: 6, category: 'HS', courseCode: 'R23HS01P', courseName: 'Communicative English Lab', L: 0, T: 0, P: 2, credits: 1 },
    { semester: 'I-B.Tech I Sem', sNo: 7, category: 'BS', courseCode: 'R23BS03P', courseName: 'Engineering Physics Lab', L: 0, T: 0, P: 2, credits: 1 },
    { semester: 'I-B.Tech I Sem', sNo: 8, category: 'ES', courseCode: 'R23ES02', courseName: 'Engineering Workshop', L: 0, T: 0, P: 3, credits: 1.5 },
    { semester: 'I-B.Tech I Sem', sNo: 9, category: 'ES', courseCode: 'R23ES06', courseName: 'IT Workshop', L: 0, T: 0, P: 2, credits: 1 },
    { semester: 'I-B.Tech I Sem', sNo: 10, category: 'ES', courseCode: 'R23ES07P', courseName: 'Computer Programming Lab', L: 0, T: 0, P: 3, credits: 1.5 },
    { semester: 'I-B.Tech I Sem', sNo: 11, category: 'Audit', courseCode: 'R23MC01', courseName: 'Health and Wellness, Yoga, and Sports', L: 0, T: 0, P: 1, credits: 0.5 },

    // I-B.Tech II Sem
    { semester: 'I-B.Tech II Sem', sNo: 1, category: 'BS', courseCode: 'R23BS02', courseName: 'Differential Equations and Vector calculus', L: 3, T: 0, P: 0, credits: 3 },
    { semester: 'I-B.Tech II Sem', sNo: 2, category: 'BS', courseCode: 'R23BS05T', courseName: 'Chemistry', L: 3, T: 0, P: 0, credits: 3 },
    { semester: 'I-B.Tech II Sem', sNo: 3, category: 'ES', courseCode: 'R23ES03', courseName: 'Engineering Graphics', L: 1, T: 0, P: 4, credits: 3 },
    { semester: 'I-B.Tech II Sem', sNo: 4, category: 'ES', courseCode: 'R23ES04', courseName: 'Basic Electrical & Electronics Engineering', L: 3, T: 0, P: 0, credits: 3 },
    { semester: 'I-B.Tech II Sem', sNo: 5, category: 'PC', courseCode: 'R23PC04T', courseName: 'Data Structures', L: 3, T: 0, P: 0, credits: 3 },
    { semester: 'I-B.Tech II Sem', sNo: 6, category: 'BS', courseCode: 'R23BS05P', courseName: 'Chemistry Lab', L: 0, T: 0, P: 2, credits: 1 },
    { semester: 'I-B.Tech II Sem', sNo: 7, category: 'ES', courseCode: 'R23ES05', courseName: 'Electrical & Electronics Engineering workshop', L: 0, T: 0, P: 3, credits: 1.5 },
    { semester: 'I-B.Tech II Sem', sNo: 8, category: 'PC', courseCode: 'R23PC04P', courseName: 'Data Structures Lab', L: 0, T: 0, P: 3, credits: 1.5 },
    { semester: 'I-B.Tech II Sem', sNo: 9, category: 'Audit', courseCode: 'R23MC02', courseName: 'NSS/NCC/Scouts & Guides/Community Service', L: 0, T: 0, P: 1, credits: 0.5 },

    // II-B.Tech I Sem
    { semester: 'II-B.Tech I Sem', sNo: 1, category: 'BS & H', courseCode: 'R23BSH01', courseName: 'Mathematical Foundations of Computer Science', L: 3, T: 0, P: 0, credits: 3 },
    { semester: 'II-B.Tech I Sem', sNo: 2, category: 'BS & H', courseCode: 'R23BSH02', courseName: 'Universal Human Values - Understanding Harmony', L: 2, T: 1, P: 0, credits: 3 },
    { semester: 'II-B.Tech I Sem', sNo: 3, category: 'Engineering Science', courseCode: 'R23ES08', courseName: 'Digital Logic & Computer Organization', L: 3, T: 0, P: 0, credits: 3 },
    { semester: 'II-B.Tech I Sem', sNo: 4, category: 'Professional Core', courseCode: 'R23PC01', courseName: 'Software Engineering', L: 3, T: 0, P: 0, credits: 3 },
    { semester: 'II-B.Tech I Sem', sNo: 5, category: 'Professional Core', courseCode: 'R23PC02', courseName: 'Object Oriented Programming Through Java', L: 3, T: 0, P: 0, credits: 3 },
    { semester: 'II-B.Tech I Sem', sNo: 6, category: 'Professional Core', courseCode: 'R23PC03', courseName: 'CASE Tools Lab', L: 0, T: 0, P: 3, credits: 1.5 },
    { semester: 'II-B.Tech I Sem', sNo: 7, category: 'Professional Core', courseCode: 'R23PC05', courseName: 'Object Oriented Programming Through Java Lab', L: 0, T: 0, P: 3, credits: 1.5 },
    { semester: 'II-B.Tech I Sem', sNo: 8, category: 'Skill Enhancement', courseCode: 'R23SC01', courseName: 'Python Programming', L: 0, T: 1, P: 2, credits: 2 },
    { semester: 'II-B.Tech I Sem', sNo: 9, category: 'Audit', courseCode: 'R23MC03', courseName: 'Environmental Science', L: 2, T: 0, P: 0, credits: 0 },

    // II-B.Tech II Sem
    // II-B.Tech II Sem
    { semester: 'II-B.Tech II Sem', sNo: 1, category: 'Management Course-I', courseCode: 'R23MC04', courseName: 'Managerial Economics and Financial Analysis', L: 2, T: 0, P: 0, credits: 2 },
    { semester: 'II-B.Tech II Sem', sNo: 2, category: 'Engineering Science/ Basic Science', courseCode: 'R23BS04', courseName: 'Probability & Statistics', L: 3, T: 0, P: 0, credits: 3 },
    { semester: 'II-B.Tech II Sem', sNo: 3, category: 'Professional Core', courseCode: 'R23PC06', courseName: 'Operating Systems', L: 3, T: 0, P: 0, credits: 3 },
    { semester: 'II-B.Tech II Sem', sNo: 4, category: 'Professional Core', courseCode: 'R23PC07', courseName: 'Database Management Systems', L: 3, T: 0, P: 0, credits: 3 },
    { semester: 'II-B.Tech II Sem', sNo: 5, category: 'Professional Core', courseCode: 'R23PC08', courseName: 'Design and Analysis of Algorithms', L: 3, T: 0, P: 0, credits: 3 },
    { semester: 'II-B.Tech II Sem', sNo: 6, category: 'Professional Core', courseCode: 'R23PC09', courseName: 'Operating Systems Lab', L: 0, T: 0, P: 3, credits: 1.5 },
    { semester: 'II-B.Tech II Sem', sNo: 7, category: 'Professional Core', courseCode: 'R23PC10', courseName: 'Database Management Systems Lab', L: 0, T: 0, P: 3, credits: 1.5 },
    { semester: 'II-B.Tech II Sem', sNo: 8, category: 'Skill Enhancement Course', courseCode: 'R23SC02', courseName: 'Django Framework', L: 0, T: 1, P: 2, credits: 2 },
    { semester: 'II-B.Tech II Sem', sNo: 9, category: 'BS & H', courseCode: 'R23BSH03', courseName: 'Design Thinking & Innovation', L: 1, T: 0, P: 2, credits: 2 },

    // III-B.Tech I Sem
    { semester: 'III-B.Tech I Sem', sNo: 1, category: 'PC', courseCode: 'R23PC11', courseName: 'Advanced Java', L: 3, T: 0, P: 0, credits: 3 },
    { semester: 'III-B.Tech I Sem', sNo: 2, category: 'PC', courseCode: 'R23PC12', courseName: 'Computer Networks', L: 3, T: 0, P: 0, credits: 3 },
    { semester: 'III-B.Tech I Sem', sNo: 3, category: 'PC', courseCode: 'R23PC13', courseName: 'Automata Theory & Compiler Design', L: 3, T: 0, P: 0, credits: 3 },
    { semester: 'III-B.Tech I Sem', sNo: 4, category: 'PE', courseCode: 'R23PE01', courseName: 'Professional Elective-I', L: 3, T: 0, P: 0, credits: 3 },
    { semester: 'III-B.Tech I Sem', sNo: 5, category: 'OE', courseCode: 'R23OE01', courseName: 'Open Elective-I', L: 3, T: 0, P: 0, credits: 3 },
    { semester: 'III-B.Tech I Sem', sNo: 6, category: 'PC', courseCode: 'R23PC14', courseName: 'Advanced Java Lab', L: 0, T: 0, P: 3, credits: 1.5 },
    { semester: 'III-B.Tech I Sem', sNo: 7, category: 'PC', courseCode: 'R23PC15', courseName: 'Computer Networks Lab', L: 0, T: 0, P: 3, credits: 1.5 },
    { semester: 'III-B.Tech I Sem', sNo: 8, category: 'Skill', courseCode: 'R23SC03', courseName: 'Full Stack Development I', L: 0, T: 1, P: 2, credits: 2 },
    { semester: 'III-B.Tech I Sem', sNo: 9, category: 'ES', courseCode: 'R23ES09', courseName: 'User Interface Design using Flutter', L: 0, T: 0, P: 2, credits: 1 },
    { semester: 'III-B.Tech I Sem', sNo: 10, category: 'SIP', courseCode: 'R23SIP01', courseName: 'Evaluation of Community Service Internship', L: 0, T: 0, P: 0, credits: 2 },

    // III-B.Tech II Sem
    { semester: 'III-B.Tech II Sem', sNo: 1, category: 'PC', courseCode: 'R23PC16', courseName: 'Advanced Data Structures', L: 3, T: 0, P: 0, credits: 3 },
    { semester: 'III-B.Tech II Sem', sNo: 2, category: 'PC', courseCode: 'R23PC17', courseName: 'Cryptography & Network Security', L: 3, T: 0, P: 0, credits: 3 },
    { semester: 'III-B.Tech II Sem', sNo: 3, category: 'PC', courseCode: 'R23PC18', courseName: 'Machine Learning', L: 3, T: 0, P: 0, credits: 3 },
    { semester: 'III-B.Tech II Sem', sNo: 4, category: 'PE', courseCode: 'R23PE02', courseName: 'Professional Elective-II', L: 3, T: 0, P: 0, credits: 3 },
    { semester: 'III-B.Tech II Sem', sNo: 5, category: 'PE', courseCode: 'R23PE03', courseName: 'Professional Elective-III', L: 3, T: 0, P: 0, credits: 3 },
    { semester: 'III-B.Tech II Sem', sNo: 6, category: 'OE', courseCode: 'R23OE02', courseName: 'Open Elective-II', L: 3, T: 0, P: 0, credits: 3 },
    { semester: 'III-B.Tech II Sem', sNo: 7, category: 'PC', courseCode: 'R23PC19', courseName: 'Advanced Data Structures Lab', L: 0, T: 0, P: 3, credits: 1.5 },
    { semester: 'III-B.Tech II Sem', sNo: 8, category: 'PC', courseCode: 'R23PC20', courseName: 'Machine Learning Lab', L: 0, T: 0, P: 3, credits: 1.5 },
    { semester: 'III-B.Tech II Sem', sNo: 9, category: 'Skill', courseCode: 'R23SC04', courseName: 'Salesforce AI Agent', L: 0, T: 1, P: 2, credits: 2 },
    { semester: 'III-B.Tech II Sem', sNo: 10, category: 'Audit', courseCode: 'R23MC05', courseName: 'Technical Paper Writing & IPR', L: 2, T: 0, P: 0, credits: 0 },

    // IV-B.Tech I Sem
    { semester: 'IV-B.Tech I Sem', sNo: 1, category: 'Professional Core', courseCode: 'R23PC21', courseName: 'Internet of Things', L: 3, T: 0, P: 0, credits: 3 },
    { semester: 'IV-B.Tech I Sem', sNo: 2, category: 'Management Course-II', courseCode: 'R23MC06', courseName: 'Human Resources & Project Management', L: 2, T: 0, P: 0, credits: 2 },
    { semester: 'IV-B.Tech I Sem', sNo: 3, category: 'Professional Elective-IV', courseCode: 'R23PE04', courseName: 'Professional Elective-IV', L: 3, T: 0, P: 0, credits: 3 },
    { semester: 'IV-B.Tech I Sem', sNo: 4, category: 'Professional Elective-V', courseCode: 'R23PE05', courseName: 'Professional Elective-V', L: 3, T: 0, P: 0, credits: 3 },
    { semester: 'IV-B.Tech I Sem', sNo: 5, category: 'Open Elective-III', courseCode: 'R23OE03', courseName: 'Open Elective-III', L: 3, T: 0, P: 0, credits: 3 },
    { semester: 'IV-B.Tech I Sem', sNo: 6, category: 'Open Elective-IV', courseCode: 'R23OE04', courseName: 'Open Elective-IV', L: 3, T: 0, P: 0, credits: 3 },
    { semester: 'IV-B.Tech I Sem', sNo: 7, category: 'Skill Enhancement Course', courseCode: 'R23SC05', courseName: 'Prompt Engineering', L: 0, T: 1, P: 2, credits: 2 },
    { semester: 'IV-B.Tech I Sem', sNo: 8, category: 'Audit Course', courseCode: 'R23MC07', courseName: 'Constitution of India', L: 2, T: 0, P: 0, credits: 0 },
    { semester: 'IV-B.Tech I Sem', sNo: 9, category: 'Internship', courseCode: 'R23SIP02', courseName: 'Evaluation of Industry Internship / Mini Project', L: 0, T: 0, P: 0, credits: 2 }
];

const run = async () => {
    try {
        await connectDB();

        let course = await Course.findOne({ department: 'IT', regulation: 'R23' });
        if (!course) {
            console.log('Creating new Course: B.Tech IT R23');
            course = await Course.create({
                regulation: 'R23',
                department: 'IT',
                program: 'UG',
                courseName: 'B.Tech'
            });
        }

        console.log(`Using Course ID: ${course._id}`);

        // Remove existing subjects for this course (or all? User said upload all this, implying fresh start for these sem)
        // I'll filter by the semesters I'm uploading to be safe.
        const semesters = [...new Set(subjectsData.map(s => s.semester))];
        await Subject.deleteMany({ courseId: course._id, semester: { $in: semesters } });
        console.log('Cleared existing subjects for relevant semesters.');

        for (const sub of subjectsData) {
            await Subject.create({
                courseId: course._id,
                ...sub
            });
        }

        console.log(`Uploaded ${subjectsData.length} subjects.`);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
