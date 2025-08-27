const http = require('http');
const xkcd = require('xkcd-imgs');

const PORT = process.env.PORT || 3000;
const HOST = '127.0.0.1';

// CORS headers configuration
const setCorsHeaders = () => ({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, PUT, DELETE, OPTIONS',
    'Access-Control-Max-Age': '86400', // 24 hours
    'Access-Control-Allow-Headers': 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Authorization, Accept'
});

// Handle preflight OPTIONS requests
const handlePreflight = (res) => {
    res.writeHead(204, setCorsHeaders());
    res.end();
};

// Handle XKCD image requests
const handleXkcdRequest = (res) => {
    const headers = setCorsHeaders();
    
    xkcd.img((err, data) => {
        if (err) {
            res.writeHead(500, headers);
            res.end(JSON.stringify({ 
                success: false, 
                error: err.message || 'Failed to fetch XKCD image' 
            }));
            return;
        }
        
        res.writeHead(200, headers);
        res.end(JSON.stringify({ 
            success: true, 
            data 
        }));
    });
};

// Create HTTP server
const server = http.createServer((req, res) => {
    // Handle OPTIONS preflight
    if (req.method === 'OPTIONS') {
        return handlePreflight(res);
    }
    
    // Handle actual requests
    handleXkcdRequest(res);
});

// Start server
server.listen(PORT, () => {
    console.log(`🚀 Server running at http://${HOST}:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

// Handle errors
server.on('error', (error) => {
    console.error('Server error:', error);
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
        process.exit(1);
    }
});

module.exports = server;
