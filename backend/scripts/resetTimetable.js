const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Timetable = require('../models/timetableModel');
const Faculty = require('../models/facultyModel');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const resetAll = async () => {
    await connectDB();

    console.log('Resetting ALL timetables to Free slots...');

    const timetables = await Timetable.find({});

    if (timetables.length > 0) {
        for (let timetable of timetables) {
            console.log(`Processing: ${timetable.className}`);
            timetable.schedule.forEach(day => {
                if (day.periods) {
                    day.periods.forEach(p => {
                        p.subject = '-'; // Mark as Free
                        p.faculty = '';
                        p.type = 'Free';
                        p.room = '';
                        p.ltp = '';
                        p.isFixed = false;
                    });
                }
            });
            timetable.markModified('schedule');
            await timetable.save();
        }
        console.log(`Successfully reset ${timetables.length} timetables.`);
    } else {
        console.log('No timetables found in DB.');
    }

    // Ensure Faculty Subject is set for testing
    const email = 'drgjayasuma@jntugv.edu';
    const faculty = await Faculty.findOne({ email });
    if (faculty) {
        faculty.subject = 'Introduction to Programming';
        await faculty.save();
        console.log(`Ensured ${faculty.name} has subject: ${faculty.subject}`);
    }

    process.exit();
};

resetAll();
