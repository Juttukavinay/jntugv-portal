const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Student = require('../models/studentModel');
const Faculty = require('../models/facultyModel');
const Subject = require('../models/subjectModel');

dotenv.config();
connectDB();

// ... (Students and Faculty data remains same, add Subjects below)
const students = Array.from({ length: 10 }, (_, i) => {
    const num = i + 1;
    const rollSuffix = num < 10 ? `0${num}` : `${num}`;
    return {
        rollNumber: `23vv5a12${rollSuffix}`,
        name: `Student ${num}`,
        year: '3',
        semester: '1',
        department: 'IT',
        email: `23vv5a12${rollSuffix}@jntugv.edu`
    };
});

const faculty = [
    { sNo: 1, name: 'Dr.Ch BinduMadhuri', qualification: 'Ph.D', university: 'GITAM', gradYear: '2014', designation: 'Asst. Prof. & Head', dateOfJoining: '04-01-2013', department: 'IT', type: 'Regular' },
    { sNo: 2, name: 'Dr G. Jaya Suma', qualification: 'Ph.D', university: 'Andhara University', gradYear: '2011', designation: 'Professor', dateOfJoining: '10-01-2013', department: 'CSE', type: 'Regular' },
    { sNo: 3, name: 'Dr.G. Madhavi', qualification: 'Ph.D', university: 'JNTUH', gradYear: '2017', designation: 'Asst. Prof.', dateOfJoining: '01-01-2013', department: 'CSE', type: 'Regular' },
    { sNo: 4, name: 'Dr.B. TirimulaRao', qualification: 'Ph.D', university: 'JNTUK', gradYear: '2020', designation: 'Asst. Prof.', dateOfJoining: '04-01-2013', department: 'CSE', type: 'Regular' },
    { sNo: 5, name: 'Mr.AnilWurity', qualification: 'M.Tech', university: 'GITAM', gradYear: '2011', designation: 'Asst. Prof.', dateOfJoining: '04-01-2013', department: 'CSE', type: 'Regular' },
    { sNo: 6, name: 'R.S.S.Jyothi', qualification: 'M.Tech', university: 'GITAM', gradYear: '2009', designation: 'Asst. Prof.', dateOfJoining: '18-06-2012', department: 'CST', type: 'Contract' },
    { sNo: 7, name: 'P.Eswar', qualification: 'M.Tech (Ph.D)', university: 'GITAM', gradYear: '2013', designation: 'Asst. Prof.', dateOfJoining: '13-06-2013', department: 'IT', type: 'Contract' },
    { sNo: 8, name: 'K.Srikanth', qualification: 'M.Tech (Ph.D)', university: 'Andhara University', gradYear: '2008', designation: 'Asst. Prof.', dateOfJoining: '14-06-2014', department: 'IT', type: 'Contract' },
    { sNo: 9, name: 'R.RojeSpandana', qualification: 'M.Tech', university: 'JNTUK', gradYear: '', designation: 'Asst. Prof.', dateOfJoining: '', department: 'CSE', type: 'Contract' },
    { sNo: 10, name: 'P.Venkateswaralu', qualification: 'M.Tech', university: 'JNTUK', gradYear: '2014', designation: 'Asst. Prof.', dateOfJoining: '06-08-2015', department: 'CSE', type: 'Contract' },
    { sNo: 11, name: 'B.Manasa', qualification: 'M.Tech', university: 'JNTUK', gradYear: '2017', designation: 'Asst. Prof.', dateOfJoining: '19-06-2017', department: 'CSE', type: 'Contract' },
    { sNo: 12, name: 'Madhumita Chanda', qualification: 'M.Tech', university: 'JNTUK', gradYear: '2017', designation: 'Asst. Prof.', dateOfJoining: '15-06-2017', department: 'CSE', type: 'Contract' }
];

const subjects = [
    { semester: 'I-B.Tech I Sem', sNo: 1, category: 'BS', courseCode: 'R23BS01', courseName: 'Linear Algebra & Calculus', L: 3, T: 0, P: 0, credits: 3 },
    { semester: 'I-B.Tech I Sem', sNo: 2, category: 'BS', courseCode: 'R23BS03T', courseName: 'Engineering Physics', L: 3, T: 0, P: 0, credits: 3 },
    { semester: 'I-B.Tech I Sem', sNo: 3, category: 'HS', courseCode: 'R23HS01T', courseName: 'Communicative English', L: 2, T: 0, P: 0, credits: 2 },
    { semester: 'I-B.Tech I Sem', sNo: 4, category: 'ES', courseCode: 'R23ES01', courseName: 'Basic Civil & Mechanical Engineering', L: 3, T: 0, P: 0, credits: 3 },
    { semester: 'I-B.Tech I Sem', sNo: 5, category: 'ES', courseCode: 'R23ES07T', courseName: 'Introduction to Programming', L: 3, T: 0, P: 0, credits: 3 },
    { semester: 'I-B.Tech I Sem', sNo: 6, category: 'HS', courseCode: 'R23HS01P', courseName: 'Communicative English Lab', L: 0, T: 0, P: 2, credits: 1 },
    { semester: 'I-B.Tech I Sem', sNo: 7, category: 'BS', courseCode: 'R23BS03P', courseName: 'Engineering Physics Lab', L: 0, T: 0, P: 2, credits: 1 },
    { semester: 'I-B.Tech I Sem', sNo: 8, category: 'BS', courseCode: 'R23ES02', courseName: 'Engineering Workshop', L: 0, T: 0, P: 3, credits: 1.5 },
    { semester: 'I-B.Tech I Sem', sNo: 9, category: 'ES', courseCode: 'R23ES06', courseName: 'IT Workshop', L: 0, T: 0, P: 2, credits: 1 },
    { semester: 'I-B.Tech I Sem', sNo: 10, category: 'ES', courseCode: 'R23ES07P', courseName: 'Computer Programming Lab', L: 0, T: 0, P: 3, credits: 1.5 },
    { semester: 'I-B.Tech I Sem', sNo: 11, category: 'Audit', courseCode: 'R23MC01', courseName: 'Health and Wellness, Yoga, and Sports', L: 0, T: 0, P: 1, credits: 0.5 }
];


const importData = async () => {
    try {
        await mongoose.connection.collection('students').drop().catch(err => console.log('Students skipped'));
        await mongoose.connection.collection('faculties').drop().catch(err => console.log('Faculties skipped'));
        await mongoose.connection.collection('subjects').drop().catch(err => console.log('Subjects skipped'));

        await Student.insertMany(students);
        await Faculty.insertMany(faculty);
        await Subject.insertMany(subjects);

        console.log('Data Imported: Students, Faculty, and Subjects');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
