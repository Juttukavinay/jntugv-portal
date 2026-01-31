const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function debugGemini() {
    const key = (process.env.GEMINI_API_KEY || "").trim();
    if (!key) {
        console.error("EROROR: GEMINI_API_KEY is not set or empty.");
        return;
    }

    const genAI = new GoogleGenerativeAI(key);
    const modelName = "gemini-1.5-flash";

    console.log(`Debug: Testing generation with ${modelName}...`);
    console.log(`Key: ${key.substring(0, 4)}... (length: ${key.length})`);

    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hi");
        const response = await result.response;
        console.log("Success:", response.text());
    } catch (error) {
        console.error("Error Caught!");
        console.error("Message:", error.message);
    }
}

debugGemini();
