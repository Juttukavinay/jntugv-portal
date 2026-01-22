const express = require('express');
const router = express.Router();
const Faculty = require('../models/facultyModel');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

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

// Bulk Upload CSV
router.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    
    const results = [];
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                const ops = results.map((row, i) => {
                    const getVal = (key) => row[Object.keys(row).find(k => k.toLowerCase() === key.toLowerCase())];
                    
                    const name = getVal('name') || getVal('faculty name');
                    const designation = getVal('designation') || 'Assistant Professor';
                    const mobile = getVal('mobile') || getVal('phone') || '';
                    const email = getVal('email') || '';
                    const type = getVal('type') || 'Regular';

                    if (!name) return null;

                    return {
                        updateOne: {
                            filter: { name: name }, // Simple match by Name for existing (better would be Email)
                            update: { 
                                name, designation, mobileNumber: mobile, email, type, department: 'IT',
                                sNo: i + 1 // Maybe not ideal for updates but fine for initial load
                            },
                            upsert: true
                        }
                    };
                }).filter(op => op !== null);

                if (ops.length > 0) await Faculty.bulkWrite(ops);
                
                fs.unlinkSync(req.file.path);
                res.json({ success: true, count: ops.length, message: `Uploaded ${ops.length} faculty` });
            } catch (error) {
                if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
                res.status(500).json({ message: 'Error processing CSV: ' + error.message });
            }
        });
});

module.exports = router;
