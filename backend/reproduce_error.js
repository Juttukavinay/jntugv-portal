const axios = require('axios');

async function testChat() {
    try {
        console.log("Sending request to chat API...");
        const response = await axios.post('http://localhost:5000/api/chat/ask', {
            question: "hi",
            skipContext: true
        });
        console.log("Success:", response.data);
    } catch (error) {
        console.error("API Error Status:", error.response ? error.response.status : "No Response");
        console.error("API Error Data:", error.response ? error.response.data : error.message);
    }
}

testChat();
