const express = require('express');
const router = express.Router();
const Department = require('../models/departmentModel');
const Faculty = require('../models/facultyModel');

// Get all departments
router.get('/', async (req, res) => {
    try {
        const depts = await Department.find({}).sort({ name: 1 });
        res.json(depts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new department
router.post('/', async (req, res) => {
    try {
        const { name } = req.body;
        const exists = await Department.findOne({ name });
        if (exists) return res.status(400).json({ message: 'Department already exists' });

        const dept = await Department.create({ name });
        res.status(201).json(dept);
    } catch (error) {
        res.status(400).json({ message: error.message });
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
