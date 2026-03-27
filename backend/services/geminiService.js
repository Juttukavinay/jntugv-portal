const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generates a timetable using Gemini AI based on provided constraints.
 * @param {Object} data - Contains subjects, faculty, rooms, department, and semester.
 */
async function generateTimetableWithAI(data) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = `
        You are an expert Timetable Coordinator for an Engineering College (JNTU-GV). 
        Your task is to generate a comprehensive, clash-free weekly timetable for the following department data:
        
        DEPARTMENT: ${data.department}
        SEMESTER: ${data.semester}
        
        SUBJECTS: ${JSON.stringify(data.subjects)}
        FACULTY: ${JSON.stringify(data.faculty)}
        ROOMS: ${JSON.stringify(data.rooms)}
        
        CONSTRAINTS:
        1. Each subject has L (Lecture), T (Tutorial), P (Practical/Lab) credits. 
           L=3 means 3 one-hour lectures per week. 
           T=1 means 1 one-hour tutorial per week.
           P=3 means ONE 3-hour continuous lab session per week.
        2. Theory periods are 1 hour (09:30-10:30, 10:30-11:30, 11:30-12:30, 02:00-03:00, 03:00-04:00, 04:00-05:00).
        3. Labs (P) MUST be 3 hours continuous (either 09:30-12:30 or 02:00-05:00).
        4. Faculty cannot be assigned to more than one class in the same time slot across ALL semesters (Assume these are the only constraints for now).
        5. Rooms (Classrooms/Labs) cannot be double-booked.
        6. Lunch break is fixed: 12:30 PM to 02:00 PM.
        7. Days: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday.
        
        OUTPUT FORMAT:
        Return ONLY a JSON object. NO markdown, NO preamble.
        {
          "schedule": [
            {
              "day": "Monday",
              "periods": [
                { "time": "09:30-10:30", "subject": "Subject Name", "faculty": "Faculty Name", "room": "Room Name", "type": "Theory", "ltp": "3-0-0" },
                ... (6 periods per day, matching the theory slots)
              ]
            },
            ... (repeat for all 6 days)
          ],
          "report": {
            "summary": "Briefly summarize what was generated",
            "clashesResolved": ["List of potential clashes handled"],
            "warnings": ["Any subjects that couldn't be fully allocated"],
            "optimizationNotes": "Details about how faculty workload or room usage was optimized"
          }
        }
        
        IMPRORTANT: If a subject is a Lab (P > 0), mark its type as 'Lab'. theory slots should be 'Theory'.
    `;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        
        // Extract JSON from potential markdown code blocks
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("Failed to extract JSON from Gemini response");
        }
        
        const jsonResponse = JSON.parse(jsonMatch[0]);
        return jsonResponse;
    } catch (error) {
        console.error("Gemini AI API Error:", error);
        throw error;
    }
}

module.exports = { generateTimetableWithAI };
