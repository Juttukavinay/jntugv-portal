const axios = require('axios');
require('dotenv').config();

async function listAllModels() {
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const response = await axios.get(url);
        console.log("Available Models:");
        response.data.models.forEach(m => {
            console.log(`- ${m.name} (${m.displayName})`);
        });
    } catch (e) {
        console.log("Failed to list models:", e.response ? e.response.status : e.message);
        if (e.response && e.response.data) console.log(JSON.stringify(e.response.data, null, 2));
    }
}

listAllModels();
