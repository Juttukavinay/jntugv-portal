import { useState, useRef, useEffect } from 'react';
import API_BASE_URL from '../../config';

function AiPlayground() {
    const [messages, setMessages] = useState([
        { id: 1, text: "Welcome to the AI Testing Lab! I am running in 'General Mode', unconnected to university data. Test my general knowledge!", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/chat/ask`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: userMsg.text,
                    skipContext: true // <--- EXPERIMENTAL MODE
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessages(prev => [...prev, { id: Date.now() + 1, text: data.reply, sender: 'bot' }]);
            } else {
                setMessages(prev => [...prev, { id: Date.now() + 1, text: "Error: " + (data.reply || "Failed to get response"), sender: 'bot', isError: true }]);
            }
        } catch (error) {
            console.error("Chat Error", error);
            setMessages(prev => [...prev, { id: Date.now() + 1, text: "Network Error: Could not reach the AI brain.", sender: 'bot', isError: true }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="glass-panel" style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(226, 232, 240, 0.8)', background: 'linear-gradient(to right, #f8fafc, #fff)' }}>
                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.8rem' }}>🧠</span>
                    JNTU-GV Intelligent Assistant
                </h2>
                <p style={{ margin: '0.5rem 0 0 0', color: '#64748b' }}>Running in <b>Offline Intelligence Mode</b>. I can scan the database for clashes, faculty info, and university stats.</p>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#f8fafc' }}>
                {messages.map(msg => (
                    <div key={msg.id} style={{
                        alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '70%',
                    }}>
                        <div style={{
                            padding: '1rem 1.5rem',
                            borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            background: msg.isError ? '#fee2e2' : (msg.sender === 'user' ? '#3b82f6' : 'white'),
                            color: msg.isError ? '#dc2626' : (msg.sender === 'user' ? 'white' : '#334155'),
                            border: msg.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                            fontSize: '1rem',
                            lineHeight: '1.6'
                        }}>
                            {msg.text}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem', display: 'block', textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                            {msg.sender === 'user' ? 'You' : 'Gemini AI (General Mode)'}
                        </span>
                    </div>
                ))}

                {isTyping && (
                    <div style={{ alignSelf: 'flex-start', padding: '1rem 1.5rem', background: 'white', borderRadius: '18px', border: '1px solid #e2e8f0' }}>
                        <div className="typing-dot" style={{ display: 'inline-block', width: '6px', height: '6px', background: '#94a3b8', borderRadius: '50%', margin: '0 2px', animation: 'bounce 1.4s infinite ease-in-out both' }}></div>
                        <div className="typing-dot" style={{ display: 'inline-block', width: '6px', height: '6px', background: '#94a3b8', borderRadius: '50%', margin: '0 2px', animation: 'bounce 1.4s infinite ease-in-out both 0.2s' }}></div>
                        <div className="typing-dot" style={{ display: 'inline-block', width: '6px', height: '6px', background: '#94a3b8', borderRadius: '50%', margin: '0 2px', animation: 'bounce 1.4s infinite ease-in-out both 0.4s' }}></div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: '1.5rem', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '1rem' }}>
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSend()}
                    placeholder="Ask anything (e.g., 'Write a poem about coding')..."
                    style={{
                        flex: 1,
                        padding: '1rem 1.5rem',
                        borderRadius: '12px',
                        border: '2px solid #e2e8f0',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
                <button
                    onClick={handleSend}
                    style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '0 2rem',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                    }}
                >
                    Send
                </button>
            </div>
            <style>{`
                @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
            `}</style>
        </div>
    );
}

export default AiPlayground;
