// Simple in-memory cache middleware
// Caches GET responses for frequently requested data
const cache = new Map();
const DEFAULT_TTL = 60; // 60 seconds

const cacheMiddleware = (ttlSeconds = DEFAULT_TTL) => {
    return (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        const key = `__cache__${req.originalUrl || req.url}`;
        const cached = cache.get(key);

        if (cached && Date.now() - cached.timestamp < ttlSeconds * 1000) {
            // Return cached response
            res.set('X-Cache', 'HIT');
            return res.json(cached.data);
        }

        // Override res.json to intercept and cache the response
        const originalJson = res.json.bind(res);
        res.json = (data) => {
            cache.set(key, { data, timestamp: Date.now() });
            res.set('X-Cache', 'MISS');
            return originalJson(data);
        };

        next();
    };
};

// Invalidate cache for a specific pattern
const invalidateCache = (pattern) => {
    for (const key of cache.keys()) {
        if (key.includes(pattern)) {
            cache.delete(key);
        }
    }
};

// Clear all cache
const clearCache = () => {
    cache.clear();
};

module.exports = { cacheMiddleware, invalidateCache, clearCache };
