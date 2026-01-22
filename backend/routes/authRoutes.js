const express = require('express');
const router = express.Router();
const Faculty = require('../models/facultyModel');
const sendEmail = require('../utils/emailService');

const otpStore = {}; // In-memory store for demo purposes

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Check Principal (No OTP)
        if (email === 'principal@jntugv.edu' && password === '9701458518') {
            return res.json({ role: 'principal', name: 'Principal Dashboard', email });
        }

        // 1.5 Check Vice Principal
        if (email === 'viceprincipal@jntugv.edu' && password === '9701458518') {
            return res.json({ role: 'vice_principal', name: 'Vice Principal', email });
        }

        // 2. Check Faculty & HOD (Database Check)
        const faculty = await Faculty.findOne({ email });
        const Department = require('../models/departmentModel');

        if (faculty) {
            if (faculty.mobileNumber === password) {
                // Check if this faculty is an HOD
                const hodDept = await Department.findOne({ hodId: faculty._id });

                if (hodDept) {
                    return res.json({
                        role: 'hod',
                        name: faculty.name,
                        email: faculty.email,
                        dept: hodDept.name,
                        _id: faculty._id
                    });
                }

                return res.json({
                    role: 'faculty',
                    name: faculty.name,
                    email: faculty.email,
                    _id: faculty._id
                });
            } else {
                return res.status(401).json({ message: 'Invalid Credentials' });
            }
        }

        // 4. Check Student (No OTP)
        if (/\d+[A-Z]+\d+/.test(email) || email.includes('student')) {
            return res.json({ role: 'student', name: 'Student User', email, semester: 'I-B.Tech II Sem' });
        }

        return res.status(404).json({ message: 'User not found' });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

const Student = require('../models/studentModel');
const axios = require('axios');

router.post('/google-login', async (req, res) => {
    const { token } = req.body;
    try {
        const googleRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const { email, name } = googleRes.data;

        let student = await Student.findOne({ email });

        if (!student) {
            // Auto-register new student
            // Try to use email prefix as roll number if it looks like one, otherwise generate
            let rollNumber = email.split('@')[0].toUpperCase();

            // Check if rollNumber is taken, if so append random
            const exists = await Student.findOne({ rollNumber });
            if (exists) {
                rollNumber = `${rollNumber}-${Math.floor(Math.random() * 1000)}`;
            }

            student = new Student({
                name,
                email,
                rollNumber,
                course: 'B.Tech',
                department: 'General',
                year: '1',
                semester: '1'
            });
            await student.save();
        }

        return res.json({
            role: 'student',
            name: student.name,
            email: student.email,
            semester: `${student.year}-${student.course} ${student.semester} Sem`
        });

    } catch (error) {
        console.error('Google Login Error:', error.message);
        res.status(401).json({ message: 'Google Authentication Failed' });
    }
});

module.exports = router;
