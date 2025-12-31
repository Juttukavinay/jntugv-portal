const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Student = require('../models/studentModel');
const connectDB = require('../config/db');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const startRoll = 2351270; // This is a bit tricky with the alphanumeric.
// User said "23vv5a1270".
// Let's break it down: Prefix "23vv5a12", Start Number 70.

const prefix = "23vv5a12";
const startNum = 70;
const count = 10;
const year = '3';
const semester = '1';
const department = 'IT'; // 12 usually is IT

const names = [
    "Sita Rama Raju", "Geeta Devi", "Krishna Kumar", "Radha Kumari", "Ravi Teja",
    "Priya Dharshini", "Rahul Reddy", "Anjali Gupta", "Vikram Singh", "Sneha Latha",
    "Arjun Yadav", "Kavya Sree", "Manish Varma", "Swathi Reddy", "Sai Krishna",
    "Divya Jyothi", "Karthik Raja", "Bhavana Rao", "Naveen Babu", "Lavanya K",
    "Suresh Kumar", "Mounika P", "Harish Rao", "Deepika M", "Venkatesh D",
    "Aishwarya R", "Pradeep K", "Sandhya N", "Rajesh V", "Pavani S",
    "Anil Kumar", "Sunita Sharma", "Rohan Verma", "Kiran Mai", "Vamsi Krishna",
    "Pooja Hegde", "Nithin Reddy", "Swetha Menon", "Ganesh Babu", "Harini Rao",
    "Manoj Kumar", "Sravani K", "Dinesh Karthik", "Ramya Krishnan", "Vijay Kumar",
    "Keerthy Suresh", "Arjun Reddy", "Samantha Ruth", "Prabhas Raju", "Tamannaah S",
    "Mahesh Babu", "Kajal Aggarwal", "Taraka Ram", "Rashmika M", "Ram Charan",
    "Nani Ghanta", "Sai Pallavi", "Pawan Kalyan", "Trisha K", "Chiranjeevi K"
];

const generateStudents = () => {
    const students = [];
    const totalStudents = 66; // Expanding to 66 students as requested before/implied by previous context
    // Or just generating enough for the list we have. User asked for specific names.
    // I will map the names to the roll numbers.

    // Let's create a loop that matches the names provided.
    // If we have more names than loop count, we use names. 
    // If we have more loop count, we cycle names.

    // Actually, let's just create students for the names we have, 
    // but maybe the user wants to keep the specific roll number series? 
    // The previous code started at 70 ("23vv5a1270").
    // I will generate 30 students with names.

    for (let i = 0; i < names.length; i++) {
        // Roll number logic: 21131A0501... as seen in screenshot?
        // Wait, the screenshot shows "21131A0501". The previous script used "23vv5a1270".
        // The screenshot roll numbers are "21131A05xx". 
        // I should probably stick to what the user HAS in the DB or update to what they WANT.
        // The screenshot shows "21131A0501", "21131A0502".
        // I will use that series "21131A05" + padded number. 

        let num = i + 1;
        let paddedNum = num.toString().padStart(2, '0');
        const rollNumber = `21131A05${paddedNum}`;

        students.push({
            rollNumber: rollNumber,
            name: names[i],
            year: "IV", // Screenshot says "3 Year", actually 21 series is likely IV year now (2021-2025). 
            // In 2025 (current fake time), 21 batch is IV year. 
            // But screenshot says "3 Year". I will set it to "III" or "IV" based on assumption or keep "III".
            // Actually, screenshot says "3 Year". I will use "III".
            semester: "I", // Keep it simple
            department: "IT",
            email: `${rollNumber.toLowerCase()}@jntugv.edu`
        });
    }
    return students;
};

const run = async () => {
    try {
        await connectDB();

        const students = generateStudents();
        console.log(`Generated ${students.length} students to insert/update.`);

        for (const student of students) {
            // Upsert to avoid duplicates
            await Student.updateOne(
                { rollNumber: student.rollNumber },
                { $set: student },
                { upsert: true }
            );
            console.log(`Processed: ${student.rollNumber} - ${student.name}`);
        }

        console.log('Student Import Complete');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
