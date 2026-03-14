const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/timetable_db';

const Student = mongoose.model('Student', new mongoose.Schema({
    rollNumber: String, name: String, year: String, semester: String, course: String, department: String
}));
const Faculty = mongoose.model('Faculty', new mongoose.Schema({
    facultyId: String, name: String, designation: String, qualification: String, email: String, mobileNumber: String, type: String, department: String
}));
const Dept = mongoose.model('Department', new mongoose.Schema({
    name: String, hodId: String, hodName: String
}));

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to DB...");

        // Clear existing (optional?) or just add if empty
        const sCount = await Student.countDocuments();
        if (sCount === 0) {
            await Student.insertMany([
                { rollNumber: '23VV5A1201', name: 'John Doe', year: '2', semester: '1', course: 'B.Tech', department: 'IT' },
                { rollNumber: '23VV5A1202', name: 'Jane Smith', year: '2', semester: '1', course: 'B.Tech', department: 'IT' },
                { rollNumber: '23VV5A1203', name: 'James Brown', year: '2', semester: '1', course: 'B.Tech', department: 'IT' },
                { rollNumber: '23VV5A1204', name: 'Jill White', year: '2', semester: '1', course: 'B.Tech', department: 'IT' },
                { rollNumber: '23VV5A1205', name: 'Jack Black', year: '2', semester: '1', course: 'B.Tech', department: 'IT' },
                { rollNumber: '23VV5A1206', name: 'Ruby Grey', year: '2', semester: '1', course: 'B.Tech', department: 'IT' },
                { rollNumber: '23VV5A1207', name: 'Mike Ross', year: '2', semester: '1', course: 'B.Tech', department: 'IT' },
                { rollNumber: '23VV5A1208', name: 'Harvey Specter', year: '2', semester: '1', course: 'B.Tech', department: 'IT' },
                { rollNumber: '23VV5A1209', name: 'Donna Paulsen', year: '2', semester: '1', course: 'B.Tech', department: 'IT' },
                { rollNumber: '23VV5A1210', name: 'Louis Litt', year: '2', semester: '1', course: 'B.Tech', department: 'IT' }
            ]);
            console.log("Seeded 10 students.");
        }

        const fCount = await Faculty.countDocuments();
        if (fCount === 0) {
            await Faculty.insertMany([
                { facultyId: 'PRIN01', name: 'Dr. Principal', designation: 'Principal', qualification: 'Ph.D', email: 'principal@jntugv.edu', mobileNumber: '9876543200', type: 'Regular', department: 'IT' },
                { facultyId: 'HOD01', name: 'Dr. CH', designation: 'Professor & HOD', qualification: 'Ph.D', email: 'drch1@jntugv.edu.in', mobileNumber: '9876543201', type: 'Regular', department: 'IT' },
                { facultyId: 'FAC01', name: 'Mr. Anil Wurity', designation: 'Assistant Professor', qualification: 'M.Tech', email: 'mranilwurity5@jntugv.edu.in', mobileNumber: '9876543205', type: 'Regular', department: 'IT' },
                { facultyId: 'FAC02', name: 'Dr. Sarah Smith', designation: 'Associate Professor', qualification: 'Ph.D', email: 'sarah@jntugv.edu.in', mobileNumber: '9876543206', type: 'Regular', department: 'IT' }
            ]);
            console.log("Seeded 4 faculty members.");
        }

        const dCount = await Dept.countDocuments();
        if (dCount === 0) {
            await Dept.insertMany([
                { name: 'IT', hodName: 'Dr. CH' },
                { name: 'CSE', hodName: 'Not Assigned' },
                { name: 'ECE', hodName: 'Not Assigned' }
            ]);
            console.log("Seeded 3 departments.");
        }

        console.log("Seeding complete.");
        await mongoose.connection.close();
    } catch (e) {
        console.error(e);
    }
}

seed();
