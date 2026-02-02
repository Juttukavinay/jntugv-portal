const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Room or Lab Name
    type: { type: String, enum: ['Classroom', 'Lab'], required: true },
    wing: { type: String, default: 'N/A' }, // Location or Wing
    capacity: { type: Number, default: 60 },
    morningSession: { type: String, default: 'Available' }, // Morning occupancy/status
    afternoonSession: { type: String, default: 'Available' }, // Afternoon occupancy/status
    department: { type: String, default: 'IT' }
}, {
    timestamps: true
});

module.exports = mongoose.model('Room', roomSchema);
