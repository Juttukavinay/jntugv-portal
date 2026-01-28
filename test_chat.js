const axios = require('axios');

async function testChat() {
    try {
        const res = await axios.post('http://localhost:5000/api/chat/ask', {
            question: "Hello",
            userContext: {}
        });
        console.log("Success:", res.data);
    } catch (error) {
        console.error("Full Error:", error.message);
        if (error.response) {
            console.error("Data:", error.response.data);
        }
    }
}

testChat();
