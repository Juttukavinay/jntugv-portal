const mongoose = require('mongoose');

const studentSchema = mongoose.Schema({
    rollNumber: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    year: { type: String, default: '3' },
    semester: { type: String, default: '1' },
    course: { type: String, required: true }, // e.g. B.Tech, M.Tech, MCA
    email: { type: String }, // Optional now
    department: { type: String, default: 'IT' } // Assuming IT based on roll no pattern or user context, but let's default or make optional
}, {
    timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);
