const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/timetable_db';

const Student = mongoose.model('Student', new mongoose.Schema({
    rollNumber: String, name: String, year: String, semester: String, course: String, department: String
}));

async function seedStudents() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to DB...");
        
        // Remove existing students to have a fresh list of correct amount of data if needed?
        // Let's just create 30 students per semester class.
        
        await Student.deleteMany({}); // Wipe to ensure pristine
        
        const firstNames = ["Rahul", "Priya", "Amit", "Sneha", "Karthik", "Anjali", "Vikram", "Neha", "Rohit", "Pooja", "Arjun", "Divya", "Suresh", "Kavya", "Mohan", "Swati", "Ravi", "Asha", "Ajay", "Meera", "Sanjay", "Ritu", "Deepak", "Rani", "Nitin", "Geeta", "Sunil", "Kiran", "Vijay", "Anita", "Mahesh", "Nisha", "Rajesh", "Rekha", "Tarun", "Sushma", "Praveen", "Lata", "Harish", "Bhavya"];
        const lastNames = ["Sharma", "Reddy", "Patel", "Kumar", "Singh", "Das", "Rao", "Nair", "Iyer", "Yadav", "Verma", "Gupta", "Menon", "Chopra", "Joshi", "Chauhan", "Bhat", "Gowda", "Desai", "Mishra"];
        
        const newStudents = [];
        
        const configurations = [
            { y: '1', s: '1', prefix: '26VV5A' },
            { y: '1', s: '2', prefix: '26VV5B' },
            { y: '2', s: '1', prefix: '25VV5A' },
            { y: '2', s: '2', prefix: '25VV5B' },
            { y: '3', s: '1', prefix: '24VV5A' },
            { y: '3', s: '2', prefix: '24VV5B' },
            { y: '4', s: '1', prefix: '23VV5A' },
            { y: '4', s: '2', prefix: '23VV5B' }
        ];

        for (const config of configurations) {
            // Add 15 students for IT, 15 for CSE, 15 for ECE per semester class
            const depts = [{d: 'IT', code: '12'}, {d: 'CSE', code: '05'}, {d: 'ECE', code: '04'}];
            
            for (const dept of depts) {
                for (let i = 1; i <= 20; i++) {
                    // roll number format: 25VV5A 12 01
                    const rollNum = `${config.prefix}${dept.code}${i.toString().padStart(2, '0')}`;
                    const fname = firstNames[Math.floor(Math.random() * firstNames.length)];
                    const lname = lastNames[Math.floor(Math.random() * lastNames.length)];
                    
                    newStudents.push({
                        rollNumber: rollNum,
                        name: `${fname} ${lname}`,
                        year: config.y,
                        semester: config.s,
                        course: 'B.Tech',
                        department: dept.d
                    });
                }
            }
        }
        
        await Student.insertMany(newStudents);
        console.log(`Seeded ${newStudents.length} students across all classes.`);
        process.exit(0);

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

seedStudents();
