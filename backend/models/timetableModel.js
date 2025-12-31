const mongoose = require('mongoose');

const periodSchema = new mongoose.Schema({
    time: { type: String, required: true },
    subject: { type: String, required: true },
    type: { type: String, required: true },
    faculty: { type: String, default: 'N/A' },
    assistants: { type: [String], default: [] },
    credits: { type: Number, default: 0 },
    ltp: { type: String, default: '' },
    room: { type: String, default: '' },
    isFixed: { type: Boolean, default: false }
}, { _id: false });

const daySchema = new mongoose.Schema({
    day: { type: String, required: true },
    periods: [periodSchema]
}, { _id: false });

const timetableSchema = new mongoose.Schema({
    className: { type: String, default: 'I-B.Tech I Sem' },
    schedule: [daySchema]
}, {
    timestamps: true
});

module.exports = mongoose.model('Timetable', timetableSchema);
