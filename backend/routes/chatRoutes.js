const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Subject = require('../models/subjectModel');
const Faculty = require('../models/facultyModel');
const Student = require('../models/studentModel');
const Timetable = require('../models/timetableModel');
const Department = require('../models/departmentModel');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/ask', async (req, res) => {
    try {
        const { question, userContext } = req.body; 
        // userContext could contain role, userId, etc. to personalize logic

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ reply: "AI Configuration Error: GEMINI_API_KEY is missing." });
        }

        // 1. Fetch relevant "Knowledge" from our Database (Context Injection)
        // In a full RAG, we would use vector search here. 
        // For this "Instant" version, we'll fetch key summaries.
        
        const [subjects, departments, facultyCount] = await Promise.all([
            Subject.find({}, 'courseName courseCode semester credits').limit(20), // Limit to avoid token overflow if huge
            Department.find({}, 'deptName'),
            Faculty.countDocuments()
        ]);

        // Construct a context string
        const dbContext = `
        Current University Stats:
        - Departments: ${departments.map(d => d.deptName).join(', ')}
        - Total Faculty: ${facultyCount}
        - Sample Subjects: ${subjects.map(s => `${s.courseName} (${s.courseCode})`).join(', ')}
        `;

        // 2. Prepare the Model
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
        You are the official AI Assistant for the JNTU-GV (Jawaharlal Nehru Technological University - Gurajada Vizianagaram) University Portal.
        Your goal is to assist Students, Faculty, and HODs with their queries.
        
        Here is some real-time data from the university database:
        ${dbContext}

        User Question: "${question}"

        Guidelines:
        - Be helpful, professional, and friendly.
        - If the user asks about specific dynamic data (like "My attendance" or "Timetable") that isn't in the snippet above, kindly explain that you can guide them to the respective dashboard tab (e.g., "Please check the 'Attendance' tab for your personal records").
        - If the question is general (like "What is data structures?"), answer it using your general knowledge.
        - Keep answers concise and strictly relevant to the portal context.
        `;

        // 3. Generate Answer
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });

    } catch (error) {
        console.error("AI Chat Error:", error);
        res.status(500).json({ reply: "I'm having trouble connecting to the university brain right now. Please try again later." });
    }
});

module.exports = router;
