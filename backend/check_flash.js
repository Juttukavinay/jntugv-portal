const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

async function check() {
    const apiKey = process.env.GEMINI_API_KEY;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    if (data.models) {
        console.log("ALL GEMINI MODELS:");
        data.models.forEach(m => {
            if (m.name.includes('gemini')) {
                console.log(`FOUND: ${m.name}`);
            }
        });
    }
    else {
        console.log("No models found or error:", data.error?.message);
    }
}
check();
