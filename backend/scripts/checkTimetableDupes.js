
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const timetableSchema = new mongoose.Schema({
    semester: { type: String, required: true },
    className: { type: String }, // e.g. "I B.Tech I Sem"
    schedule: [{
        day: String,
        periods: [{
            time: String,
            type: { type: String }, // Theory, Lab, Break
            subject: String,
            faculty: String,
            room: String,
            credits: Number // duration in hours (1, 2, 3)
        }]
    }],
    createdAt: { type: Date, default: Date.now }
});

const Timetable = mongoose.model('Timetable', timetableSchema);

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/university_db')
    .then(async () => {
        console.log("Connected to DB");
        const timetables = await Timetable.find({ semester: 'I-B.Tech I Sem' });
        console.log(`Found ${timetables.length} timetables for I-B.Tech I Sem`);

        timetables.forEach((t, i) => {
            console.log(`\n--- Timetable ${i + 1} (ID: ${t._id}) ---`);
            console.log(`Created At: ${t.createdAt}`);
            // Show Monday periods
            const monday = t.schedule.find(d => d.day === 'Monday');
            if (monday) {
                console.log("Monday Periods:");
                monday.periods.forEach(p => {
                    console.log(`  ${p.time}: ${p.subject} (${p.credits || 1}h) - ${p.faculty}`);
                });
            }
        });
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
