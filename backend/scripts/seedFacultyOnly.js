const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Faculty = require('../models/facultyModel');

dotenv.config();

const generateMobile = () => {
    return '9' + Math.floor(Math.random() * 900000000 + 100000000).toString();
};

const faculty = [
    { sNo: 1, name: 'Dr.Ch BinduMadhuri', qualification: 'Ph.D', university: 'GITAM', gradYear: '2014', designation: 'Asst. Prof. & Head', dateOfJoining: '04-01-2013', department: 'IT', type: 'Regular', email: 'bindumadhuri@jntugv.edu', mobileNumber: '9988776655' },
    { sNo: 2, name: 'Dr G. Jaya Suma', qualification: 'Ph.D', university: 'Andhara University', gradYear: '2011', designation: 'Professor', dateOfJoining: '10-01-2013', department: 'IT', type: 'Regular', email: 'jayasuma@jntugv.edu', mobileNumber: '9876543210' },
    { sNo: 3, name: 'Dr.G. Madhavi', qualification: 'Ph.D', university: 'JNTUH', gradYear: '2017', designation: 'Asst. Prof.', dateOfJoining: '01-01-2013', department: 'IT', type: 'Regular', email: 'madhavi@jntugv.edu', mobileNumber: '9123456789' },
    { sNo: 4, name: 'Dr.B. TirimulaRao', qualification: 'Ph.D', university: 'JNTUK', gradYear: '2020', designation: 'Asst. Prof.', dateOfJoining: '04-01-2013', department: 'IT', type: 'Regular', email: 'tirimularao@jntugv.edu', mobileNumber: '9012345678' },
    { sNo: 5, name: 'Mr.AnilWurity', qualification: 'M.Tech', university: 'GITAM', gradYear: '2011', designation: 'Asst. Prof.', dateOfJoining: '04-01-2013', department: 'IT', type: 'Regular', email: 'anilwurity@jntugv.edu', mobileNumber: '9911223344' },
    { sNo: 6, name: 'R.S.S.Jyothi', qualification: 'M.Tech', university: 'GITAM', gradYear: '2009', designation: 'Asst. Prof.', dateOfJoining: '18-06-2012', department: 'IT', type: 'Contract', email: 'rssjyothi@jntugv.edu', mobileNumber: '9888777666' },
    { sNo: 7, name: 'P.Eswar', qualification: 'M.Tech (Ph.D)', university: 'GITAM', gradYear: '2013', designation: 'Asst. Prof.', dateOfJoining: '13-06-2013', department: 'IT', type: 'Contract', email: 'peswar@jntugv.edu', mobileNumber: '9555666777' },
    { sNo: 8, name: 'K.Srikanth', qualification: 'M.Tech (Ph.D)', university: 'Andhara University', gradYear: '2008', designation: 'Asst. Prof.', dateOfJoining: '14-06-2014', department: 'IT', type: 'Contract', email: 'ksrikanth@jntugv.edu', mobileNumber: '9444333222' },
    { sNo: 9, name: 'R.RojeSpandana', qualification: 'M.Tech', university: 'JNTUK', gradYear: 'nan', designation: 'Asst. Prof.', dateOfJoining: 'nan', department: 'IT', type: 'Contract', email: 'rojespandana@jntugv.edu', mobileNumber: '9333222111' },
    { sNo: 10, name: 'P.Venkateswaralu', qualification: 'M.Tech', university: 'JNTUK', gradYear: '2014', designation: 'Asst. Prof.', dateOfJoining: '06-08-2015', department: 'IT', type: 'Contract', email: 'pvenkateswaralu@jntugv.edu', mobileNumber: '9222111000' },
    { sNo: 11, name: 'B.Manasa', qualification: 'M.Tech', university: 'JNTUK', gradYear: '2017', designation: 'Asst. Prof.', dateOfJoining: '19-06-2017', department: 'IT', type: 'Contract', email: 'bmanasa@jntugv.edu', mobileNumber: '9111000999' },
    { sNo: 12, name: 'Madhumita Chanda', qualification: 'M.Tech', university: 'JNTUK', gradYear: '2017', designation: 'Asst. Prof.', dateOfJoining: '15-06-2017', department: 'IT', type: 'Contract', email: 'madhumitachanda@jntugv.edu', mobileNumber: '9888999000' }
];

const importData = async () => {
    try {
        await connectDB();
        await Faculty.deleteMany({});
        console.log('Faculty Collection Cleared.');

        await Faculty.insertMany(faculty);
        console.log('Faculty Data Imported Successfully with emails and random mobile numbers!');

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

importData();
