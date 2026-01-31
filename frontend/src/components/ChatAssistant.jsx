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
    const user = JSON.parse(localStorage.getItem('user'));

    // 1. Hide on login/landing pages
    const publicPages = ['/', '/login'];
    if (publicPages.includes(location.pathname)) return null;

    // 2. Only show if logged in
    if (!user) return null;

    // 3. Hide for Vice Principal (as per previous requirements)
    if (user.role === 'vice-principal') return null;

    console.log("ChatAssistant active for:", user.role);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), text: input, sender: 'user' };
        // Create the new history including the current message
        const newMessages = [...messages, userMsg];

        setMessages(newMessages);
        setInput('');
        setIsTyping(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/chat/ask`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: userMsg.text,
                    history: messages.slice(-10), // Send last 10 messages for context
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
                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <div style={{
                            width: '38px', height: '38px', background: 'rgba(255,255,255,0.2)',
                            borderRadius: '12px', backdropFilter: 'blur(4px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.2rem'
                        }}>🤖</div>
                        <div>
                            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', letterSpacing: '0.5px' }}>JNTU-GV AI</h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ width: '6px', height: '6px', background: '#4ade80', borderRadius: '50%' }}></span>
                                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Active Now</span>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{
                            marginLeft: 'auto', background: 'rgba(255,255,255,0.1)', border: 'none',
                            color: 'white', width: '30px', height: '30px', borderRadius: '8px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', transition: 'all 0.2s'
                        }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div style={{
                        flex: 1, padding: '1.2rem', overflowY: 'auto', display: 'flex',
                        flexDirection: 'column', gap: '1.2rem',
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'rgba(255,255,255,0.1) transparent'
                    }}>
                        {messages.map(msg => (
                            <div key={msg.id} style={{
                                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '85%',
                                animation: 'messageSlide 0.3s ease-out'
                            }}>
                                <div style={{
                                    padding: '12px 16px',
                                    borderRadius: msg.sender === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                    background: msg.sender === 'user'
                                        ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
                                        : 'rgba(255,255,255,0.05)',
                                    border: msg.sender === 'user' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                    color: 'white',
                                    fontSize: '0.92rem',
                                    lineHeight: '1.5',
                                    boxShadow: msg.sender === 'user' ? '0 4px 15px rgba(79, 70, 229, 0.3)' : 'none',
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    {msg.text}
                                </div>
                                <span style={{
                                    fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)',
                                    padding: '4px 8px', display: 'block',
                                    textAlign: msg.sender === 'user' ? 'right' : 'left'
                                }}>
                                    {msg.sender === 'user' ? 'You' : 'AI Assistant'}
                                </span>
                            </div>
                        ))}
                        {isTyping && (
                            <div style={{ alignSelf: 'flex-start', padding: '12px 20px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', display: 'flex', gap: '6px' }}>
                                <div className="typing-dot" style={{ width: '6px', height: '6px', background: '#818cf8', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both' }}></div>
                                <div className="typing-dot" style={{ width: '6px', height: '6px', background: '#818cf8', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both 0.2s' }}></div>
                                <div className="typing-dot" style={{ width: '6px', height: '6px', background: '#818cf8', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both 0.4s' }}></div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div style={{
                        padding: '1.2rem',
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex', gap: '0.8rem',
                        background: 'rgba(15, 23, 42, 0.98)',
                        alignItems: 'center'
                    }}>
                        <textarea
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Ask JNTU-GV AI..."
                            rows="1"
                            style={{
                                flex: 1,
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                padding: '12px 16px',
                                borderRadius: '15px',
                                color: 'white',
                                outline: 'none',
                                resize: 'none',
                                fontSize: '0.9rem',
                                transition: 'all 0.2s',
                                maxHeight: '100px',
                                fontFamily: 'inherit'
                            }}
                            onFocus={(e) => {
                                e.target.style.background = 'rgba(255,255,255,0.05)';
                                e.target.style.borderColor = '#6366f1';
                            }}
                            onBlur={(e) => {
                                e.target.style.background = 'rgba(255,255,255,0.03)';
                                e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                            }}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim()}
                            style={{
                                width: '42px', height: '42px', borderRadius: '12px',
                                background: input.trim() ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : '#334155',
                                border: 'none', color: 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: input.trim() ? 'pointer' : 'default',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: input.trim() ? '0 4px 12px rgba(79, 70, 229, 0.3)' : 'none'
                            }}
                            onMouseEnter={(e) => { if (input.trim()) e.currentTarget.style.transform = 'translateY(-2px)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
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
                        width: '65px',
                        height: '65px',
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                        border: 'none',
                        color: 'white',
                        boxShadow: '0 10px 30px rgba(79, 70, 229, 0.5)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)';
                        e.currentTarget.style.boxShadow = '0 15px 35px rgba(79, 70, 229, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                        e.currentTarget.style.boxShadow = '0 10px 30px rgba(79, 70, 229, 0.5)';
                    }}
                >
                    <div style={{ position: 'relative' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        <span style={{
                            position: 'absolute', top: '-5px', right: '-5px',
                            width: '12px', height: '12px', background: '#4ade80',
                            borderRadius: '50%', border: '2px solid #4f46e5'
                        }}></span>
                    </div>
                </button>
            )}

            <style>{`
                @keyframes bounce { 0%, 80%, 100% { transform: scale(0); opacity: 0.3; } 40% { transform: scale(1); opacity: 1; } }
                .pulse-animation { animation: pulse-shadow 3s infinite; }
                @keyframes pulse-shadow {
                    0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.6); }
                    70% { box-shadow: 0 0 0 20px rgba(99, 102, 241, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
                }
                .fade-in-up { 
                    animation: fadeInUp 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
                    transform-origin: bottom right;
                }
                @keyframes fadeInUp { 
                    from { opacity: 0; transform: translateY(30px) scale(0.9); } 
                    to { opacity: 1; transform: translateY(0) scale(1); } 
                }
                @keyframes messageSlide {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default ChatAssistant;
