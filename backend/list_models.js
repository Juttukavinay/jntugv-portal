const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        // There is no direct listModels in the genAI class usually, 
        // but we can try to hit the API or just check common ones.
        // Actually, the SDK has an internal way but it's not always exposed.
        console.log("Testing common model names...");
        const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro"];
        for (const m of models) {
            try {
                const model = genAI.getGenerativeModel({ model: m });
                const res = await model.generateContent("Hi");
                console.log(`- ${m}: SUCCESS`);
            } catch (e) {
                console.log(`- ${m}: FAILED (${e.message})`);
            }
        }
    } catch (error) {
        console.error("List Models Error:", error.message);
    }
}

listModels();
