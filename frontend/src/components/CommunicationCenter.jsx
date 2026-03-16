import { useState, useEffect, useCallback, useRef } from 'react';
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
}

const CommunicationCenter = ({ user, showToast }) => {
    const [messages, setMessages] = useState([]);
    const [activeMsg, setActiveMsg] = useState(null);
    const [isComposing, setIsComposing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // all, notice, poll, message

    // Broadcast Form states
    const [broadcastType, setBroadcastType] = useState('notice');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [recipients, setRecipients] = useState(['student', 'faculty', 'hod']);
    const [targetDept, setTargetDept] = useState('All');
    const [pollOptions, setPollOptions] = useState(['', '']);

    const fetchMessages = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const userId = user._id || user.id || user.rollNumber || user.name;
            const res = await fetch(`${API_BASE_URL}/api/notices?role=${user.role}&department=${user.department || 'All'}&userId=${userId}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setMessages(data);
                // Auto select first message if none active and screen is wide
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
                if (showToast) showToast('Broadcasted successfully!');
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
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const getAvatarColor = (name) => {
        if (!name) return '#3b82f6';
        const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];
        let hash = 0;
        for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    };

    return (
        <div className="communication-center-container fade-in-up">
            {/* Sidebar List */}
            <aside className="comm-sidebar">
                <div className="comm-sidebar-header">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontWeight: 800 }}>Inbox</h3>
                        {['admin', 'hod', 'principal', 'faculty'].includes(user?.role) && (
                            <button className="btn-action primary" style={{ borderRadius: '50%', width: '36px', height: '36px', padding: 0 }} onClick={() => setIsComposing(true)}>
                                <Icons.Plus />
                            </button>
                        )}
                    </div>
                    <div className="comm-search-bar">
                        <Icons.Search />
                        <input 
                            type="text" 
                            placeholder="Search notices..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="comm-tabs">
                    {['all', 'notice', 'poll', 'message'].map(tab => (
                        <div 
                            key={tab} 
                            className={`comm-tab ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}s
                        </div>
                    ))}
                </div>

                <div className="message-list">
                    {loading && messages.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}><div className="pulse-soft">Syncing...</div></div>
                    ) : filteredMessages.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📭</div>
                            <p>No {activeTab}s found</p>
                        </div>
                    ) : (
                        filteredMessages.map(msg => (
                            <div 
                                key={msg._id} 
                                className={`message-item ${activeMsg?._id === msg._id ? 'active' : ''}`}
                                onClick={() => setActiveMsg(msg)}
                            >
                                <div className="msg-avatar" style={{ background: getAvatarColor(msg.senderName) }}>
                                    {(msg.senderName || '?').charAt(0)}
                                </div>
                                <div className="msg-info">
                                    <div className="msg-header">
                                        <span className="msg-sender">{msg.senderName}</span>
                                        <span className="msg-time">{getRelativeTime(msg.createdAt)}</span>
                                    </div>
                                    <div className="msg-subject">{msg.title}</div>
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
                                <div className="msg-avatar" style={{ background: getAvatarColor(activeMsg.senderName), width: '40px', height: '40px' }}>
                                    {(activeMsg.senderName || '?').charAt(0)}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{activeMsg.senderName}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{(activeMsg.senderRole || 'User').toUpperCase()}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <span className={`badge-role ${activeMsg.type}`} style={{ 
                                    background: activeMsg.type === 'poll' ? '#f5f3ff' : activeMsg.type === 'notice' ? '#fffbeb' : '#eff6ff',
                                    color: activeMsg.type === 'poll' ? '#7c3aed' : activeMsg.type === 'notice' ? '#d97706' : '#2563eb',
                                    padding: '4px 12px',
                                    borderRadius: '99px',
                                    fontSize: '0.75rem',
                                    fontWeight: '700'
                                }}>
                                    {(activeMsg.type || 'notice').toUpperCase()}
                                </span>
                            </div>
                        </header>

                        <div className="comm-detail-content">
                            <h1 className="msg-full-title">{activeMsg.title}</h1>
                            
                            <div className="msg-meta-bar">
                                <div className="meta-item"><Icons.Clock /> {new Date(activeMsg.createdAt).toLocaleString()}</div>
                                <div className="meta-item"><Icons.User /> Recipients: {activeMsg.recipientRoles?.length || 0} Roles</div>
                            </div>

                            <div className="msg-body-text">
                                {(activeMsg.content || '').split('\n').map((line, i) => <p key={i}>{line}</p>)}
                            </div>

                            {activeMsg.type === 'poll' && activeMsg.pollData && (
                                <div className="poll-container">
                                    <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>{activeMsg.pollData.question}</h3>
                                    {activeMsg.pollData.options.map((opt, idx) => {
                                        const totalVotes = activeMsg.pollData.options.reduce((acc, o) => acc + o.votes.length, 0);
                                        const percentage = totalVotes === 0 ? 0 : Math.round((opt.votes.length / totalVotes) * 100);
                                        const userId = user?._id || user?.id || user?.rollNumber || user?.name;
                                        const hasVoted = opt.votes.includes(userId);

                                        return (
                                            <div key={idx} className="poll-option" onClick={() => handleVote(activeMsg._id, idx)}>
                                                <div className="poll-option-label">
                                                    <span>{opt.text} {hasVoted && <span className="poll-voted-badge">Your Vote</span>}</span>
                                                    <span>{percentage}% ({opt.votes.length})</span>
                                                </div>
                                                <div className="poll-progress-bg">
                                                    <div className="poll-progress-fill" style={{ width: `${percentage}%` }}></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '1rem' }}>Total Votes: {activeMsg.pollData.options.reduce((acc, o) => acc + o.votes.length, 0)}</p>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="empty-state">
                        <div style={{ fontSize: '5rem', opacity: 0.1 }}>📬</div>
                        <h2>Select an item to read</h2>
                        <p>Click on a notice or message from the list on the left.</p>
                    </div>
                )}
            </main>

            {/* Composer Modal */}
            {isComposing && (
                <div className="composer-overlay" onClick={() => setIsComposing(false)}>
                    <div className="composer-card" onClick={e => e.stopPropagation()}>
                        <div className="composer-header">
                            <h3 style={{ margin: 0 }}>Create New Broadcast</h3>
                            <button className="btn-action" style={{ border: 'none', background: 'none', fontSize: '1.5rem' }} onClick={() => setIsComposing(false)}>×</button>
                        </div>
                        <form onSubmit={handleBroadcast}>
                            <div className="composer-body">
                                <div className="type-selector">
                                    <button type="button" className={`type-btn ${broadcastType === 'notice' ? 'active' : ''}`} onClick={() => setBroadcastType('notice')}>
                                        <Icons.Notice /> <div>Notice</div>
                                    </button>
                                    <button type="button" className={`type-btn ${broadcastType === 'poll' ? 'active' : ''}`} onClick={() => setBroadcastType('poll')}>
                                        <Icons.Poll /> <div>Poll</div>
                                    </button>
                                    <button type="button" className={`type-btn ${broadcastType === 'message' ? 'active' : ''}`} onClick={() => setBroadcastType('message')}>
                                        <Icons.Mail /> <div>Message</div>
                                    </button>
                                </div>

                                <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                                    <label className="input-label" style={{ fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Title / Question</label>
                                    <input 
                                        className="modern-input" 
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}
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
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                                            rows="4" 
                                            placeholder="Message details..." 
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
                                            <input 
                                                key={idx}
                                                className="modern-input" 
                                                style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '0.5rem' }}
                                                placeholder={`Option ${idx + 1}`} 
                                                value={opt}
                                                onChange={e => {
                                                    const newOpts = [...pollOptions];
                                                    newOpts[idx] = e.target.value;
                                                    setPollOptions(newOpts);
                                                }}
                                                required={idx < 2}
                                            />
                                        ))}
                                        <button type="button" className="btn-action" style={{ fontSize: '0.8rem' }} onClick={() => setPollOptions([...pollOptions, ''])}>+ Add Option</button>
                                    </div>
                                )}

                                <div className="input-group">
                                    <label className="input-label" style={{ fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Recipient Roles</label>
                                    <div className="recipient-chips">
                                        {['student', 'faculty', 'hod', 'principal'].map(role => (
                                            <div 
                                                key={role} 
                                                className={`chip ${recipients.includes(role) ? 'active' : ''}`}
                                                style={{
                                                    padding: '6px 16px',
                                                    borderRadius: '20px',
                                                    cursor: 'pointer',
                                                    background: recipients.includes(role) ? '#3b82f6' : '#f1f5f9',
                                                    color: recipients.includes(role) ? 'white' : '#64748b',
                                                    fontWeight: '600',
                                                    fontSize: '0.85rem'
                                                }}
                                                onClick={() => {
                                                    if (recipients.includes(role)) setRecipients(recipients.filter(r => r !== role));
                                                    else setRecipients([...recipients, role]);
                                                }}
                                            >
                                                {role.charAt(0).toUpperCase() + role.slice(1)}s
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="composer-footer">
                                <button type="button" className="btn-action" style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white' }} onClick={() => setIsComposing(false)}>Cancel</button>
                                <button type="submit" className="btn-action primary" style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', background: '#3b82f6', color: 'white', border: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
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
