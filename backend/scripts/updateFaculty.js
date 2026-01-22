const mongoose = require('mongoose');
require('dotenv').config();
const Faculty = require('../models/facultyModel');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        const faculties = await Faculty.find({});
        for (const f of faculties) {
            let updated = false;
            // Generate Email if missing
            if (!f.email) {
                // Remove Dr/Mr/Ms prefix and spaces/dots
                const cleanName = f.name.replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.|Prof\.)\s*/i, '')
                    .replace(/[^a-zA-Z]/g, '')
                    .toLowerCase();
                f.email = `${cleanName}@jntugv.edu`;
                updated = true;
            }

            // Generate Mobile if missing (Password)
            if (!f.mobileNumber) {
                f.mobileNumber = '9' + Math.floor(100000000 + Math.random() * 900000000); // Random 10 digit
                updated = true;
            }

            if (updated) {
                try {
                    await f.save();
                    console.log(`Updated: ${f.name} -> Email: ${f.email}, Pass: ${f.mobileNumber}`);
                } catch (err) {
                    console.error(`Failed to update ${f.name}:`, err.message);
                }
            } else {
                console.log(`Skipped: ${f.name} (Already has data) -> ${f.email}, ${f.mobileNumber}`);
            }
        }
        console.log('Migration Complete');
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
