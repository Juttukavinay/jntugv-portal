import { useState, useEffect, useCallback, useRef } from 'react';
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

    // Reference to track IDs of messages we've already seen - using Ref for consistent access in async functions
    const lastSeenMsgIdsRef = useRef(new Set());

    // Request Permission on component mount
    useEffect(() => {
        if ("Notification" in window && Notification.permission !== "granted") {
            Notification.requestPermission();
        }
    }, []);

    const showDesktopNotification = useCallback((msg) => {
        if ("Notification" in window && Notification.permission === "granted") {
            const userId = user._id || user.id || user.rollNumber || user.name;
            const senderId = msg.senderId;

            // Don't notify for our own messages
            if (senderId === userId) return;

            const n = new Notification(msg.title || msg.senderName || "New Message", {
                body: msg.content,
                icon: "/jntugv-logo.png",
                tag: msg._id,
                silent: false
            });

            n.onclick = () => {
                window.focus();
                setActiveMsg(msg);
                n.close();
            };
        }
    }, [user]);

    const fetchMessages = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/messages`);
            const data = await res.json();
            setMessages(data);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

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
        <div className="communication-center">
            <header>
                <h2>Communication Center</h2>
                <button onClick={fetchMessages}>Refresh</button>
            </header>
            <main>
                {loading ? (
                    <p>Loading messages...</p>
                ) : (
                    <ul>
                        {messages.map((msg) => (
                            <li key={msg.id} onClick={() => setActiveMsg(msg)}>
                                <h3>{msg.title}</h3>
                                <p>{msg.content}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </main>
        </div>
    );
};

export default CommunicationCenter;
