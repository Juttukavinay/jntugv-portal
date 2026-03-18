import { useState, useEffect, useCallback } from 'react';
import '../index.css';

let toastCount = 0;
let addToastFunc = null;

// The component that renders the toasts
export const ToastContainer = () => {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        // Register the global function
        addToastFunc = (message, type = 'info', duration = 3000) => {
            const id = ++toastCount;
            const newToast = { id, message, type, duration, exiting: false };
            setToasts(prev => [...prev, newToast]);

            setTimeout(() => {
                removeToast(id);
            }, duration);
        };

        return () => {
            addToastFunc = null;
        };
    }, []);

    const removeToast = useCallback((id) => {
        // Trigger exit animation
        setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
        
        // Remove from DOM after animation completes
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 300);
    }, []);

    const getIcon = (type) => {
        switch(type) {
            case 'success': return <span style={{ background: '#dcfce7', color: '#16a34a' }} className="toast-icon">✓</span>;
            case 'error': return <span style={{ background: '#fee2e2', color: '#ef4444' }} className="toast-icon">!</span>;
            case 'warning': return <span style={{ background: '#fef3c7', color: '#d97706' }} className="toast-icon">⚠</span>;
            default: return <span style={{ background: '#dbeafe', color: '#2563eb' }} className="toast-icon">i</span>;
        }
    };

    if (toasts.length === 0) return null;

    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <div key={toast.id} className={`toast-item ${toast.type} ${toast.exiting ? 'exiting' : ''}`}>
                    {getIcon(toast.type)}
                    <span style={{ flex: 1 }}>{toast.message}</span>
                    <button 
                        onClick={() => removeToast(toast.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1.2rem', padding: '0 4px' }}
                    >×</button>
                    <div className="toast-progress" style={{ animationDuration: `${toast.duration}ms` }} />
                </div>
            ))}
        </div>
    );
};

// Global helper to trigger a toast from anywhere
export const showToast = (message, type = 'info', duration = 3000) => {
    if (addToastFunc) {
        addToastFunc(message, type, duration);
    }
};
