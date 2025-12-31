const mongoose = require('mongoose');

const departmentSchema = mongoose.Schema({
    name: { type: String, required: true, unique: true }, // e.g., 'IT', 'CSE'
    hodId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
    hodName: { type: String } // Storing name for easier display, or just populate
}, {
    timestamps: true
});

module.exports = mongoose.model('Department', departmentSchema);
