const axios = require('axios');
require('dotenv').config();

async function listAllModels() {
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const response = await axios.get(url);
        if (!response.data.models) {
            console.log("No models found in response.");
            return;
        }
        for (const m of response.data.models) {
            if (m.name.includes('flash') || m.name.includes('pro')) {
                console.log(`MODEL_FOUND: ${m.name}`);
            }
        }
    } catch (e) {
        console.log("Error:", e.message);
    }
}

listAllModels();
