const mongoose = require('mongoose');

const courseSchema = mongoose.Schema({
    regulation: { type: String, required: true }, // e.g., "R23"
    department: { type: String, required: true }, // e.g., "IT"
    program: { type: String, default: 'UG' }, // UG, PG
    courseName: { type: String, default: 'B.Tech' }, // B.Tech, MCA, M.Tech
    fileName: { type: String }, // Original PDF name
    uploadDate: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
