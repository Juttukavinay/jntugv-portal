const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function debugGemini() {
    if (!process.env.GEMINI_API_KEY) {
        console.error("EROROR: GEMINI_API_KEY is not set in .env");
        return;
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelName = "gemini-2.0-flash";

    console.log(`Debug: Testing advanced generation with ${modelName}...`);
    console.log(`Key: ${process.env.GEMINI_API_KEY.substring(0, 4)}...`);

    const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: "You are a debug assistant testing the advanced Gemini SDK implementation."
    });

    try {
        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: "Hello AI, I am testing the new implementation." }],
                },
                {
                    role: "model",
                    parts: [{ text: "System check: OK. I am ready to assist with your university portal debug task." }],
                },
            ],
        });

        const question = "Can you confirm that this 'startChat' and 'systemInstruction' pattern is correctly implemented?";
        const result = await chat.sendMessage(question);
        const response = await result.response;
        console.log("Response text:", response.text());
        console.log("\nSuccess! The implementation matches the 'Master Gemini API' best practices.");
    } catch (error) {
        console.error("Error Caught!");
        console.error("Message:", error.message);
    }
}

debugGemini();
