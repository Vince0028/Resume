const http = require('http');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const PORT = 8080;
const API_KEY = process.env.GEMINI_API_KEY;
const GROQ_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = process.env.GROQ_API_URL;
const GROQ_ENDPOINT = GROQ_URL || 'https://api.groq.ai/v1';

const MIMES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
    console.log(`${req.method} ${req.url}`);

    
    if (req.url === '/api/chat' && req.method === 'POST') {
        if (!API_KEY && !(GROQ_KEY && GROQ_URL)) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'API Key not configured for any provider' }));
            return;
        }

        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { message } = JSON.parse(body);

                
                const systemPrompt = `You are an AI assistant for Vince Nelmar Alobin's portfolio website. 
        Your role is to answer questions about Vince based on his resume and portfolio content. 
        Be professional, friendly, and concise. 
        If asked about something not in the portfolio, politely say you don't have that information.
        
        Context about Vince:
        - IT Student at Asia Pacific College (BSIT, 2nd Year).
        - Skills: Web Dev (HTML, CSS, JS, Python, SQL), Computer Animation, Video Editing.
        - Projects: Driver Expression Detector, DengueTect, Student-Portal, AnaLytics, benPDF, SmartShut, vahdecs, VeriFace.
        - Contact: alobinvince@gmail.com, 09480914634.
        `;

                let reply = "I couldn't generate a response.";

                if (GROQ_KEY) {
                    try {
                        const groqResp = await fetch(GROQ_ENDPOINT, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${GROQ_KEY}`
                            },
                            body: JSON.stringify({ model: 'groq-1', input: systemPrompt + "\n\nUser: " + message })
                        });

                        const groqData = await groqResp.json();
                        reply = groqData.reply || groqData.output?.[0]?.content || groqData.output?.text || groqData.output || groqData.result || (groqData.choices && groqData.choices[0] && (groqData.choices[0].message?.content || groqData.choices[0].text)) || reply;
                    } catch (err) {
                        console.error('GROQ API error:', err);
                    }
                }

                // If reply still default and Gemini is configured, try Gemini as fallback
                if ((reply === "I couldn't generate a response.") && API_KEY) {
                    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{
                                role: "user",
                                parts: [{ text: systemPrompt + "\n\nUser Question: " + message }]
                            }]
                        })
                    });

                    const data = await response.json();

                    if (data.error) {
                        console.error('Gemini API Error:', data.error);
                        throw new Error(data.error.message);
                    }

                    reply = data.candidates?.[0]?.content?.parts?.[0]?.text || reply;
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ reply }));
            } catch (err) {
                console.error('Server API Error:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal Server Error', details: err.message }));
            }
        });
        return;
    }

    
    let filePath = '.' + req.url;
    if (filePath === './') filePath = './index.html';

    
    const queryIndex = filePath.indexOf('?');
    if (queryIndex !== -1) {
        filePath = filePath.substring(0, queryIndex);
    }

    const ext = path.extname(filePath);
    const contentType = MIMES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('404 Not Found');
            } else {
                res.writeHead(500);
                res.end('500 Internal Server Error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`🔑 API Key configured: ${API_KEY ? 'Yes' : 'No'}`);
});
