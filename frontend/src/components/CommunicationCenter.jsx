import { useState, useEffect } from 'react';
import API_BASE_URL from '../config';

const CommunicationCenter = ({ user, showToast }) => {
    const [messages, setMessages] = useState([]);
    const [activeMsg, setActiveMsg] = useState(null);
    const [isComposing, setIsComposing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [textInput, setTextInput] = useState('');
    const [showAttachMenu, setShowAttachMenu] = useState(false);

    // Broadcast Form states
    const [broadcastType, setBroadcastType] = useState('notice'); // notice or poll
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [recipients, setRecipients] = useState(['student', 'faculty', 'hod']);
    const [targetDept, setTargetDept] = useState('All');
    const [pollOptions, setPollOptions] = useState(['', '']);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 10000); // Auto-refresh every 10s
        return () => clearInterval(interval);
    }, [user]);

    const fetchMessages = async () => {
        try {
            const userId = user._id || user.id || user.rollNumber || user.name;
            const res = await fetch(`${API_BASE_URL}/api/notices?role=${user.role}&department=${user.department}&userId=${userId}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setMessages(data);
                if (!activeMsg && data.length > 0) setActiveMsg(data[0]);
                // If the active message was a poll and it updated, refresh its state
                if (activeMsg) {
                    const updatedActive = data.find(m => m._id === activeMsg._id);
                    if (updatedActive) setActiveMsg(updatedActive);
                }
            }
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleSendQuickMessage = async (e) => {
        if (e) e.preventDefault();
        if (!textInput.trim()) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/notices`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderId: user._id || user.id || user.rollNumber || user.name,
                    senderName: user.name,
                    senderRole: user.role,
                    type: 'message',
                    content: textInput,
                    recipientRoles: ['principal', 'vice_principal', 'hod', 'faculty', 'student'],
                    targetDepartment: 'All'
                })
            });
            if (res.ok) {
                setTextInput('');
                fetchMessages();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleBroadcast = async (e) => {
        e.preventDefault();
        const userId = user._id || user.id || user.rollNumber || user.name;

        const body = {
            senderId: userId,
            senderName: user.name,
            senderRole: user.role,
            type: broadcastType,
            title,
            content: broadcastType === 'poll' ? title : content,
            recipientRoles: recipients,
            targetDepartment: targetDept
        };

        if (broadcastType === 'poll') {
            body.pollData = {
                question: title,
                options: pollOptions.filter(o => o.trim()).map(o => ({ text: o, votes: [] }))
            };
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/notices`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (res.ok) {
                if (showToast) showToast('Sent successfully!');
                else alert('Sent successfully!');
                setIsComposing(false);
                setTitle('');
                setContent('');
                setPollOptions(['', '']);
                fetchMessages();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleVote = async (msgId, optIndex) => {
        const userId = user._id || user.id || user.rollNumber || user.name;
        try {
            const res = await fetch(`${API_BASE_URL}/api/notices/vote/${msgId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ optionIndex: optIndex, userId })
            });
            if (res.ok) {
                fetchMessages();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const toggleRecipient = (role) => {
        if (recipients.includes(role)) setRecipients(recipients.filter(r => r !== role));
        else setRecipients([...recipients, role]);
    };

    const addPollOption = () => setPollOptions([...pollOptions, '']);

    const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : '?';

    return (
        <div className="whatsapp-container" style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 400px) 1fr',
            height: 'calc(100vh - 140px)',
            background: '#f0f2f5',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
        }}>

            {/* LEFT: CONVERSATION LIST */}
            <div style={{ background: 'white', borderRight: '1px solid #d1d7db', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '10px 16px', background: '#f0f2f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {getInitials(user.name)}
                    </div>
                    <div style={{ display: 'flex', gap: '20px', color: '#54656f' }}>
                        <button title="Status" style={{ border: 'none', background: 'none', cursor: 'pointer' }}><svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12,20.664a9.163,9.163,0,0,1-6.521-2.702.461.461,0,0,1,0-.649l1.241-1.241a.461.461,0,0,1,.649,0A6.31,6.31,0,0,0,12,18a6,6,0,1,0-6-6,6.31,6.31,0,0,0,1.928,4.379.461.461,0,0,1,0,.649L6.687,18.269a.461.461,0,0,1-.649,0A9.163,9.163,0,0,1,3.336,12,8.664,8.664,0,1,1,12,20.664Z"></path></svg></button>
                        <button onClick={() => setIsComposing(true)} title="New Message/Broadcast" style={{ border: 'none', background: 'none', cursor: 'pointer' }}><svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M19.005,3.175H4.674C3.642,3.175,2.8,4.017,2.8,5.049V16.89c0,1.032,0.842,1.874,1.874,1.874h4.447l2.879,2.879l2.879-2.879h4.126c1.032,0,1.874-0.842,1.874-1.874V5.049C20.879,4.017,20.037,3.175,19.005,3.175z M16.03,11.391h-3.41v3.41h-1.241v-3.41h-3.41V10.15h3.41V6.74h1.241v3.41h3.41V11.391z"></path></svg></button>
                    </div>
                </div>

                <div style={{ padding: '7px 12px', borderBottom: '1px solid #e9edef' }}>
                    <div style={{ background: '#f0f2f5', borderRadius: '8px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <svg viewBox="0 0 24 24" width="24" height="24" style={{ color: '#54656f' }}><path fill="currentColor" d="M15.009,13.805h-0.636l-0.22-0.22c0.811-0.942,1.294-2.164,1.294-3.497c0-3.033-2.459-5.492-5.492-5.492c-3.033,0-5.492,2.459-5.492,5.492c0,3.033,2.459,5.492,5.492,5.492c1.334,0,2.556-0.483,3.497-1.294l0.22,0.22v0.636l4.025,4.016l1.2-1.2L15.009,13.805z M10.027,13.805c-2.14,0-3.874-1.734-3.874-3.874c0-2.14,1.734-3.874,3.874-3.874c2.14,0,3.874,1.734,3.874,3.874C13.901,12.071,12.167,13.805,10.027,13.805z"></path></svg>
                        <input type="text" placeholder="Search or start new chat" style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '0.9rem', outline: 'none' }} />
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {loading ? <div style={{ textAlign: 'center', padding: '2rem' }}>Loading conversations...</div> :
                        messages.length === 0 ? <div style={{ textAlign: 'center', padding: '2rem', color: '#667781' }}>No messages yet</div> :
                            messages.map(m => (
                                <div
                                    key={m._id}
                                    onClick={() => { setActiveMsg(m); setIsComposing(false); }}
                                    style={{
                                        display: 'flex',
                                        padding: '12px 16px',
                                        borderBottom: '1px solid #e9edef',
                                        cursor: 'pointer',
                                        background: activeMsg?._id === m._id ? '#f0f2f5' : 'white',
                                        transition: '0.2s'
                                    }}
                                >
                                    <div style={{ width: '49px', height: '49px', borderRadius: '50%', background: m.type === 'notice' ? '#ef4444' : m.type === 'poll' ? '#f59e0b' : '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', marginRight: '15px' }}>
                                        {m.type === 'notice' ? '📢' : m.type === 'poll' ? '📊' : getInitials(m.senderName)}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <span style={{ fontWeight: '600', color: '#111b21', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.title || m.senderName}</span>
                                            <span style={{ fontSize: '0.75rem', color: '#667781' }}>{new Date(m.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#667781', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {m.type === 'poll' ? `Poll: ${m.pollData?.question}` : m.content}
                                        </div>
                                    </div>
                                </div>
                            ))
                    }
                </div>
            </div>

            {/* RIGHT: CHAT / COMPOSE PANEL */}
            <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                {isComposing ? (
                    <div style={{ flex: 1, background: '#f0f2f5', padding: '20px', overflowY: 'auto' }}>
                        <div style={{ background: 'white', padding: '30px', borderRadius: '8px', maxWidth: '600px', margin: '0 auto', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <h2 style={{ marginBottom: '20px', color: '#41525d' }}>New Broadcast / Group Notice</h2>

                            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                                <button onClick={() => setBroadcastType('notice')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: broadcastType === 'notice' ? '#3b82f6' : 'white', color: broadcastType === 'notice' ? 'white' : '#64748b', cursor: 'pointer', fontWeight: 'bold' }}>📢 News/Notice</button>
                                <button onClick={() => setBroadcastType('poll')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: broadcastType === 'poll' ? '#f59e0b' : 'white', color: broadcastType === 'poll' ? 'white' : '#64748b', cursor: 'pointer', fontWeight: 'bold' }}>📊 Create Poll</button>
                            </div>

                            <form onSubmit={handleBroadcast}>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>{broadcastType === 'poll' ? 'Poll Question' : 'Notice Subject'}</label>
                                    <input required className="modern-input" style={{ width: '100%' }} value={title} onChange={e => setTitle(e.target.value)} placeholder={broadcastType === 'poll' ? "e.g. When should we have the extra class?" : "e.g. Holiday Announcement"} />
                                </div>

                                {broadcastType === 'notice' && (
                                    <div style={{ marginBottom: '15px' }}>
                                        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>Detailed Content</label>
                                        <textarea required className="modern-input" style={{ width: '100%', minHeight: '120px' }} value={content} onChange={e => setContent(e.target.value)} placeholder="Type the full details here..." />
                                    </div>
                                )}

                                {broadcastType === 'poll' && (
                                    <div style={{ marginBottom: '15px' }}>
                                        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>Options</label>
                                        {pollOptions.map((opt, i) => (
                                            <input key={i} className="modern-input" style={{ width: '100%', marginBottom: '8px' }} value={opt} onChange={e => {
                                                const newOpts = [...pollOptions];
                                                newOpts[i] = e.target.value;
                                                setPollOptions(newOpts);
                                            }} placeholder={`Option ${i + 1}`} />
                                        ))}
                                        <button type="button" onClick={addPollOption} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>+ Add Option</button>
                                    </div>
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>Department</label>
                                        <select className="modern-input" style={{ width: '100%' }} value={targetDept} onChange={e => setTargetDept(e.target.value)}>
                                            <option value="All">All Departments</option>
                                            <option value="CSE">CSE</option><option value="IT">IT</option><option value="ECE">ECE</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>Recipients</label>
                                        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                            {['student', 'faculty', 'hod'].map(r => (
                                                <div key={r} onClick={() => toggleRecipient(r)} style={{ cursor: 'pointer', fontSize: '0.7rem', textTransform: 'uppercase', padding: '4px 8px', borderRadius: '4px', border: '1px solid', background: recipients.includes(r) ? '#3b82f6' : 'white', color: recipients.includes(r) ? 'white' : '#64748b', borderColor: recipients.includes(r) ? '#3b82f6' : '#e2e8f0' }}>{r}</div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                    <button type="button" onClick={() => setIsComposing(false)} className="btn-action">Cancel</button>
                                    <button type="submit" className="btn-action primary" style={{ background: broadcastType === 'notice' ? '#3b82f6' : '#f59e0b' }}>Send Broadcast</button>
                                </div>
                            </form>
                        </div>
                    </div>
                ) : activeMsg ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {/* Chat Header */}
                        <div style={{ padding: '10px 16px', background: '#f0f2f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #d1d7db' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: activeMsg.type === 'notice' ? '#ef4444' : '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                    {activeMsg.type === 'notice' ? '📢' : getInitials(activeMsg.senderName)}
                                </div>
                                <div>
                                    <div style={{ fontWeight: '600', color: '#111b21' }}>{activeMsg.title || activeMsg.senderName}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#667781' }}>{activeMsg.senderRole} | {activeMsg.targetDepartment}</div>
                                </div>
                            </div>
                            <div style={{ color: '#54656f', display: 'flex', gap: '20px' }}>
                                <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M15.9,14.3H15L14.7,14c1-1.1,1.6-2.7,1.6-4.3c0-3.7-3-6.7-6.7-6.7S3,6,3,9.7s3,6.7,6.7,6.7c1.6,0,3.2-0.6,4.3-1.6l0.3,0.3v0.9l5.1,5.1l1.5-1.5L15.9,14.3z M9.7,14.3c-2.6,0-4.6-2.1-4.6-4.6s2.1-4.6,4.6-4.6s4.6,2.1,4.6,4.6S12.3,14.3,9.7,14.3z"></path></svg>
                                <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12,7c1.1,0,2-0.9,2-2s-0.9-2-2-2s-2,0.9-2,2S10.9,7,12,7z M12,10c-1.1,0-2,0.9-2,2s0.9,2,2,2s2-0.9,2-2S13.1,10,12,10z M12,17c-1.1,0-2,0.9-2,2s0.9,2,2,2s2-0.9,2-2S13.1,17,12,17z"></path></svg>
                            </div>
                        </div>

                        {/* Message History */}
                        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#efeae2', backgroundImage: 'radial-gradient(#d1d7db 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                            <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>

                                <div style={{
                                    maxWidth: '85%',
                                    padding: '8px 12px',
                                    background: 'white',
                                    borderRadius: '8px',
                                    boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)',
                                    alignSelf: 'flex-start',
                                    position: 'relative'
                                }}>
                                    {activeMsg.type === 'poll' ? (
                                        <div style={{ width: '100%' }}>
                                            <div style={{ fontWeight: '700', marginBottom: '15px', color: '#111b21', fontSize: '1rem' }}>📊 {activeMsg.pollData.question}</div>
                                            {activeMsg.pollData.options.map((opt, i) => {
                                                const totalVotes = activeMsg.pollData.options.reduce((sum, o) => sum + o.votes.length, 0);
                                                const percentage = totalVotes === 0 ? 0 : (opt.votes.length / totalVotes) * 100;
                                                const myUserId = user._id || user.id || user.rollNumber || user.name;
                                                const voted = opt.votes.includes(myUserId);

                                                return (
                                                    <div key={i} onClick={() => handleVote(activeMsg._id, i)} style={{
                                                        position: 'relative',
                                                        padding: '10px 15px',
                                                        marginBottom: '8px',
                                                        borderRadius: '30px',
                                                        border: `1px solid ${voted ? '#3b82f6' : '#e9edef'}`,
                                                        background: voted ? '#eff6ff' : 'white',
                                                        cursor: 'pointer',
                                                        overflow: 'hidden',
                                                        transition: '0.2s'
                                                    }}>
                                                        <div style={{
                                                            position: 'absolute', left: 0, top: 0, height: '100%',
                                                            width: `${percentage}%`,
                                                            background: voted ? '#dbeafe' : '#f0f2f5',
                                                            zIndex: 1,
                                                            transition: 'width 0.5s ease-out'
                                                        }} />
                                                        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                                            <span style={{ fontWeight: voted ? '700' : 'normal' }}>{opt.text}</span>
                                                            <span style={{ color: '#667781' }}>{opt.votes.length} ({Math.round(percentage)}%)</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            <div style={{ fontSize: '0.75rem', color: '#667781', textAlign: 'right', marginTop: '5px' }}>
                                                {activeMsg.pollData.options.reduce((s, o) => s + o.votes.length, 0)} votes • Select to vote
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {activeMsg.title && <div style={{ fontWeight: 'bold', color: activeMsg.type === 'notice' ? '#ef4444' : '#3b82f6', marginBottom: '4px' }}>{activeMsg.title}</div>}
                                            <div style={{ color: '#111b21', lineHeight: '1.4', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{activeMsg.content}</div>
                                        </>
                                    )}
                                    <div style={{ textAlign: 'right', fontSize: '0.65rem', color: '#667781', marginTop: '4px' }}>{new Date(activeMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                </div>

                                {/* Placeholder for more replies / conversations */}
                                <div style={{ textAlign: 'center', margin: '20px 0' }}>
                                    <span style={{ background: '#dcf8c6', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', color: '#41525d', boxShadow: '0 1px 0.5px rgba(0,0,0,0.1)' }}>Conversation started</span>
                                </div>
                            </div>
                        </div>

                        {/* Input Area */}
                        <div style={{ padding: '5px 10px', background: '#f0f2f5', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ position: 'relative' }}>
                                <button onClick={() => setShowAttachMenu(!showAttachMenu)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#54656f' }}>
                                    <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M11.5,4v11.5c0,1.93-1.57,3.5-3.5,3.5s-3.5-1.57-3.5-3.5v-10c0-1.1,0.9-2,2-2s2,0.9,2,2v9.5c0,0.28-0.22,0.5-0.5,0.5s-0.5-0.22-0.5-0.5V6H6v8.5c0,1.38,1.12,2.5,2.5,2.5s2.5-1.12,2.5-2.5V5.5c0-2.21-1.79-4-4-4s-4,1.79-4,4v10c0,2.76,2.24,5,5,5s5-2.24,5-5V4H11.5z"></path></svg>
                                </button>

                                {showAttachMenu && (
                                    <div style={{ position: 'absolute', bottom: '50px', left: '0', background: 'white', border: '1px solid #d1d7db', borderRadius: '16px', padding: '15px', display: 'flex', flexDirection: 'column', gap: '15px', boxShadow: '0 -2px 10px rgba(0,0,0,0.1)', zIndex: 100, minWidth: '180px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }}><span style={{ color: '#7f66ff' }}>📄</span> <span style={{ fontSize: '0.9rem' }}>Document</span></div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }}><span style={{ color: '#007bfc' }}>🖼️</span> <span style={{ fontSize: '0.9rem' }}>Photos & videos</span></div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }}><span style={{ color: '#ff2e74' }}>📷</span> <span style={{ fontSize: '0.9rem' }}>Camera</span></div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }}><span style={{ color: '#ff7a00' }}>🎙️</span> <span style={{ fontSize: '0.9rem' }}>Audio</span></div>
                                        <div onClick={() => { setIsComposing(true); setBroadcastType('poll'); setShowAttachMenu(false); }} style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }}><span style={{ color: '#ffbc38' }}>📊</span> <span style={{ fontSize: '0.9rem' }}>Poll</span></div>
                                    </div>
                                )}
                            </div>

                            <form onSubmit={handleSendQuickMessage} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input
                                    type="text"
                                    placeholder="Type a message"
                                    style={{ flex: 1, padding: '9px 12px', borderRadius: '8px', border: 'none', outline: 'none', fontSize: '0.95rem' }}
                                    value={textInput}
                                    onChange={e => setTextInput(e.target.value)}
                                />
                                <button type="submit" style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#54656f' }}>
                                    <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M1.101,21.757L23.8,12.028L1.101,2.3l0.011,7.912l13.623,1.816L1.112,13.845L1.101,21.757z"></path></svg>
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5', flexDirection: 'column', color: '#667781' }}>
                        <div style={{ width: '400px', textAlign: 'center' }}>
                            <img src="/jntugv-logo.png" alt="Logo" style={{ width: '100px', opacity: 0.1, filter: 'grayscale(100%)', marginBottom: '20px' }} />
                            <h2 style={{ fontWeight: '300', color: '#41525d' }}>JNTUGV Messaging</h2>
                            <p style={{ fontSize: '0.9rem' }}>Send and receive official notices, messages and polls.<br />Available on all your devices.</p>
                            <div style={{ marginTop: '40px', fontSize: '0.8rem', opacity: 0.5 }}>🔒 End-to-end secured on JNTUGV Servers</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunicationCenter;
