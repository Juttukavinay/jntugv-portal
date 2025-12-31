const mongoose = require('mongoose');

const attendanceSchema = mongoose.Schema({
    date: { type: String, required: true }, // YYYY-MM-DD
    subject: { type: String, required: true },
    semester: { type: String, required: true }, // e.g., 'I-B.Tech II Sem'
    room: { type: String },
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
    facultyName: { type: String },
    periodTime: { type: String },
    records: [{
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
        rollNumber: { type: String },
        name: { type: String },
        status: { type: String, enum: ['Present', 'Absent'], default: 'Present' }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Attendance', attendanceSchema);
