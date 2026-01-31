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

        // 1. Context Injection logic remains same
        let dbContext = "";
        if (!skipContext) {
            try {
                const [subjects, departments, faculties, classes, courses, attendanceStats, timetables] = await Promise.all([
                    Subject.find({}).limit(30),
                    Department.find({}),
                    Faculty.find({}),
                    Timetable.distinct('className'),
                    Course.find({}),
                    Attendance.aggregate([{ $group: { _id: "$subject", count: { $sum: 1 } } }]),
                    Timetable.find({})
                ]);
                const studentCount = await Student.countDocuments();
                const workloadMap = faculties.map(f => {
                    let hrs = 0;
                    timetables.forEach(tt => tt.schedule.forEach(day => day.periods.forEach(p => {
                        if (p.faculty === f.name) hrs += (p.type === 'Lab' ? 3 : (p.credits || 1));
                    })));
                    return `${f.name}: ${hrs}/${f.designation?.includes('Prof') ? 14 : 16}h`;
                }).slice(0, 15).join(', ');

                dbContext = `UNIVERSITY CONTEXT:\nDepts: ${departments.map(d => d.deptName).join(', ')}\nFaculty Workload: ${workloadMap}\nStudents: ${studentCount}\nActive Semesters: ${classes.join(', ')}`;
            } catch (e) { console.error(e); }
        }

        const systemInstruction = `You are the JNTU-GV University Smart Assistant. Use the following data if relevant: ${dbContext}. Keep answers professional. History is provided for context. Answer academic questions or portal-specific ones correctly.`;

        const modelsToTry = ["gemini-2.0-flash", "gemini-pro-latest"];
        let text = "";

        for (const modelName of modelsToTry) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName, systemInstruction });
                let geminiHistory = history.map(msg => ({ role: msg.sender === 'user' ? 'user' : 'model', parts: [{ text: msg.text }] }));
                const chat = model.startChat({ history: geminiHistory });
                const result = await chat.sendMessage(question);
                text = (await result.response).text();
                if (text) break;
            } catch (err) { console.warn(modelName, err.message); }
        }

        if (!text) {
            const { handleOfflineRequest } = require('../utils/localAiEngine');
            text = await handleOfflineRequest(question);
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

module.exports = router;

