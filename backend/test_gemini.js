const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function listAvailableModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        if (data.models) {
            const hasFlash = data.models.some(m => m.name === 'models/gemini-1.5-flash');
            console.log("Has gemini-1.5-flash?", hasFlash);

            console.log("\nALL AVAILABLE MODELS:");
            data.models.forEach(m => console.log(`  > ${m.name}`));
        } else {
            console.log("Error:", data.error?.message || "Unknown error");
        }
    } catch (err) {
        console.log("Error:", err.message);
    }
}
listAvailableModels();
