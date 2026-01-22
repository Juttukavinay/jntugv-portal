const mongoose = require('mongoose');
const Faculty = require('../models/facultyModel');
const fs = require('fs');

const mongoURI = 'mongodb://localhost:27017/timetable_db';

mongoose.connect(mongoURI)
    .then(async () => {
        let output = '';
        try {
            const faculties = await Faculty.find({}).limit(5);
            if (faculties.length === 0) {
                output += 'No faculty found.\n';
            } else {
                output += '--- FACULTY CREDENTIALS ---\n';
                faculties.forEach(f => {
                    output += `Role: Faculty | Name: ${f.name} | Email: ${f.email} | Password: ${f.mobileNumber}\n`;
                });
            }
        } catch (err) {
            output += 'Error: ' + err.message + '\n';
        } finally {
            fs.writeFileSync('creds.txt', output);
            mongoose.connection.close();
            process.exit(0);
        }
    })
    .catch(err => {
        fs.writeFileSync('creds.txt', 'Connection Error: ' + err.message);
        process.exit(1);
    });
