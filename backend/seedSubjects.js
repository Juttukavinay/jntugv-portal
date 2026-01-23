const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Subject = require('./models/subjectModel');
const Course = require('./models/courseModel');

dotenv.config();

// Consolidated data for all semesters provided
const allSubjectsData = [
    // I B.Tech I Semester (Regulation R20 implied by user input, but user said "IT R20 Course Structure")
    // Assuming Department IT for all based on context
    {
        semester: "I-B.Tech I Sem",
        subjects: [
            { sNo: 1, courseCode: "R2011BS01", courseName: "Calculus and Differential Equations", L: 3, T: 0, P: 0, credits: 3, category: "Basic Science Course" },
            { sNo: 2, courseCode: "R2011BS04", courseName: "Applied Physics", L: 3, T: 0, P: 0, credits: 3, category: "Basic Science Course" },
            { sNo: 3, courseCode: "R2011ES15", courseName: "Problem solving and Programming using C", L: 3, T: 0, P: 0, credits: 3, category: "Engineering Science Courses" },
            { sNo: 4, courseCode: "R2011ES16", courseName: "Computer Engineering Workshop", L: 1, T: 0, P: 4, credits: 3, category: "Engineering Science Courses" },
            { sNo: 5, courseCode: "R2011HS01", courseName: "Communicative English", L: 3, T: 0, P: 0, credits: 3, category: "Humanities & Social Science" },
            { sNo: 6, courseCode: "R2011HS01A", courseName: "English Communication Skills Lab", L: 0, T: 0, P: 3, credits: 1.5, category: "Humanities & Social Science" },
            { sNo: 7, courseCode: "R2011BS04A", courseName: "Applied Physics lab", L: 0, T: 0, P: 3, credits: 1.5, category: "Basic Science Course" },
            { sNo: 8, courseCode: "R2011ES15A", courseName: "Problem solving and Programming using C Lab", L: 0, T: 0, P: 3, credits: 1.5, category: "Engineering Science Courses" },
            { sNo: 9, courseCode: "R2011MC01", courseName: "Environmental Science", L: 2, T: 0, P: 0, credits: 0, category: "Basic Science Course" } // Assuming category based on nature
        ]
    },
    // I B.Tech II Semester
    {
        semester: "I-B.Tech II Sem",
        subjects: [
            { sNo: 1, courseCode: "R2012BS02", courseName: "Linear Algebra and Numerical Methods", L: 3, T: 0, P: 0, credits: 3, category: "Basic Science Course" },
            { sNo: 2, courseCode: "R2012BS06", courseName: "Applied Chemistry", L: 3, T: 0, P: 0, credits: 3, category: "Basic Science Course" },
            { sNo: 3, courseCode: "R2012ES20", courseName: "Computer Organization & Architecture", L: 3, T: 0, P: 0, credits: 3, category: "Engineering Science Courses" },
            { sNo: 4, courseCode: "R2012ES21", courseName: "Data Structures", L: 3, T: 0, P: 0, credits: 3, category: "Engineering Science Courses" },
            { sNo: 5, courseCode: "R2012ES22", courseName: "Python Programming", L: 1, T: 0, P: 4, credits: 3, category: "Engineering Science Courses" },
            { sNo: 6, courseCode: "R2012BS06A", courseName: "Applied Chemistry Lab", L: 0, T: 0, P: 3, credits: 1.5, category: "Basic Science Course" },
            { sNo: 7, courseCode: "R2012ES21A", courseName: "Data Structures Lab", L: 0, T: 0, P: 3, credits: 1.5, category: "Engineering Science Courses" },
            { sNo: 8, courseCode: "R2012ES20A", courseName: "Digital Systems Lab", L: 0, T: 0, P: 3, credits: 1.5, category: "Engineering Science Courses" }
        ]
    },
    // II Year I Semester
    {
        semester: "II-B.Tech I Sem",
        subjects: [
            { sNo: 1, courseCode: "R2021BS02", courseName: "Discrete Mathematical Structures", L: 3, T: 0, P: 0, credits: 3, category: "Basic Science course" },
            { sNo: 2, courseCode: "R202112PC01", courseName: "Java Programming", L: 3, T: 0, P: 0, credits: 3, category: "Professional core Courses" },
            { sNo: 3, courseCode: "R202112PC02", courseName: "Advanced Data Structures", L: 3, T: 0, P: 0, credits: 3, category: "Professional core Courses" },
            { sNo: 4, courseCode: "R202112PC03", courseName: "Database Management Systems", L: 3, T: 0, P: 0, credits: 3, category: "Professional core Courses" },
            { sNo: 5, courseCode: "R202112PC04", courseName: "Principles of Programming Languages", L: 3, T: 0, P: 0, credits: 3, category: "Professional core Courses" },
            { sNo: 6, courseCode: "R202112PC01A", courseName: "Java Programming LAB", L: 0, T: 0, P: 3, credits: 1.5, category: "Professional core Courses" },
            { sNo: 7, courseCode: "R202112PC02A", courseName: "Advanced Data Structures LAB", L: 0, T: 0, P: 3, credits: 1.5, category: "Professional core Courses" },
            { sNo: 8, courseCode: "R202112PC03A", courseName: "Database Management Systems Lab", L: 0, T: 0, P: 3, credits: 1.5, category: "Professional core Courses" },
            { sNo: 9, courseCode: "R202112SC01", courseName: "Web Designing (Skill Oriented Lab)", L: 1, T: 0, P: 2, credits: 2, category: "Skill oriented course" },
            { sNo: 10, courseCode: "R2021MC01", courseName: "Constitution of India", L: 2, T: 0, P: 0, credits: 0, category: "Mandatory" }
        ]
    },
    // II Year II Semester
    {
        semester: "II-B.Tech II Sem",
        subjects: [
            { sNo: 1, courseCode: "R202212BS01", courseName: "Probability and Statistics", L: 3, T: 0, P: 0, credits: 3, category: "Basic Science Courses" },
            { sNo: 2, courseCode: "R202212ES01", courseName: "Principles of Software Engineering", L: 3, T: 0, P: 0, credits: 3, category: "Engineering Science Courses" },
            { sNo: 3, courseCode: "R202212PC01", courseName: "Computer Networks", L: 3, T: 0, P: 0, credits: 3, category: "Professional core Courses" },
            { sNo: 4, courseCode: "R202212PC02", courseName: "Operating Systems", L: 3, T: 0, P: 0, credits: 3, category: "Professional core Courses" },
            { sNo: 5, courseCode: "R2022HS01", courseName: "Managerial economics and financial analysis", L: 3, T: 0, P: 0, credits: 3, category: "Humanities and Social Sciences" },
            { sNo: 6, courseCode: "R202212ES01A", courseName: "Software Engineering Lab", L: 0, T: 0, P: 3, credits: 1.5, category: "Engineering Science Courses" },
            { sNo: 7, courseCode: "R202212PC01A", courseName: "Computer Networks LAB", L: 0, T: 0, P: 3, credits: 1.5, category: "Professional core Courses" },
            { sNo: 8, courseCode: "R202212PC02A", courseName: "Operating Systems Lab", L: 0, T: 0, P: 3, credits: 1.5, category: "Professional core Courses" },
            { sNo: 9, courseCode: "R202212SC01", courseName: "Data Exploration(Skill Oriented Lab)", L: 1, T: 0, P: 2, credits: 2, category: "Skill oriented course" }
        ]
    },
    // III Year I Semester
    {
        semester: "III-B.Tech I Sem",
        subjects: [
            { sNo: 1, courseCode: "R203112PC01", courseName: "Design And Analysis of Algorithms", L: 3, T: 0, P: 0, credits: 3, category: "Professional core Courses" },
            { sNo: 2, courseCode: "R203112PC02", courseName: "Data Warehousing & Data Mining", L: 3, T: 0, P: 0, credits: 3, category: "Professional core Courses" },
            { sNo: 3, courseCode: "R203112PC03", courseName: "Artificial Intelligence", L: 3, T: 0, P: 0, credits: 3, category: "Professional core Courses" },
            { sNo: 4, courseCode: "R203112OE01", courseName: "Open Elective Course", L: 2, T: 0, P: 2, credits: 3, category: "Open Elective Course" }, // Generic name as user gave options
            { sNo: 5, courseCode: "R203112PE01", courseName: "Professional Elective Course", L: 3, T: 0, P: 0, credits: 3, category: "Professional Elective courses" },
            { sNo: 6, courseCode: "R203112PC01A", courseName: "Data Mining Lab with R/Python/OCTAVE", L: 0, T: 0, P: 3, credits: 1.5, category: "Professional core Courses" },
            { sNo: 7, courseCode: "R203112PC02A", courseName: "AI Tools & Techniques Lab", L: 0, T: 0, P: 3, credits: 1.5, category: "Professional core Courses" },
            { sNo: 8, courseCode: "R203112SC01", courseName: "Unified Modeling Language (UML) Lab(Skill Oriented Lab)", L: 1, T: 0, P: 2, credits: 2, category: "Skill advanced course" },
            { sNo: 9, courseCode: "R2031MC01", courseName: "Professional Ethics and Human Values", L: 2, T: 0, P: 0, credits: 0, category: "Mandatory" },
            { sNo: 10, courseCode: "SUMMER_INTERN", courseName: "Summer Internship (2 Months)", L: 0, T: 0, P: 0, credits: 1.5, category: "Summer Internship" }
        ]
    },
    // III Year II Semester
    {
        semester: "III-B.Tech II Sem",
        subjects: [
            { sNo: 1, courseCode: "R203212PC01", courseName: "Advanced Java Programming", L: 3, T: 1, P: 0, credits: 3, category: "Professional core courses" },
            { sNo: 2, courseCode: "R203212PC02", courseName: "Automata & Compiler Design", L: 3, T: 0, P: 0, credits: 3, category: "Professional core courses" },
            { sNo: 3, courseCode: "R203212PC03", courseName: "Cryptography & Network Security", L: 3, T: 0, P: 0, credits: 3, category: "Professional core courses" },
            { sNo: 4, courseCode: "R203212OE01", courseName: "Professional Elective Course", L: 3, T: 0, P: 0, credits: 3, category: "Professional Elective courses" },
            { sNo: 5, courseCode: "R203212PE01", courseName: "Open Elective Course", L: 2, T: 0, P: 2, credits: 3, category: "Open Elective Course" },
            { sNo: 6, courseCode: "R203212PC01A", courseName: "Advanced Java Programming Lab", L: 0, T: 0, P: 3, credits: 1.5, category: "Professional core courses" },
            { sNo: 7, courseCode: "R203212PC02A", courseName: "Multimedia & Animation Lab", L: 0, T: 0, P: 3, credits: 1.5, category: "Professional core courses" },
            { sNo: 8, courseCode: "R203212PC03A", courseName: "Cryptography & Network Security Lab", L: 0, T: 0, P: 3, credits: 1.5, category: "Professional core courses" },
            { sNo: 9, courseCode: "R203212SC01", courseName: "Advanced Communication Skills Lab", L: 1, T: 0, P: 2, credits: 2, category: "Skill advanced course" },
            { sNo: 10, courseCode: "R2032MC01", courseName: "Intellectual Property Rights and Patents", L: 2, T: 0, P: 0, credits: 0, category: "Mandatory course" }
        ]
    },
    // IV Year I Semester
    {
        semester: "IV-B.Tech I Sem",
        subjects: [
            { sNo: 1, courseCode: "R204112PE01", courseName: "Professional Elective Course 1", L: 3, T: 0, P: 0, credits: 3, category: "Professional Elective courses" },
            { sNo: 2, courseCode: "R204112PE02", courseName: "Professional Elective Course 2", L: 3, T: 0, P: 0, credits: 3, category: "Professional Elective courses" },
            { sNo: 3, courseCode: "R204112PE03", courseName: "Professional Elective Course 3", L: 3, T: 0, P: 0, credits: 3, category: "Professional Elective courses" },
            { sNo: 4, courseCode: "R204112OE01", courseName: "Open Elective Course 1", L: 2, T: 0, P: 2, credits: 3, category: "Open Elective Courses" },
            { sNo: 5, courseCode: "R204112OE02", courseName: "Open Elective Course 2", L: 2, T: 0, P: 2, credits: 3, category: "Open Elective Courses" },
            { sNo: 6, courseCode: "R204112HS01", courseName: "Management and Organization Behavior", L: 3, T: 0, P: 0, credits: 3, category: "Humanities and Social Sciences" },
            { sNo: 7, courseCode: "R204112SC01", courseName: "Employability Skills", L: 1, T: 0, P: 2, credits: 2, category: "Skill oriented course" },
            { sNo: 8, courseCode: "SUMMER_INTERN_2", courseName: "Industrial/Research Internship", L: 0, T: 0, P: 0, credits: 3, category: "Internship" }
        ]
    }
];

const seedSubjects = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/jntugv-portal');
        console.log('MongoDB Connected');

        // 1. Create or Find the main Course (R20 - IT - B.Tech)
        // Check if exists
        let course = await Course.findOne({ regulation: 'R20', department: 'IT', courseName: 'B.Tech' });
        if (!course) {
            course = await Course.create({
                regulation: 'R20',
                department: 'IT',
                program: 'UG',
                courseName: 'B.Tech',
                fileName: 'Initial Seed'
            });
            console.log('Created new Course: R20 IT B.Tech');
        } else {
            console.log('Using existing Course: R20 IT B.Tech');
        }

        // 2. Loop through all Semesters and Subjects
        for (const semesterBatch of allSubjectsData) {
            const { semester, subjects } = semesterBatch;
            
            // Delete existing subjects for this semester/course to ensure clean seed
            await Subject.deleteMany({ courseId: course._id, semester: semester });
            console.log(`Cleared existing subjects for ${semester}`);

            // Add new subjects
            const subjectsToAdd = subjects.map(s => ({
                courseId: course._id,
                semester: semester,
                ...s
            }));

            await Subject.insertMany(subjectsToAdd);
            console.log(`Inserted ${subjectsToAdd.length} subjects for ${semester}`);
        }

        console.log('All Subjects Processed Successfully!');
        process.exit();

    } catch (error) {
        console.error('Error seeding subjects:', error);
        process.exit(1);
    }
};

seedSubjects();
