import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in environment');
    process.exit(1);
}

console.log('✅ API Key found:', apiKey.substring(0, 10) + '...');

async function testAPI() {
    try {
        console.log('\n🧪 Testing Gemini API connection...\n');

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const result = await model.generateContent('Say hello in one sentence');
        const response = result.response.text();

        console.log('✅ API Response:', response);
        console.log('\n✅ SUCCESS! Your API key is working correctly!\n');
    } catch (error) {
        console.error('❌ API Error:', error.message);
        console.error('\nFull error:', error);
        process.exit(1);
    }
}

testAPI();
