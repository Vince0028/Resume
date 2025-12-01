import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import chatHandler from '../api/chat.js';
import authHandler from '../api/auth.js';
import aiChatHandler from '../api/ai-chat.js';

const app = express();
const port = 3001; 

app.use(cors());
app.use(express.json());


app.all('/api/chat', async (req, res) => {
    
    
    await chatHandler(req, res);
});

app.all('/api/auth', async (req, res) => {
    await authHandler(req, res);
});

app.all('/api/ai-chat', async (req, res) => {
    await aiChatHandler(req, res);
});

app.listen(port, () => {
    console.log(`Local API server running at http://localhost:${port}`);
});
