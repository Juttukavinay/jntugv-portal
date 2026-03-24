const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Room or Lab Name (e.g., LH-01)
    type: { type: String, enum: ['Classroom', 'Lab'], required: true },
    wing: { type: String, default: 'Wing 1' }, // Location (e.g., Block A, Wing 1)
    year: { type: String, default: '1st Year' }, // Associated year
    semester: { type: String, default: '1st Sem' }, // Associated semester
    batch: { type: String, default: '2024-2028' }, // Associated batch
    section: { type: String, default: 'Section A' }, // Associated section
    capacity: { type: Number, default: 60 },
    morningSession: { type: String, default: 'Available' },
    afternoonSession: { type: String, default: 'Available' },
    department: { type: String, default: 'IT' }
}, {
    timestamps: true
});

module.exports = mongoose.model('Room', roomSchema);
