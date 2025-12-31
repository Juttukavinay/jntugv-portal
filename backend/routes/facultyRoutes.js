const express = require('express');
const router = express.Router();
const Faculty = require('../models/facultyModel');

// Get all
router.get('/', async (req, res) => {
    try {
        const faculty = await Faculty.find({}).sort({ sNo: 1 });
        res.json(faculty);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add one
router.post('/', async (req, res) => {
    try {
        const fac = await Faculty.create(req.body);
        res.status(201).json(fac);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update
router.put('/:id', async (req, res) => {
    try {
        const fac = await Faculty.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(fac);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete
router.delete('/:id', async (req, res) => {
    try {
        await Faculty.findByIdAndDelete(req.params.id);
        res.json({ message: 'Faculty removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
