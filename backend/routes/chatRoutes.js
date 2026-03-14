const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Student = require('../models/studentModel');
const Faculty = require('../models/facultyModel');
const Attendance = require('../models/attendanceModel');
const Notice = require('../models/noticeModel');
const Department = require('../models/departmentModel');

// Define the functions that Gemini can call
const functions = {
    get_student_stats: async () => {
        const count = await Student.countDocuments();
        return { total_students: count };
    },
    get_faculty_stats: async () => {
        const count = await Faculty.countDocuments();
        return { total_faculty: count };
    },
    get_department_stats: async () => {
        const count = await Department.countDocuments();
        return { total_departments: count };
    },
    get_all_departments: async () => {
        const departments = await Department.find({}, 'name code');
        return { departments: departments.map(d => ({ name: d.name, code: d.code })) };
    },
    get_recent_notices: async () => {
        const notices = await Notice.find({ type: 'notice' }).sort({ createdAt: -1 }).limit(3);
        return { notices: notices.map(n => ({ title: n.title, content: n.content, sender: n.senderName })) };
    },
    mark_attendance: async ({ rollNumber, status, subject, semester }, userContext) => {
        const student = await Student.findOne({ rollNumber });
        if (!student) return { error: "Student not found" };

        // Attendance model requires a structured record
        const attendance = await Attendance.create({
            date: new Date().toISOString().split('T')[0],
            subject: subject || 'General',
            semester: semester || student.semester || 'Current',
            facultyId: userContext?.id,
            facultyName: userContext?.name || 'AI Assistant',
            records: [{
                studentId: student._id,
                rollNumber: student.rollNumber,
                name: student.name,
                status: status || 'Present'
            }]
        });
        return { success: true, message: `Attendance for ${student.name} (${student.rollNumber}) has been recorded as ${status || 'Present'}.` };
    },
    post_new_notice: async ({ title, content, targetDepartment }, userContext) => {
        const notice = await Notice.create({
            senderId: userContext?.email || 'admin@jntugv.edu.in',
            senderName: userContext?.name || 'Portal Admin',
            senderRole: userContext?.role || 'admin',
            type: 'notice',
            title: title,
            content: content,
            recipientRoles: ['student', 'faculty'],
            targetDepartment: targetDepartment || 'All',
            priority: 'normal'
        });
        return { success: true, message: `New notice "${title}" has been posted successfully.` };
    }
};

router.post('/', async (req, res) => {
    const { message, userContext } = req.body;
    console.log(`--- New Chat Request ---`);
    console.log(`User: ${userContext?.name} (${userContext?.role})`);
    console.log(`Message: ${message}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey.includes('your_free_gemini')) {
            console.error("DEBUG: API Key is either empty or placeholder");
            throw new Error("API_KEY_NOT_SET: Please paste your real Gemini API key in backend/.env file.");
        }

        // Initialize Gemini Lite for better quota
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-flash-lite-latest",
            safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
            ],
            tools: [
                {
                    functionDeclarations: [
                        {
                            name: "get_student_stats",
                            description: "Get the total number of students in the university",
                        },
                        {
                            name: "get_faculty_stats",
                            description: "Get the total number of faculty members",
                        },
                        {
                            name: "get_department_stats",
                            description: "Get the total number of departments in the university",
                        },
                        {
                            name: "get_all_departments",
                            description: "List all departments with their names and codes",
                        },
                        {
                            name: "get_recent_notices",
                            description: "Get the latest official notices or announcements",
                        },
                        {
                            name: "mark_attendance",
                            description: "Mark attendance for a student (Faculty/Admin only)",
                            parameters: {
                                type: "OBJECT",
                                properties: {
                                    rollNumber: { type: "STRING", description: "The student's roll number" },
                                    status: { type: "STRING", description: "Present or Absent" },
                                    subject: { type: "STRING", description: "The name of the subject" },
                                    semester: { type: "STRING", description: "The current semester" }
                                },
                                required: ["rollNumber"]
                            }
                        },
                        {
                            name: "post_new_notice",
                            description: "Post a new official notice to the portal (HOD/Principal/Admin only)",
                            parameters: {
                                type: "OBJECT",
                                properties: {
                                    title: { type: "STRING", description: "Title of the notice" },
                                    content: { type: "STRING", description: "Detailed content of the notice" },
                                    targetDepartment: { type: "STRING", description: "Specific department or 'All'" }
                                },
                                required: ["title", "content"]
                            }
                        }
                    ],
                },
            ],
        });

        const chat = model.startChat();

        // Helper for retrying 429s once
        const callGemini = async (input, isResponse = false) => {
            try {
                return await chat.sendMessage(input);
            } catch (err) {
                if (err.message.includes('429') || err.message.includes('quota')) {
                    console.log("Quota hit, retrying once in 2s...");
                    await new Promise(r => setTimeout(r, 2000));
                    return await chat.sendMessage(input);
                }
                throw err;
            }
        };

        let result = await callGemini(`User Role: ${userContext?.role || 'guest'}. User Name: ${userContext?.name || 'User'}. Message: ${message}`);
        let response = result.response;

        let call = response.functionCalls();
        if (call) {
            const functionResponses = [];
            for (const f of call) {
                const functionName = f.name;
                const args = f.args;

                if (functions[functionName]) {
                    const isRestricted = ['mark_attendance', 'post_new_notice'].includes(functionName);
                    const canOperate = ['admin', 'faculty', 'hod', 'principal'].includes(userContext?.role);

                    if (isRestricted && !canOperate) {
                        functionResponses.push({
                            functionResponse: {
                                name: functionName,
                                response: { error: "Permission denied." }
                            }
                        });
                        continue;
                    }

                    const data = await functions[functionName](args, userContext);
                    functionResponses.push({
                        functionResponse: {
                            name: functionName,
                            response: data
                        }
                    });
                }
            }

            result = await callGemini(functionResponses, true);
            response = result.response;
        }

        let text = "I'm sorry, I couldn't generate a response.";
        try {
            text = response.text();
        } catch (e) {
            console.error("DEBUG: Response text blocked or empty:", e.message);
            if (response.candidates?.[0]?.finishReason === 'SAFETY') {
                text = "I'm sorry, but I can't answer that due to safety filters.";
            }
        }

        res.json({ reply: text });
    } catch (error) {
        console.error('Chat API Error:', error.message);
        let userMessage = "Error generating response";
        if (error.message.includes('429')) userMessage = "Too Many Requests. Please wait a moment.";
        if (error.message.includes('permission')) userMessage = "API Key Permission error.";

        res.status(500).json({
            message: userMessage || "Internal Server Error in Chat API",
            error: error.message,
            stack: error.stack
        });
    }
});

module.exports = router;
