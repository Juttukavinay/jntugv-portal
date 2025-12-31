const express = require('express');
const router = express.Router();
const Subject = require('../models/subjectModel');

// Get all subjects
router.get('/', async (req, res) => {
    try {
        const { semester } = req.query;
        let query = {};
        if (semester) query.semester = semester;

        const subjects = await Subject.find(query)
            .populate('courseId') // Populate parent Course details
            .sort({ sNo: 1 });
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add subject
router.post('/', async (req, res) => {
    try {
        const subject = await Subject.create(req.body);
        res.status(201).json(subject);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update subject
router.put('/:id', async (req, res) => {
    try {
        const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(subject);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete subject
router.delete('/:id', async (req, res) => {
    try {
        await Subject.findByIdAndDelete(req.params.id);
        res.json({ message: 'Subject removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
