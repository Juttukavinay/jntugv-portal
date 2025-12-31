const mongoose = require('mongoose');

const facultySchema = mongoose.Schema({
    sNo: { type: Number },
    name: { type: String, required: true },
    qualification: { type: String },
    university: { type: String },
    gradYear: { type: String },
    designation: { type: String },
    dateOfJoining: { type: String }, // Keeping as String for flexibility with provided format
    subject: { type: String },
    type: { type: String }, // Regular/Contract
    email: { type: String, unique: true, sparse: true },
    mobileNumber: { type: String }, // Will serve as password
}, {
    timestamps: true
});

module.exports = mongoose.model('Faculty', facultySchema);
