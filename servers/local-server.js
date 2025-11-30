const http = require('http');
const fs = require('fs');
const path = require('path');
const { handler } = require('./netlify/functions/chat');

// Load .env
try {
    const envPath = path.resolve(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) process.env[key.trim()] = value.trim();
        });
    }
} catch (e) { console.error("Error loading .env", e); }

const PORT = 8080;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
};

const server = http.createServer(async (req, res) => {
    console.log(`${req.method} ${req.url}`);

    // Handle Netlify Function Proxy
    if (req.url === '/.netlify/functions/chat' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', async () => {
            try {
                // Mock Netlify Event
                const event = {
                    httpMethod: 'POST',
                    body: body
                };

                const result = await handler(event, {});

                res.writeHead(result.statusCode, { 'Content-Type': 'application/json' });
                res.end(result.body);
            } catch (err) {
                console.error("Function error:", err);
                res.writeHead(500);
                res.end(JSON.stringify({ error: "Internal Server Error" }));
            }
        });
        return;
    }

    // Serve Static Files
    let filePath = '.' + req.url;
    if (filePath === './') filePath = './index.html';
    // Handle /terminal redirect logic roughly
    if (filePath === './terminal/') filePath = './terminal/index.html';

    const extname = path.extname(filePath);
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404);
                res.end('404 Not Found');
            } else {
                res.writeHead(500);
                res.end('500 Internal Server Error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Chat endpoint ready at http://localhost:${PORT}/.netlify/functions/chat`);
});
