const express = require('express');
const router = express.Router();
const Room = require('../models/roomModel');

// GET ALL ROOMS
router.get('/', async (req, res) => {
    try {
        const { department } = req.query;
        const query = department ? { department } : {};
        const rooms = await Room.find(query).sort({ name: 1 });
        res.json(rooms);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// ADD OR UPDATE ROOMS (Bulk)
router.post('/save', async (req, res) => {
    try {
        const { rooms = [], department } = req.body;

        // Safer bulk-save: delete + insert only the relevant departments
        if (department) {
            await Room.deleteMany({ department });
            const normalizedRooms = (Array.isArray(rooms) ? rooms : []).map((r) => ({
                ...r,
                department
            }));
            const result = normalizedRooms.length > 0 ? await Room.insertMany(normalizedRooms) : [];
            return res.json({ success: true, count: result.length });
        }

        const safeRooms = Array.isArray(rooms) ? rooms : [];
        const departments = Array.from(new Set(safeRooms.map((r) => r?.department).filter(Boolean)));
        if (departments.length === 0 && safeRooms.length === 0) {
            return res.status(400).json({ success: false, message: 'No rooms provided' });
        }

        await Room.deleteMany({ department: { $in: departments } });
        const result = safeRooms.length > 0 ? await Room.insertMany(safeRooms) : [];
        return res.json({ success: true, count: result.length });
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
