const mongoose = require('mongoose');

const dateRangeSchema = new mongoose.Schema({
    description: { type: String, required: true, trim: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    weeksLabel: { type: String, default: '' },
    category: {
        type: String,
        enum: ['instruction', 'exam', 'vacation', 'practicals', 'holiday', 'induction', 'other'],
        default: 'other'
    }
}, { _id: false });

const holidaySchema = new mongoose.Schema({
    description: { type: String, required: true, trim: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true }
}, { _id: false });

const academicCalendarSchema = new mongoose.Schema({
    semester: { type: String, required: true, index: true }, // e.g. "I-B.Tech I Sem"
    department: { type: String, default: 'IT', index: true },
    title: { type: String, default: 'Academic Calendar' },
    academicYear: { type: String, default: '' }, // e.g. "2025-26"
    entries: { type: [dateRangeSchema], default: [] },
    holidays: { type: [holidaySchema], default: [] },
    notes: { type: String, default: '' }
}, {
    timestamps: true
});

academicCalendarSchema.index({ semester: 1, department: 1 }, { unique: true });

module.exports = mongoose.model('AcademicCalendar', academicCalendarSchema);
