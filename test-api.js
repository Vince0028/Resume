import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const GROQ_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = process.env.GROQ_API_URL;
const GROQ_ENDPOINT = GROQ_URL || 'https://api.groq.ai/v1';
const GEMINI_KEY = process.env.GEMINI_API_KEY;

async function testGROQ() {
    if (!GROQ_KEY) return false;
    try {
        console.log('\n🧪 Testing GROQ provider...\n');
        const resp = await fetch(GROQ_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_KEY}`
            },
            body: JSON.stringify({ model: 'groq-1', input: 'Say hello in one sentence' })
        });
        const data = await resp.json();
        console.log('✅ GROQ Response:', data.reply || data.output || data);
        return true;
    } catch (err) {
        console.error('❌ GROQ test failed:', err.message || err);
        return false;
    }
}

async function testGemini() {
    if (!GEMINI_KEY) return false;
    try {
        console.log('\n🧪 Testing Gemini API connection...\n');
        const genAI = new GoogleGenerativeAI(GEMINI_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent('Say hello in one sentence');
        const response = result.response.text();
        console.log('✅ Gemini Response:', response);
        return true;
    } catch (error) {
        console.error('❌ Gemini test failed:', error.message || error);
        return false;
    }
}

async function runTests() {
    if (await testGROQ()) return;
    if (await testGemini()) return;
    console.error('❌ No working AI provider found. Set GROQ_API_KEY+GROQ_API_URL or GEMINI_API_KEY.');
    process.exit(1);
}

runTests();
