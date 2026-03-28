const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    facultyName: { type: String, required: true },
    facultyEmail: { type: String, required: true },
    department: { type: String, required: true },
    fromDate: { type: String, required: true }, // YYYY-MM-DD
    toDate: { type: String, required: true },   // YYYY-MM-DD
    reason: { type: String },
    status: { type: String, default: 'Pending', enum: ['Pending', 'Approved', 'Rejected'] },
    substituteFaculty: { type: String }, // Assigned by HOD (email or name)
    isAccepted: { type: Boolean, default: false }
}, {
    timestamps: true
});

module.exports = mongoose.model('Leave', leaveSchema);
