const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const Faculty = require('../models/facultyModel');
const connectDB = require('../config/db');

const facultyList = [
    { sNo: 1, name: 'Dr.Ch BinduMadhuri', qualification: 'Ph.D', university: 'GITAM', gradYear: '2014', designation: 'Asst. Prof. & Head', dateOfJoining: '04-01-2013', subject: 'IT', type: 'Regular' },
    { sNo: 2, name: 'Dr G. Jaya Suma', qualification: 'Ph.D', university: 'Andhara University', gradYear: '2011', designation: 'Professor', dateOfJoining: '10-01-2013', subject: 'CSE', type: 'Regular' },
    { sNo: 3, name: 'Dr.G. Madhavi', qualification: 'Ph.D', university: 'JNTUH', gradYear: '2017', designation: 'Asst. Prof.', dateOfJoining: '01-01-2013', subject: 'CSE', type: 'Regular' },
    { sNo: 4, name: 'Dr.B. TirimulaRao', qualification: 'Ph.D', university: 'JNTUK', gradYear: '2020', designation: 'Asst. Prof.', dateOfJoining: '04-01-2013', subject: 'CSE', type: 'Regular' },
    { sNo: 5, name: 'Mr.AnilWurity', qualification: 'M.Tech', university: 'GITAM', gradYear: '2011', designation: 'Asst. Prof.', dateOfJoining: '04-01-2013', subject: 'CSE', type: 'Regular' },
    { sNo: 6, name: 'R.S.S.Jyothi', qualification: 'M.Tech', university: 'GITAM', gradYear: '2009', designation: 'Asst. Prof.', dateOfJoining: '18-06-2012', subject: 'CST', type: 'Contract' },
    { sNo: 7, name: 'P.Eswar', qualification: 'M.Tech (Ph.D)', university: 'GITAM', gradYear: '2013', designation: 'Asst. Prof.', dateOfJoining: '13-06-2013', subject: 'IT', type: 'Contract' },
    { sNo: 8, name: 'K.Srikanth', qualification: 'M.Tech (Ph.D)', university: 'Andhara University', gradYear: '2008', designation: 'Asst. Prof.', dateOfJoining: '14-06-2014', subject: 'IT', type: 'Contract' },
    { sNo: 9, name: 'R.RojeSpandana', qualification: 'M.Tech', university: 'JNTUK', gradYear: '', designation: 'Asst. Prof.', dateOfJoining: '', subject: 'CSE', type: 'Contract' },
    // 10 skipped as per user input
    { sNo: 11, name: 'B.Manasa', qualification: 'M.Tech', university: 'JNTUK', gradYear: '2017', designation: 'Asst. Prof.', dateOfJoining: '19-06-2017', subject: 'CSE', type: 'Contract' },
    { sNo: 12, name: 'Madhumita Chanda', qualification: 'M.Tech', university: 'JNTUK', gradYear: '2017', designation: 'Asst. Prof.', dateOfJoining: '15-06-2017', subject: 'CSE', type: 'Contract' }
];

const generateCreds = (name) => {
    const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    return {
        email: `${cleanName}@jntugv.edu`,
        mobileNumber: '9701458518' // Set default password for all
    };
};

const run = async () => {
    try {
        await connectDB();

        console.log('Upserting faculty data...');

        for (const fac of facultyList) {
            const creds = generateCreds(fac.name);
            // We only set email/mobile if not already present? 
            // Or just overwrite? Since we are uploading new data, let's ensure they have credentials.
            // But we should check if they already have an email to avoid duplicate key error if we generated a different one before.
            // But here we generate deterministic email from name.

            const data = { ...fac, ...creds };

            // Check if faculty exists by Name
            const exists = await Faculty.findOne({ name: fac.name });

            if (exists) {
                // specific update or just skip creds if they exist?
                // user wants to upload THIS data.
                // We'll update fields.
                await Faculty.updateOne({ _id: exists._id }, { $set: fac }); // Update info, keep creds if we want?
                // But if we want to ensure login, we might need to set creds if missing.
                if (!exists.email) {
                    await Faculty.updateOne({ _id: exists._id }, { $set: creds });
                }
                console.log(`Updated: ${fac.name}`);
            } else {
                await Faculty.create(data);
                console.log(`Created: ${fac.name} with email ${creds.email}`);
            }
        }

        console.log("Upload Complete");
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
