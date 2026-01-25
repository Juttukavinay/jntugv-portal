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

        // 1. Find current Dept info to see if there is an existing HOD
        const currentDept = await Department.findOne({ name: deptName });
        if (currentDept && currentDept.hodId) {
            // Demote previous HOD back to faculty role
            await Faculty.findByIdAndUpdate(currentDept.hodId, { role: 'faculty' });
        }

        // 2. Update Department
        const dept = await Department.findOneAndUpdate(
            { name: deptName },
            { hodId: faculty._id, hodName: faculty.name },
            { new: true, upsert: true }
        );

        // 3. Promote New HOD
        await Faculty.findByIdAndUpdate(faculty._id, { role: 'hod' });

        res.json(dept);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a department
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Optional: Check if department has faculty or students before deleting?
        // For now, simple delete as requested.
        await Department.findByIdAndDelete(id);

        // Also update any faculty associated with this department? 
        // Or leave them? For now, we just delete the department record.

        res.status(200).json({ message: 'Department deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
