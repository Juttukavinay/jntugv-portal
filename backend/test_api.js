// Native fetch available in Node 22

async function testChat() {
    try {
        const response = await fetch('http://localhost:5000/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: "hi this is a test",
                userContext: { name: "Test User", role: "admin" }
            }),
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', data);
    } catch (error) {
        console.error('Fetch error:', error.message);
    }
}

testChat();
