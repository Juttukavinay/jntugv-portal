const express = require('express');
const router = express.Router();
const Room = require('../models/roomModel');

// GET ALL ROOMS
router.get('/', async (req, res) => {
    try {
        const rooms = await Room.find().sort({ name: 1 });
        res.json(rooms);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// ADD OR UPDATE ROOMS (Bulk)
router.post('/save', async (req, res) => {
    try {
        const { rooms } = req.body;

        // Simple strategy: Clear and re-insert for consistency, or update by name
        // For HOD dashboard management, bulk save is common.
        await Room.deleteMany({});
        const result = await Room.insertMany(rooms);
        res.json({ success: true, count: result.length });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// DELETE A ROOM
router.delete('/:id', async (req, res) => {
    try {
        await Room.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

module.exports = router;
