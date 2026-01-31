const mongoose = require('mongoose');

const communicationSchema = mongoose.Schema({
    senderId: { type: String, required: true }, // Can be student roll or faculty ID
    senderName: { type: String, required: true },
    senderRole: { type: String, required: true },
    type: { type: String, enum: ['notice', 'message', 'poll'], default: 'notice' },
    title: { type: String }, // Optional for simple messages
    content: { type: String, required: true },
    recipientRoles: [{ type: String, enum: ['principal', 'vice_principal', 'hod', 'faculty', 'student'] }],
    targetDepartment: { type: String, default: 'All' },
    priority: { type: String, enum: ['normal', 'high', 'urgent'], default: 'normal' },
    attachments: [{
        fileType: { type: String }, // image, document, audio, etc.
        url: { type: String },
        name: { type: String }
    }],
    pollData: {
        question: { type: String },
        options: [{
            text: { type: String },
            votes: [{ type: String }] // User IDs/Roll numbers
        }],
        expiresAt: { type: Date }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Communication', communicationSchema);
