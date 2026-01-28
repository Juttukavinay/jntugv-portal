import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import API_BASE_URL from '../config';

const ChatAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I'm your JNTU-GV AI Assistant. How can I help you manage your academic tasks today?", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const location = useLocation();

    // Only show on dashboard pages
    // if (!location.pathname.includes('/dashboard')) return null;
    console.log("ChatAssistant Mounted. Path:", location.pathname);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

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
                    // You could pass user context here if needed
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessages(prev => [...prev, { id: Date.now() + 1, text: data.reply, sender: 'bot' }]);
            } else {
                setMessages(prev => [...prev, { id: Date.now() + 1, text: "Sorry, I'm having trouble retrieving that info right now.", sender: 'bot' }]);
            }
        } catch (error) {
            console.error("Chat Error", error);
            setMessages(prev => [...prev, { id: Date.now() + 1, text: "Network error. Please try again later.", sender: 'bot' }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 2147483647, fontFamily: "'Inter', sans-serif" }}>
            {/* Chat Window */}
            {isOpen && (
                <div className="chat-window fade-in-up" style={{
                    position: 'absolute',
                    bottom: '80px',
                    right: '0',
                    width: '350px',
                    height: '500px',
                    background: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '20px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '1.2rem',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <div style={{
                            width: '32px', height: '32px', background: 'white', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#2563eb', fontWeight: 'bold'
                        }}>AI</div>
                        <div>
                            <h4 style={{ margin: 0, fontSize: '1rem' }}>JNTU-GV Assistant</h4>
                            <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>● Online</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
                    </div>

                    {/* Messages Area */}
                    <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {messages.map(msg => (
                            <div key={msg.id} style={{
                                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '80%',
                            }}>
                                <div style={{
                                    padding: '10px 16px',
                                    borderRadius: msg.sender === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                                    background: msg.sender === 'user' ? '#3b82f6' : '#334155',
                                    color: msg.sender === 'user' ? 'white' : '#e2e8f0',
                                    fontSize: '0.9rem',
                                    lineHeight: '1.4',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                }}>
                                    {msg.text}
                                </div>
                                {msg.sender === 'bot' && <span style={{ fontSize: '0.65rem', color: '#64748b', marginLeft: '4px', marginTop: '4px', display: 'block' }}>AI Assistant</span>}
                            </div>
                        ))}
                        {isTyping && (
                            <div style={{ alignSelf: 'flex-start', padding: '10px 16px', background: '#334155', borderRadius: '12px', display: 'flex', gap: '4px' }}>
                                <div className="typing-dot" style={{ width: '6px', height: '6px', background: '#94a3b8', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both' }}></div>
                                <div className="typing-dot" style={{ width: '6px', height: '6px', background: '#94a3b8', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both 0.2s' }}></div>
                                <div className="typing-dot" style={{ width: '6px', height: '6px', background: '#94a3b8', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both 0.4s' }}></div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '0.5rem', background: '#0f172a' }}>
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleSend()}
                            placeholder="Type a message..."
                            style={{
                                flex: 1,
                                background: '#1e293b',
                                border: '1px solid #334155',
                                padding: '10px 14px',
                                borderRadius: '20px',
                                color: 'white',
                                outline: 'none'
                            }}
                        />
                        <button
                            onClick={handleSend}
                            style={{
                                width: '40px', height: '40px', borderRadius: '50%',
                                background: '#3b82f6', border: 'none', color: 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', transition: 'transform 0.2s'
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Float Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="pulse-animation"
                    style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        border: 'none',
                        color: 'white',
                        boxShadow: '0 10px 25px rgba(37, 99, 235, 0.4)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.3s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                </button>
            )}

            <style>{`
                @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
                .pulse-animation { animation: pulse-shadow 2s infinite; }
                @keyframes pulse-shadow {
                    0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7); }
                    70% { box-shadow: 0 0 0 15px rgba(37, 99, 235, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
                }
                .fade-in-up { animation: fadeInUp 0.3s ease-out; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default ChatAssistant;
