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
    },
    // Timetable Functions
    get_timetable: async ({ semester }) => {
        const Timetable = require('../models/timetableModel');
        const tt = await Timetable.findOne({ className: semester });
        if (!tt) return { error: `No timetable found for ${semester}` };
        
        // Summarize to save tokens
        let summary = [];
        tt.schedule.forEach(d => {
            summary.push(`Day: ${d.day}`);
            d.periods.forEach(p => {
                if (p.subject !== '-') {
                    summary.push(`  - ${p.time}: ${p.subject} (${p.faculty || 'Unassigned'}) [${p.type}]`);
                }
            });
        });
        return { semester: tt.className, schedule: summary.join('\n') };
    },
    get_faculty_timetable: async ({ facultyName }) => {
        const Timetable = require('../models/timetableModel');
        const timetables = await Timetable.find({});
        let myPeriods = [];
        timetables.forEach(tt => {
            if (!tt.schedule) return;
            tt.schedule.forEach(day => {
                day.periods.forEach(p => {
                    if (p.faculty === facultyName || (p.assistants && p.assistants.includes(facultyName))) {
                        myPeriods.push(`${tt.className} | ${day.day} | ${p.time} | ${p.subject} | ${p.room || 'No Room'}`);
                    }
                });
            });
        });
        if (myPeriods.length === 0) return { message: `No classes found for ${facultyName}` };
        return { classes: myPeriods.join('\n') };
    },
    suggest_timetable_fix: async ({ semester, subject }) => {
        // AI can just get the timetable and ask to look for free spaces, 
        // but providing a list of all timetables is too big. 
        // We can just return the timetable and tell AI to suggest.
        const Timetable = require('../models/timetableModel');
        const timetables = await Timetable.find({});
        const target = timetables.find(t => t.className === semester);
        if (!target) return { error: "Timetable not found" };

        let freeSlots = [];
        target.schedule.forEach(d => {
            d.periods.forEach(p => {
                if (p.subject === '-' || p.type === 'Free' || p.type === 'Activity') {
                    freeSlots.push(`${d.day} ${p.time} (Type: ${p.type})`);
                }
            });
        });
        return { 
            message: `Here are the currently Free or Activity slots in ${semester} where you might place '${subject}':\n` + freeSlots.join('\n'),
            instruction: "You can suggest the user to use one of these slots."
        };
    },
    check_faculty_clashes: async ({ facultyName }) => {
        const Timetable = require('../models/timetableModel');
        const timetables = await Timetable.find({});
        let scheduleTracker = {};
        let clashes = [];

        timetables.forEach(tt => {
            if(!tt.schedule) return;
            tt.schedule.forEach(day => {
                day.periods.forEach(p => {
                    if (p.faculty === facultyName || (p.assistants && p.assistants.includes(facultyName))) {
                        const timeKey = `${day.day} ${p.time}`;
                        if (scheduleTracker[timeKey]) {
                            clashes.push(`CLASH: ${facultyName} is assigned to both ${scheduleTracker[timeKey]} AND ${tt.className} at ${timeKey}`);
                        } else {
                            scheduleTracker[timeKey] = tt.className;
                        }
                    }
                });
            });
        });
        
        if (clashes.length > 0) return { status: "Clashes Found", details: clashes.join('\n') };
        return { status: "No Clashes", message: `${facultyName} has a clear schedule with no overlaps.` };
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
                        },
                        {
                            name: "get_timetable",
                            description: "Get the timetable for a specific semester/class",
                            parameters: {
                                type: "OBJECT",
                                properties: {
                                    semester: { type: "STRING", description: "The name of the semester/class, e.g., 'I-B.Tech I Sem', 'I-MCA I Sem', etc." }
                                },
                                required: ["semester"]
                            }
                        },
                        {
                            name: "get_faculty_timetable",
                            description: "Get all classes and slots assigned to a specific faculty member",
                            parameters: {
                                type: "OBJECT",
                                properties: {
                                    facultyName: { type: "STRING", description: "The name of the faculty member" }
                                },
                                required: ["facultyName"]
                            }
                        },
                        {
                            name: "suggest_timetable_fix",
                            description: "Get a list of currently free empty slots to suggest placing a unallocated subject in a semester's timetable",
                            parameters: {
                                type: "OBJECT",
                                properties: {
                                    semester: { type: "STRING", description: "The semester/class name" },
                                    subject: { type: "STRING", description: "The unallocated subject code or name" }
                                },
                                required: ["semester", "subject"]
                            }
                        },
                        {
                            name: "check_faculty_clashes",
                            description: "Analyze the global timetable to find if a faculty member has any scheduling overlaps or double-bookings",
                            parameters: {
                                type: "OBJECT",
                                properties: {
                                    facultyName: { type: "STRING", description: "The name of the faculty member" }
                                },
                                required: ["facultyName"]
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
