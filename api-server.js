import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import chatHandler from './api/chat.js';

const app = express();
const port = 3001; // Run API on port 3001

app.use(cors());
app.use(express.json());

// Mock Vercel Request/Response objects for the handler
app.all('/api/chat', async (req, res) => {
    // Add helper methods that Vercel provides but Express might not have exactly the same
    // But our handler uses standard res.status().json() which Express supports
    await chatHandler(req, res);
});

app.listen(port, () => {
    console.log(`Local API server running at http://localhost:${port}`);
});
