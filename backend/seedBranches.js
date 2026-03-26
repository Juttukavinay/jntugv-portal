const mongoose = require('mongoose');
const Department = require('./models/departmentModel.js');
require('dotenv').config();

const branches = [
  "Computer Science & Engineering",
  "Electronics & Communication Engineering",
  "Mechanical Engineering",
  "Electrical & Electronics Engineering",
  "Information Technology",
  "Metallurgical Engineering",
  "Civil Engineering",
  "BS & HSS",
  "Master's in Business Administration"
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        
        for (let name of branches) {
            await Department.updateOne(
                { name },
                { $setOnInsert: { name } },
                { upsert: true }
            );
        }
        
        console.log('Branches successfully inserted/updated.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
