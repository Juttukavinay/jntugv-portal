import { useState, useEffect, useCallback } from 'react';
import API_BASE_URL from '../config';
import './CommunicationCenter.css';

// --- ICONS ---
const Icons = {
    Mail: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    Poll: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>,
    Notice: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h15s-3-2-3-9"/><path d="M2 8h3"/><path d="M19 8h3"/><path d="m5 3 3-1"/><path d="m19 3-3-1"/></svg>,
    Send: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
    Search: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    Clock: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    User: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    Pin: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/></svg>,
}

const CommunicationCenter = ({ user, showToast }) => {
    const [messages, setMessages] = useState([]);
    const [activeMsg, setActiveMsg] = useState(null);
    const [isComposing, setIsComposing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');

    // Broadcast Form states
    const [broadcastType, setBroadcastType] = useState('notice');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [recipients, setRecipients] = useState(['student', 'faculty', 'hod']);
    const [targetDept, setTargetDept] = useState('All');
    const [pollOptions, setPollOptions] = useState(['', '']);
    const [replyText, setReplyText] = useState('');

    const fetchMessages = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const userId = user._id || user.id || user.rollNumber || user.name;
            const res = await fetch(`${API_BASE_URL}/api/notices?role=${user.role}&department=${user.department || 'All'}&userId=${userId}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setMessages(data);
                if (!activeMsg && data.length > 0 && window.innerWidth > 900) {
                    setActiveMsg(data[0]);
                }
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
            if (showToast) showToast('Failed to sync messages', 'error');
        } finally {
            setLoading(false);
        }
    }, [user, activeMsg, showToast]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    const handleBroadcast = async (e) => {
        e.preventDefault();
        const userId = user._id || user.id || user.rollNumber || user.name;

        if (broadcastType === 'poll' && pollOptions.filter(o => o.trim()).length < 2) {
            if (showToast) showToast('Poll needs at least 2 options', 'error');
            return;
        }

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
                if (showToast) showToast('✅ Broadcast sent successfully!');
                setIsComposing(false);
                setTitle('');
                setContent('');
                setPollOptions(['', '']);
                fetchMessages();
            }
        } catch (error) {
            console.error(error);
            if (showToast) showToast('Failed to send broadcast', 'error');
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
                const updatedMsg = await res.json();
                setMessages(prev => prev.map(m => m._id === msgId ? updatedMsg : m));
                if (activeMsg?._id === msgId) setActiveMsg(updatedMsg);
                if (showToast) showToast('Vote recorded! 🗳️');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const filteredMessages = messages.filter(msg => {
        const matchesTab = activeTab === 'all' || msg.type === activeTab;
        const matchesSearch = (msg.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (msg.senderName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                             (msg.content || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const getRelativeTime = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
        if (diffInSeconds < 172800) return 'Yesterday';
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const getAvatarColor = (name) => {
        if (!name) return '#FF6B6B';
        const colors = ['#FF6B6B', '#8b5cf6', '#ec4899', '#f59e0b', '#00C9A7', '#06b6d4', '#3b82f6'];
        let hash = 0;
        for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    };

    const getTypeIcon = (type) => {
        if (type === 'poll') return '📊';
        if (type === 'notice') return '📢';
        return '💬';
    };

    const getTypeColor = (type) => {
        if (type === 'poll') return { bg: '#F5F3FF', text: '#7C3AED', border: '#EDE9FE' };
        if (type === 'notice') return { bg: '#FFFBEB', text: '#D97706', border: '#FEF3C7' };
        return { bg: '#EFF6FF', text: '#2563EB', border: '#DBEAFE' };
    };

    // Count by type
    const counts = {
        all: messages.length,
        notice: messages.filter(m => m.type === 'notice').length,
        poll: messages.filter(m => m.type === 'poll').length,
        message: messages.filter(m => m.type === 'message').length,
    };

    return (
        <div className="communication-center-container fade-in-up">
            {/* Sidebar List */}
            <aside className="comm-sidebar">
                <div className="comm-sidebar-header">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.15rem' }}>💬 Inbox</h3>
                            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>{messages.length} conversations</p>
                        </div>
                        {['admin', 'hod', 'principal', 'faculty'].includes(user?.role) && (
                            <button 
                                className="btn-action primary" 
                                style={{ 
                                    borderRadius: '12px', 
                                    width: '40px', 
                                    height: '40px', 
                                    padding: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 2px 8px rgba(255,107,107,0.3)'
                                }} 
                                onClick={() => setIsComposing(true)}
                                title="New Broadcast"
                            >
                                <Icons.Plus />
                            </button>
                        )}
                    </div>
                    <div className="comm-search-bar">
                        <Icons.Search />
                        <input 
                            type="text" 
                            placeholder="Search messages..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="comm-tabs">
                    {[
                        { key: 'all', label: 'All' },
                        { key: 'notice', label: '📢' },
                        { key: 'poll', label: '📊' },
                        { key: 'message', label: '💬' },
                    ].map(tab => (
                        <div 
                            key={tab.key} 
                            className={`comm-tab ${activeTab === tab.key ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.key)}
                            title={tab.key.charAt(0).toUpperCase() + tab.key.slice(1) + 's'}
                        >
                            {tab.label} {counts[tab.key] > 0 && <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>({counts[tab.key]})</span>}
                        </div>
                    ))}
                </div>

                <div className="message-list">
                    {loading && messages.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center' }}>
                            <div className="pulse-soft" style={{ fontSize: '1rem' }}>Syncing messages...</div>
                        </div>
                    ) : filteredMessages.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📭</div>
                            <p style={{ fontWeight: 600 }}>No {activeTab === 'all' ? '' : activeTab + ' '}messages yet</p>
                            <p style={{ fontSize: '0.8rem' }}>When you receive one, it'll appear here</p>
                        </div>
                    ) : (
                        filteredMessages.map((msg, idx) => (
                            <div 
                                key={msg._id} 
                                className={`message-item ${activeMsg?._id === msg._id ? 'active' : ''}`}
                                onClick={() => setActiveMsg(msg)}
                                style={{ animationDelay: `${idx * 0.03}s` }}
                            >
                                <div className="msg-avatar" style={{ background: getAvatarColor(msg.senderName) }}>
                                    {(msg.senderName || '?').charAt(0).toUpperCase()}
                                </div>
                                <div className="msg-info">
                                    <div className="msg-header">
                                        <span className="msg-sender">{msg.senderName}</span>
                                        <span className="msg-time">{getRelativeTime(msg.createdAt)}</span>
                                    </div>
                                    <div className="msg-subject">
                                        <span style={{ marginRight: '6px' }}>{getTypeIcon(msg.type)}</span>
                                        {msg.title}
                                    </div>
                                    <div className="msg-preview">{msg.content}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </aside>

            {/* Detail View */}
            <main className="comm-main">
                {activeMsg ? (
                    <>
                        <header className="comm-detail-header">
                            <div className="comm-detail-user">
                                <div className="msg-avatar" style={{ background: getAvatarColor(activeMsg.senderName), width: '44px', height: '44px', fontSize: '1rem' }}>
                                    {(activeMsg.senderName || '?').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{activeMsg.senderName}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                                        {(activeMsg.senderRole || 'User').toUpperCase()} • {getRelativeTime(activeMsg.createdAt)}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <span style={{
                                    ...(() => {
                                        const c = getTypeColor(activeMsg.type);
                                        return { background: c.bg, color: c.text, border: `1px solid ${c.border}` };
                                    })(),
                                    padding: '4px 14px',
                                    borderRadius: '99px',
                                    fontSize: '0.7rem',
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    {getTypeIcon(activeMsg.type)} {(activeMsg.type || 'notice').toUpperCase()}
                                </span>
                            </div>
                        </header>

                        <div className="comm-detail-content">
                            <h1 className="msg-full-title">{activeMsg.title}</h1>
                            
                            <div className="msg-meta-bar">
                                <div className="meta-item"><Icons.Clock /> {new Date(activeMsg.createdAt).toLocaleString()}</div>
                                <div className="meta-item"><Icons.User /> To: {(activeMsg.recipientRoles || []).map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(', ')}</div>
                                {activeMsg.targetDepartment && activeMsg.targetDepartment !== 'All' && (
                                    <div className="meta-item"><Icons.Pin /> Dept: {activeMsg.targetDepartment}</div>
                                )}
                            </div>

                            <div className="msg-body-text">
                                {(activeMsg.content || '').split('\n').map((line, i) => <p key={i}>{line}</p>)}
                            </div>

                            {activeMsg.type === 'poll' && activeMsg.pollData && (
                                <div className="poll-container">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>🗳️ {activeMsg.pollData.question}</h3>
                                        <span style={{ 
                                            fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600,
                                            background: 'white', padding: '4px 12px', borderRadius: '99px'
                                        }}>
                                            {activeMsg.pollData.options.reduce((acc, o) => acc + o.votes.length, 0)} total votes
                                        </span>
                                    </div>
                                    {activeMsg.pollData.options.map((opt, idx) => {
                                        const totalVotes = activeMsg.pollData.options.reduce((acc, o) => acc + o.votes.length, 0);
                                        const percentage = totalVotes === 0 ? 0 : Math.round((opt.votes.length / totalVotes) * 100);
                                        const userId = user?._id || user?.id || user?.rollNumber || user?.name;
                                        const hasVoted = opt.votes.includes(userId);
                                        const isWinning = opt.votes.length === Math.max(...activeMsg.pollData.options.map(o => o.votes.length)) && opt.votes.length > 0;

                                        return (
                                            <div key={idx} className="poll-option" onClick={() => handleVote(activeMsg._id, idx)}
                                                style={{ background: hasVoted ? '#FFF1F2' : 'transparent', borderColor: hasVoted ? 'rgba(255,107,107,0.2)' : 'transparent' }}
                                            >
                                                <div className="poll-option-label">
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        {isWinning && <span style={{ fontSize: '0.9rem' }}>🏆</span>}
                                                        {opt.text}
                                                        {hasVoted && <span className="poll-voted-badge">✓ Your Vote</span>}
                                                    </span>
                                                    <span style={{ color: '#64748b' }}>{percentage}% <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>({opt.votes.length})</span></span>
                                                </div>
                                                <div className="poll-progress-bg">
                                                    <div className="poll-progress-fill" style={{ width: `${percentage}%` }}></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Quick Reply */}
                            {['admin', 'hod', 'principal', 'faculty'].includes(user?.role) && (
                                <div style={{ 
                                    marginTop: '2rem', padding: '1.25rem', 
                                    background: '#f8fafc', borderRadius: '16px', 
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Quick Reply</p>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <input 
                                            type="text"
                                            className="modern-input"
                                            style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '12px', border: '1.5px solid #e2e8f0' }}
                                            placeholder="Type a reply..."
                                            value={replyText}
                                            onChange={e => setReplyText(e.target.value)}
                                        />
                                        <button 
                                            className="btn-action primary"
                                            style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                                            onClick={() => {
                                                if (replyText.trim()) {
                                                    if (showToast) showToast('Reply feature coming soon!');
                                                    setReplyText('');
                                                }
                                            }}
                                        >
                                            <Icons.Send /> Send
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="empty-state">
                        <div style={{ fontSize: '5rem', opacity: 0.08 }}>📬</div>
                        <h2>Select a message to read</h2>
                        <p style={{ fontSize: '0.9rem', maxWidth: '300px' }}>Click on a notice, poll, or message from the list on the left to view its details.</p>
                    </div>
                )}
            </main>

            {/* Composer Modal */}
            {isComposing && (
                <div className="composer-overlay" onClick={() => setIsComposing(false)}>
                    <div className="composer-card" onClick={e => e.stopPropagation()}>
                        <div className="composer-header">
                            <h3 style={{ margin: 0, fontWeight: 800 }}>🚀 New Broadcast</h3>
                            <button style={{ border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }} onClick={() => setIsComposing(false)}>×</button>
                        </div>
                        <form onSubmit={handleBroadcast}>
                            <div className="composer-body">
                                <div className="type-selector">
                                    {[
                                        { key: 'notice', icon: '📢', label: 'Notice' },
                                        { key: 'poll', icon: '📊', label: 'Poll' },
                                        { key: 'message', icon: '💬', label: 'Message' }
                                    ].map(t => (
                                        <button key={t.key} type="button" className={`type-btn ${broadcastType === t.key ? 'active' : ''}`} onClick={() => setBroadcastType(t.key)}>
                                            <span style={{ fontSize: '1.5rem' }}>{t.icon}</span>
                                            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{t.label}</div>
                                        </button>
                                    ))}
                                </div>

                                <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                                    <label className="input-label" style={{ fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Title / Question</label>
                                    <input 
                                        className="modern-input" 
                                        style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '0.95rem' }}
                                        placeholder={broadcastType === 'poll' ? "What is your question?" : "Announcement Title"} 
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        required
                                    />
                                </div>

                                {broadcastType !== 'poll' && (
                                    <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                                        <label className="input-label" style={{ fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Content</label>
                                        <textarea 
                                            className="modern-input" 
                                            style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '0.95rem', resize: 'vertical' }}
                                            rows="4" 
                                            placeholder="Write your message here..." 
                                            value={content}
                                            onChange={e => setContent(e.target.value)}
                                            required
                                        />
                                    </div>
                                )}

                                {broadcastType === 'poll' && (
                                    <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                                        <label className="input-label" style={{ fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Options</label>
                                        {pollOptions.map((opt, idx) => (
                                            <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                <input 
                                                    className="modern-input" 
                                                    style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', border: '1.5px solid #e2e8f0' }}
                                                    placeholder={`Option ${idx + 1}`} 
                                                    value={opt}
                                                    onChange={e => {
                                                        const newOpts = [...pollOptions];
                                                        newOpts[idx] = e.target.value;
                                                        setPollOptions(newOpts);
                                                    }}
                                                    required={idx < 2}
                                                />
                                                {idx >= 2 && (
                                                    <button type="button" onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))}
                                                        style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '10px', width: '40px', cursor: 'pointer', fontWeight: 700, fontSize: '1.1rem' }}
                                                    >×</button>
                                                )}
                                            </div>
                                        ))}
                                        <button type="button" className="btn-action" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }} onClick={() => setPollOptions([...pollOptions, ''])}>+ Add Option</button>
                                    </div>
                                )}

                                <div className="input-group">
                                    <label className="input-label" style={{ fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Send To</label>
                                    <div className="recipient-chips">
                                        {['student', 'faculty', 'hod', 'principal', 'admin'].map(role => (
                                            <div 
                                                key={role} 
                                                className={`chip ${recipients.includes(role) ? 'active' : ''}`}
                                                onClick={() => {
                                                    if (recipients.includes(role)) setRecipients(recipients.filter(r => r !== role));
                                                    else setRecipients([...recipients, role]);
                                                }}
                                            >
                                                {role === 'student' ? '🎓' : role === 'faculty' ? '👨‍🏫' : role === 'hod' ? '👔' : role === 'principal' ? '🏛️' : '⚙️'} {role.charAt(0).toUpperCase() + role.slice(1)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="composer-footer">
                                <button type="button" onClick={() => setIsComposing(false)}
                                    style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: 600 }}
                                >Cancel</button>
                                <button type="submit"
                                    style={{ 
                                        padding: '0.75rem 2rem', borderRadius: '12px', 
                                        background: 'var(--primary, #FF6B6B)', color: 'white', 
                                        border: 'none', fontWeight: 700, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        boxShadow: '0 4px 12px rgba(255,107,107,0.3)'
                                    }}
                                >
                                    <Icons.Send /> Send Broadcast
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunicationCenter;
