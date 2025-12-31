const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Timetable = require('../models/timetableModel');

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

const restructure = async () => {
    await connectDB();

    const sem = 'I-B.Tech I Sem'; // Targeting the active semester
    console.log(`Restructuring: ${sem}`);

    let timetable = await Timetable.findOne({ className: sem });

    if (!timetable) {
        console.log('Timetable not found, creating new...');
        timetable = new Timetable({ className: sem, schedule: [] });
    }

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Define the new 1.5h Morning + 1h metered Afternoon structure
    const newSchedule = days.map(day => {
        return {
            day: day,
            periods: [
                // Morning Slot 1: 09:30 - 11:00 (1.5h)
                {
                    time: '09:30 - 11:00',
                    subject: '-',
                    type: 'Free',
                    faculty: '',
                    credits: 1.5, // Flex weight
                    ltp: '',
                    room: '',
                    isFixed: false
                },
                // Morning Slot 2: 11:00 - 12:30 (1.5h)
                {
                    time: '11:00 - 12:30',
                    subject: '-',
                    type: 'Free',
                    faculty: '',
                    credits: 1.5,
                    ltp: '',
                    room: '',
                    isFixed: false
                },
                // Afternoon Slot 1: 02:00 - 03:00 (1h)
                {
                    time: '02:00 - 03:00',
                    subject: '-',
                    type: 'Free',
                    faculty: '',
                    credits: 1,
                    ltp: '',
                    room: '',
                    isFixed: false
                },
                // Afternoon Slot 2: 03:00 - 04:00 (1h)
                {
                    time: '03:00 - 04:00',
                    subject: '-',
                    type: 'Free',
                    faculty: '',
                    credits: 1,
                    ltp: '',
                    room: '',
                    isFixed: false
                },
                // Afternoon Slot 3: 04:00 - 05:00 (1h)
                {
                    time: '04:00 - 05:00',
                    subject: '-',
                    type: 'Free',
                    faculty: '',
                    credits: 1,
                    ltp: '',
                    room: '',
                    isFixed: false
                }
            ]
        };
    });

    timetable.schedule = newSchedule;
    timetable.markModified('schedule');
    await timetable.save();

    console.log(`Timetable structure updated for ${sem}. Now has 1.5h morning slots.`);
    process.exit();
};

restructure();
