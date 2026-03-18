const express = require('express');
const router = express.Router();

// Store active SSE connections
const clients = new Map();

// SSE endpoint — clients connect here for real-time updates
router.get('/stream', (req, res) => {
    const userId = req.query.userId || 'anonymous';

    // Set SSE headers
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
    });

    // Send initial connection event
    res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Real-time channel active' })}\n\n`);

    // Keep-alive heartbeat every 30s
    const heartbeat = setInterval(() => {
        res.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`);
    }, 30000);

    // Register this client
    const clientId = `${userId}_${Date.now()}`;
    clients.set(clientId, { res, userId });

    console.log(`SSE client connected: ${clientId} (total: ${clients.size})`);

    // Client disconnected
    req.on('close', () => {
        clearInterval(heartbeat);
        clients.delete(clientId);
        console.log(`SSE client disconnected: ${clientId} (total: ${clients.size})`);
    });
});

// Broadcast to all connected clients
const broadcast = (eventData) => {
    const message = `data: ${JSON.stringify(eventData)}\n\n`;
    clients.forEach(({ res }, clientId) => {
        try {
            res.write(message);
        } catch (err) {
            clients.delete(clientId);
        }
    });
};

// Broadcast to specific user
const sendToUser = (userId, eventData) => {
    const message = `data: ${JSON.stringify(eventData)}\n\n`;
    clients.forEach(({ res, userId: uid }, clientId) => {
        if (uid === userId) {
            try {
                res.write(message);
            } catch (err) {
                clients.delete(clientId);
            }
        }
    });
};

// Broadcast to users with a specific role
const sendToRole = (role, eventData) => {
    // This would need role info stored with the client
    broadcast({ ...eventData, targetRole: role });
};

// API endpoint to trigger a notification (used internally)
router.post('/notify', (req, res) => {
    const { type, message, targetUserId, data } = req.body;
    
    const event = {
        type: type || 'notification',
        message,
        data,
        timestamp: Date.now()
    };

    if (targetUserId) {
        sendToUser(targetUserId, event);
    } else {
        broadcast(event);
    }

    res.json({ success: true, clientsNotified: clients.size });
});

// Get connection stats
router.get('/stats', (req, res) => {
    res.json({
        activeConnections: clients.size,
        clients: Array.from(clients.entries()).map(([id, { userId }]) => ({ id, userId }))
    });
});

module.exports = router;
module.exports.broadcast = broadcast;
module.exports.sendToUser = sendToUser;
module.exports.sendToRole = sendToRole;
