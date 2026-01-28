const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Subject = require('../models/subjectModel');
const Faculty = require('../models/facultyModel');
const Student = require('../models/studentModel');
const Timetable = require('../models/timetableModel');
const Department = require('../models/departmentModel');

// Initialize Gemini
// Make sure GEMINI_API_KEY is in your .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/ask', async (req, res) => {
    try {
        const { question, userContext } = req.body;

        console.log("Received Question:", question);

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ reply: "AI Configuration Error: GEMINI_API_KEY is missing." });
        }

        // 1. Fetch relevant "Knowledge" from our Database (Context Injection)
        let subjects = [], departments = [], facultyCount = 0;
        let dbContext = "";

        try {
            [subjects, departments, facultyCount] = await Promise.all([
                Subject.find({}, 'courseName courseCode semester credits').limit(20),
                Department.find({}, 'deptName'),
                Faculty.countDocuments()
            ]);

            // Construct a context string
            dbContext = `
            Current University Stats:
            - Departments: ${departments.map(d => d.deptName).join(', ')}
            - Total Faculty: ${facultyCount}
            - Sample Subjects: ${subjects.map(s => `${s.courseName} (${s.courseCode})`).join(', ')}
            `;
        } catch (dbError) {
            console.error("Database Context Error (Proceeding without DB context):", dbError.message);
            dbContext = "Database context unavailable. Answer based on general knowledge only.";
        }

        // 2. Generate Answer with Gemini
        // Using gemini-1.5-flash as default. 
        // Note: If you get a 404, ensure "Generative Language API" is enabled in Google Cloud Console.
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
        You are the official AI Assistant for the JNTU-GV (Jawaharlal Nehru Technological University - Gurajada Vizianagaram) University Portal.
        Your goal is to assist Students, Faculty, and HODs with their queries.
        
        Here is some real-time data from the university database:
        ${dbContext}

        Guidelines:
        - Be helpful, professional, and friendly.
        - If the user asks about specific dynamic data (like "My attendance" or "Timetable") that isn't in the snippet above, kindly explain that you can guide them to the respective dashboard tab (e.g., "Please check the 'Attendance' tab for your personal records").
        - If the question is general (like "What is data structures?"), answer it using your general knowledge.
        - Keep answers concise and strictly relevant to the portal context.

        User Question: ${question}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });

    } catch (error) {
        console.error("AI Chat Error Details:", error);
        // Check for specific 404 error which means model not found or API not enabled
        if (error.message && error.message.includes('404')) {
            console.error("CRITICAL: The Gemini Model was not found. Please check if the API is enabled in Google AI Studio.");
        }
        res.status(500).json({ reply: "I'm having trouble connecting to the university brain right now. (Error: " + (error.message || "Unknown") + ")" });
    }
});

module.exports = router;
