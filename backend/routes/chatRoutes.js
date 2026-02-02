const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const ChatSession = require('../models/chatModel');
const Subject = require('../models/subjectModel');
const Department = require('../models/departmentModel');
const Faculty = require('../models/facultyModel');
const Student = require('../models/studentModel');
const Attendance = require('../models/attendanceModel');
const Course = require('../models/courseModel');
const Timetable = require('../models/timetableModel');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


// @route   GET /api/chat/history/:userId
// @desc    Get all chat sessions for a user
router.get('/history/:userId', async (req, res) => {
    try {
        const sessions = await ChatSession.find({ userId: req.params.userId }).sort({ updatedAt: -1 });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/chat/session/:sessionId
// @desc    Get a single chat session
router.get('/session/:sessionId', async (req, res) => {
    try {
        const session = await ChatSession.findById(req.params.sessionId);
        res.json(session);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/ask', async (req, res) => {
    try {
        const { question, history = [], skipContext, userId, sessionId } = req.body;

        console.log("Received Question from:", userId, "| Session:", sessionId);

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ reply: "AI Configuration Error: GEMINI_API_KEY is missing." });
        }

        // 1. Context Injection + Local Search
        let dbContext = "";
        const { handleOfflineRequest } = require('../utils/localAiEngine');
        const localResult = await handleOfflineRequest(question);

        // Determine if local engine found specific data (not just the fallback help message)
        const isSpecificLocalResult = localResult && !localResult.includes("Offline Assistant");

        if (!skipContext) {
            try {
                const [subjects, departments, faculties, classes, courses, attendanceStats, timetables] = await Promise.all([
                    Subject.find({}).limit(50),
                    Department.find({}),
                    Faculty.find({}),
                    Timetable.distinct('className'),
                    Course.find({}),
                    Attendance.aggregate([{ $group: { _id: "$subject", count: { $sum: 1 } } }]),
                    Timetable.find({})
                ]);
                const studentCount = await Student.countDocuments();

                dbContext = `UNIVERSITY DATA SNAPSHOT:
- Departments: ${departments.map(d => d.deptName).join(', ')}
- Total Students: ${studentCount}
- Active Semesters: ${classes.join(', ')}
- Database Search Result: ${isSpecificLocalResult ? localResult : "No specific record found, use general knowledge."}`;
            } catch (e) { console.error("Context build error:", e); }
        }

        const systemInstruction = `You are the JNTU-GV University Smart Assistant, a highly professional academic aide. 
Your goal is to provide authoritative, accurate, and concise information about JNTU-GV University.
If specific database results are provided in the context, prioritize them. 
If the user asks for clashes, professor locations, or statistics, refer to the Database Search Result.
Maintain a formal, helpful, and "Professor-like" tone at all times.
DATA CONTEXT:
${dbContext}`;

        const modelsToTry = ["gemini-2.0-flash", "gemini-pro-latest"];
        let text = "";

        for (const modelName of modelsToTry) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName, systemInstruction });
                let geminiHistory = history.map(msg => ({
                    role: msg.sender === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.text }]
                }));
                const chat = model.startChat({ history: geminiHistory });
                const result = await chat.sendMessage(question);
                text = (await result.response).text();
                if (text) break;
            } catch (err) { console.warn(`Model ${modelName} failed:`, err.message); }
        }

        // If Gemini fails or returns empty, use the local engine directly
        if (!text) {
            text = localResult;
        }

        // --- PERSISTENCE LOGIC ---
        if (userId) {
            let session;
            if (sessionId && sessionId !== 'new') {
                session = await ChatSession.findById(sessionId);
            }

            if (!session) {
                session = new ChatSession({
                    userId,
                    title: question.substring(0, 30) + (question.length > 30 ? '...' : ''),
                    messages: []
                });
            }

            session.messages.push({ id: Date.now().toString(), sender: 'user', text: question });
            session.messages.push({ id: (Date.now() + 1).toString(), sender: 'bot', text: text });
            session.lastMessage = text;
            await session.save();

            return res.json({ reply: text, sessionId: session._id });
        }

        res.json({ reply: text });

    } catch (error) {
        console.error("AI Route Error:", error);
        res.status(500).json({ reply: "I'm having trouble retrieving that information right now." });
    }
});

// @route   POST /api/chat/ask-offline
// @desc    Get purely logical, local response bypassing Gemini
router.post('/ask-offline', async (req, res) => {
    try {
        const { question } = req.body;
        const { handleOfflineRequest } = require('../utils/localAiEngine');
        const reply = await handleOfflineRequest(question);
        res.json({ reply });
    } catch (error) {
        console.error("Offline AI Error:", error);
        res.status(500).json({ reply: "My logic circuits are temporarily disconnected." });
    }
});

module.exports = router;

