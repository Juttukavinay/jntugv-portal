const express = require('express');
const router = express.Router();
const Department = require('../models/departmentModel');
const Faculty = require('../models/facultyModel');

// Get all departments (or specific one)
router.get('/', async (req, res) => {
    try {
        // Ensure default departments exist
        const defaults = ['IT']; // Restricted to only IT as per user request
        for (const name of defaults) {
            const exists = await Department.findOne({ name });
            if (!exists) await Department.create({ name });
        }

        // Only return IT department
        const depts = await Department.find({ name: 'IT' });
        res.json(depts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Assign HOD
router.put('/assign-hod', async (req, res) => {
    const { deptName, facultyId } = req.body;
    try {
        const faculty = await Faculty.findById(facultyId);
        if (!faculty) return res.status(404).json({ message: 'Faculty not found' });

        const dept = await Department.findOneAndUpdate(
            { name: deptName },
            { hodId: faculty._id, hodName: faculty.name },
            { new: true, upsert: true }
        );

        res.json(dept);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
