const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/timetable_db';

async function checkDB() {
    try {
        await mongoose.connect(MONGO_URI);
        const Student = mongoose.model('Student', new mongoose.Schema({}, { strict: false }));
        const Faculty = mongoose.model('Faculty', new mongoose.Schema({}, { strict: false }));
        const Dept = mongoose.model('Department', new mongoose.Schema({}, { strict: false }));

        const sCount = await Student.countDocuments();
        const fCount = await Faculty.countDocuments();
        const dCount = await Dept.countDocuments();

        console.log(JSON.stringify({ students: sCount, faculty: fCount, departments: dCount }));
        await mongoose.connection.close();
    } catch (e) {
        console.error(e);
    }
}

checkDB();
