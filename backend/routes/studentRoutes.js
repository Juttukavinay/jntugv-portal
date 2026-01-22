const express = require('express');
const router = express.Router();
const Student = require('../models/studentModel');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

// Get all
router.get('/', async (req, res) => {
    try {
        const students = await Student.find({}).sort({ rollNumber: 1 });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add one
router.post('/', async (req, res) => {
    try {
        const student = await Student.create(req.body);
        res.status(201).json(student);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update
router.put('/:id', async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(student);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete
router.delete('/:id', async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        res.json({ message: 'Student removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Bulk Upload CSV
router.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    
    const results = [];
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                // Normalize keys (handle Case variations)
                const ops = results.map(row => {
                    // Try to find keys regardless of case
                    const getVal = (key) => row[Object.keys(row).find(k => k.toLowerCase() === key.toLowerCase())];
                    
                    const rollNumber = getVal('rollno') || getVal('roll number') || getVal('roll_no');
                    const name = getVal('name') || getVal('student name');
                    const year = getVal('year');
                    const semester = getVal('semester') || getVal('sem');
                    const course = getVal('course') || 'B.Tech';

                    if (!rollNumber || !name) return null;

                    return {
                        updateOne: {
                            filter: { rollNumber: rollNumber },
                            update: { 
                                rollNumber, name, year, semester, course, 
                                department: 'IT' 
                            },
                            upsert: true
                        }
                    };
                }).filter(op => op !== null);

                if (ops.length > 0) await Student.bulkWrite(ops);
                
                fs.unlinkSync(req.file.path);
                res.json({ success: true, count: ops.length, message: `Uploaded ${ops.length} students` });
            } catch (error) {
                if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
                res.status(500).json({ message: 'Error processing CSV: ' + error.message });
            }
        });
});

module.exports = router;
