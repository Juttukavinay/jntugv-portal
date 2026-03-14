const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
dotenv.config({ path: path.join(__dirname, '.env') });

async function check() {
    const apiKey = process.env.GEMINI_API_KEY;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    if (data.models) {
        const names = data.models.map(m => m.name).join('\n');
        fs.writeFileSync('model_list.txt', names);
        console.log("Saved 45 models to model_list.txt");
    }
}
check();
