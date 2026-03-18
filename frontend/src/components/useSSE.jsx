import { useEffect, useState } from 'react';
import API_BASE_URL from '../config';
import { showToast } from './ToastContainer';

const useSSE = (user) => {
    const [lastEvent, setLastEvent] = useState(null);

    useEffect(() => {
        if (!user) return;

        const userId = user._id || user.id || user.rollNumber || user.name || 'anonymous';
        const eventSource = new EventSource(`${API_BASE_URL}/api/sse/stream?userId=${userId}`);

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'heartbeat') return; // Ignore heartbeats
                
                setLastEvent(data);
                
                // Automatically show toast for certain real-time events
                if (data.type === 'new_notice') {
                    showToast(`🔔 ${data.message}`, 'info', 5000);
                } else if (data.type === 'poll_vote') {
                    // Optional: show subtle toast or just rely on state update
                    // showToast('A new vote was cast!', 'success', 2000);
                }
            } catch (err) {
                console.error("Failed to parse SSE event:", err);
            }
        };

        eventSource.onerror = (error) => {
            console.error("SSE Connection Error:", error);
            eventSource.close();
            // Optional: implement reconnect logic
        };

        return () => {
            eventSource.close();
        };
    }, [user]);

    return lastEvent;
};

export default useSSE;
