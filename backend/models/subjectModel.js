const mongoose = require('mongoose');

const subjectSchema = mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true }, // Link to parent Course
    semester: { type: String, required: true }, // e.g., "I-B.Tech I Sem"
    sNo: { type: Number, required: true },
    category: { type: String, required: true }, // BS, ES, HS, Audit
    courseCode: { type: String, required: true },
    courseName: { type: String, required: true },
    L: { type: Number, default: 0 },
    T: { type: Number, default: 0 },
    P: { type: Number, default: 0 },
    credits: { type: Number, required: true },
    assignedFaculty: { type: String, default: 'N/A' },
    assignedAssistants: { type: [String], default: [] }
}, {
    timestamps: true
});

module.exports = mongoose.model('Subject', subjectSchema);
