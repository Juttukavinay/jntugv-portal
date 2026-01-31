const express = require('express');
const router = express.Router();
const Communication = require('../models/noticeModel');

// @route   POST /api/notices
// @desc    Create a new communication (notice, message, or poll)
router.post('/', async (req, res) => {
    try {
        const {
            senderId, senderName, senderRole,
            type, title, content,
            recipientRoles, targetDepartment,
            priority, attachments, pollData
        } = req.body;

        const comm = await Communication.create({
            senderId,
            senderName,
            senderRole: senderRole.toUpperCase(),
            type: type || 'notice',
            title: title || (type === 'message' ? 'Direct Message' : 'Announcement'),
            content,
            recipientRoles: recipientRoles || ['principal', 'vice_principal', 'hod', 'faculty', 'student'],
            targetDepartment: targetDepartment || 'All',
            priority: priority || 'normal',
            attachments: attachments || [],
            pollData: pollData || null
        });

        res.status(201).json(comm);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   GET /api/notices
// @desc    Get communications for current user
router.get('/', async (req, res) => {
    try {
        const { role, department, userId } = req.query;

        if (!role) return res.status(400).json({ message: "Role is required" });

        // Query logic:
        // 1. Target recipientRoles must include the user's role
        // 2. targetDepartment must be 'All' OR match user's department
        // 3. OR it's a message sent BY the user
        const query = {
            $or: [
                {
                    recipientRoles: role.toLowerCase(),
                    $or: [
                        { targetDepartment: 'All' },
                        { targetDepartment: department }
                    ]
                },
                { senderId: userId } // Always see what you sent
            ]
        };

        const communications = await Communication.find(query).sort({ createdAt: -1 });
        res.json(communications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/notices/vote/:id
// @desc    Vote in a poll
router.put('/vote/:id', async (req, res) => {
    try {
        const { optionIndex, userId } = req.body;
        const comm = await Communication.findById(req.params.id);

        if (!comm || comm.type !== 'poll') {
            return res.status(400).json({ message: "Poll not found" });
        }

        // Remove previous vote if any
        comm.pollData.options.forEach(opt => {
            opt.votes = opt.votes.filter(v => v !== userId);
        });

        // Add new vote
        comm.pollData.options[optionIndex].votes.push(userId);

        await comm.save();
        res.json(comm);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/notices/:id
// @desc    Delete a communication
router.delete('/:id', async (req, res) => {
    try {
        const comm = await Communication.findByIdAndDelete(req.params.id);
        if (!comm) return res.status(404).json({ message: "Communication not found" });
        res.json({ message: "Deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
