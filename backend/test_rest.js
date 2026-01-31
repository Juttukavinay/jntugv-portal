const axios = require('axios');
require('dotenv').config();

async function testRest() {
    const key = process.env.GEMINI_API_KEY;
    console.log("Testing REST API directly...");
    // Try v1 instead of v1beta
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${key}`;

    try {
        const response = await axios.post(url, {
            contents: [{ parts: [{ text: "Hello" }] }]
        });
        console.log("REST v1 Success!");
        console.log("Response:", response.data.candidates[0].content.parts[0].text);
    } catch (e) {
        console.log("REST v1 Failed:", e.response ? e.response.status : e.message);
        if (e.response && e.response.data) console.log(JSON.stringify(e.response.data, null, 2));

        console.log("\nTrying REST v1beta...");
        const urlBeta = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
        try {
            const responseBeta = await axios.post(urlBeta, {
                contents: [{ parts: [{ text: "Hello" }] }]
            });
            console.log("REST v1beta Success!");
        } catch (e2) {
            console.log("REST v1beta Failed:", e2.response ? e2.response.status : e2.message);
            if (e2.response && e2.response.data) console.log(JSON.stringify(e2.response.data, null, 2));
        }
    }
}

testRest();
