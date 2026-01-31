const mongoose = require('mongoose');

const chatSessionSchema = mongoose.Schema({
    userId: { type: String, required: true },
    title: { type: String, default: 'New Chat' },
    messages: [{
        id: { type: String },
        sender: { type: String, enum: ['user', 'bot'], required: true },
        text: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
    }],
    lastMessage: { type: String },
}, {
    timestamps: true
});

module.exports = mongoose.model('ChatSession', chatSessionSchema);
