const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

async function listAllModels() {
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const response = await axios.get(url);
        const names = response.data.models.map(m => m.name);
        fs.writeFileSync('all_names_raw.txt', names.join('\n'));
        console.log("Written all names to all_names_raw.txt");
    } catch (e) {
        console.log("Error:", e.message);
    }
}

listAllModels();
