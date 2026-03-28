const express = require('express');
const router = express.Router();
const Leave = require('../models/leaveModel');

// POST /api/leaves - Faculty applies for leave
router.post('/', async (req, res) => {
    try {
        const { facultyName, facultyEmail, department, fromDate, toDate, reason } = req.body;
        
        if (!facultyName || !facultyEmail || !department || !fromDate || !toDate) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const newLeave = await Leave.create({
            facultyName,
            facultyEmail,
            department,
            fromDate,
            toDate,
            reason
        });

        res.status(201).json(newLeave);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// GET /api/leaves/department/:dept - Get leaves for a specific department
router.get('/department/:dept', async (req, res) => {
    try {
        const leaves = await Leave.find({ department: req.params.dept }).sort({ createdAt: -1 });
        res.json(leaves);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// GET /api/leaves/faculty/:email - Get leaves for a specific faculty
router.get('/faculty/:email', async (req, res) => {
    try {
        const leaves = await Leave.find({ facultyEmail: req.params.email }).sort({ createdAt: -1 });
        res.json(leaves);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// PUT /api/leaves/:id/status - Approve or Reject leave
router.put('/:id/status', async (req, res) => {
    try {
        const { status, substituteFaculty } = req.body;
        
        if (!status || !['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        if (status === 'Approved' && !substituteFaculty) {
            return res.status(400).json({ message: 'Substitute faculty is required for approval' });
        }

        const leave = await Leave.findById(req.params.id);
        if (!leave) {
            return res.status(404).json({ message: 'Leave not found' });
        }

        leave.status = status;
        if (status === 'Approved') {
            leave.substituteFaculty = substituteFaculty;
        }

        await leave.save();
        res.json(leave);
    } catch (error) {
        console.error(error);
// PUT /api/leaves/:id/accept - Substitute faculty accepts the assignment
router.put('/:id/accept', async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id);
        if (!leave) return res.status(404).json({ message: 'Leave not found' });
        
        leave.isAccepted = true;
        await leave.save();
        res.json(leave);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
