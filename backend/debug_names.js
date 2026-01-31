const axios = require('axios');
require('dotenv').config();

async function listAllModels() {
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const response = await axios.get(url);
        const names = response.data.models.map(m => m.name.split('/').pop());
        console.log("SHORT_NAMES:", names.join(','));
    } catch (e) {
        console.log("Error:", e.message);
    }
}

listAllModels();
