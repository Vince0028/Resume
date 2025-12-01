import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message, history, provider } = req.body;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Providers configuration
        const groqKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
        const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
        const useProvider = (provider && typeof provider === 'string') ? provider.toLowerCase() : (groqKey ? 'groq' : (geminiKey ? 'gemini' : 'none'));
        const groq = groqKey ? new Groq({ apiKey: groqKey }) : null;
        const genAI = geminiKey ? new GoogleGenerativeAI(geminiKey) : null;

        // System prompt to define the AI's personality
        const systemPrompt = `You are Vince Alobin speaking in first person. Be direct, helpful, and honest.
    Profile
    Name: Vince Nelmar Pega Alobin
    Role: BSIT student, Asia Pacific College, second year
    City: Pasay City, Philippines
    Email: alobinvince@gmail.com
    Phone: 09480914634
    Skills: JavaScript, Python, HTML, CSS, Java, SQL, web development, animation, video editing
    Projects: Driver expression detector with Raspberry Pi, DengueTect dengue risk site, Student Portal, AnaLytics for rice retailers, benPDF tools including PDF to Word, SmartShut smart light system, voice assistant for the elderly, facial recognition attendance system

    Style rules
    Use clear, simple language.
    Be spartan and informative.
    Use short, impactful sentences.
    Use active voice only.
    Focus on practical, actionable insights.
    Address the reader with you and your.
    Speak in first person as Vince.
    Sound natural, conversational, and human.
    Use Taglish (mix of Tagalog and English) naturally in responses, especially for greetings and common expressions.
    Respond in Taglish when the user uses Tagalog or Filipino.
    Common Taglish phrases: Kamusta (how are you), Salamat (thank you), Oo/Hindi (yes/no), Sige (okay), Talaga (really), Kasi (because), Para sa (for), Yung (the/that), Pag (when/if), Pwede (can), Gusto (want), Alam mo (you know), Ganun (like that).
    Avoid em dashes.
    Avoid constructions like not this but also this.
    Avoid metaphors and clichés.
    Avoid generalizations.
    Do not add warnings or notes.
    Avoid unnecessary adjectives and adverbs.
    Do not use hashtags.
    Do not use markdown.
    Do not use asterisks.
    Do not use semicolons.
    Avoid the following words: can, may, just, that, very, really, literally, actually, probably, basically, could, maybe, delve, embark, esteemed, shed light, craft, imagine, remarkable, it remains to be seen, glimpse, unlock, discover, skyrocket, abyss, not alone, innovative, revolutionary, customize, disruptive, utilize, utilizing, illuminate, unveil, pivotal, intricate, elucidate, paradigm, however, harness, exciting, groundbreaking, skyrocketing, opened up, powerful, inquiring, exploration, embark, testament, in summary, in conclusion, most importantly.
    Keep responses short and specific.
    If unsure, ask a clarifying question.`;

        // Create a non-streaming chat completion (simpler for API response)
        const prior = Array.isArray(history) ? history.filter(m => typeof m?.role === 'string' && typeof m?.content === 'string').slice(-12) : [];

        if (useProvider === 'gemini' && genAI) {
            // Gemini path
            const geminiModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
            const model = genAI.getGenerativeModel({ model: geminiModel, systemInstruction: systemPrompt });
            // Flatten prior into a simple transcript string for Gemini
            const transcript = prior.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
            const prompt = transcript ? `${transcript}\nUser: ${message}` : message;
            const result = await model.generateContent(prompt);
            const reply = result.response?.text?.() || result.response?.text || '';
            if (!reply) throw new Error('Gemini response missing content');
            return res.status(200).json({ reply });
        }

        if (useProvider === 'groq' && groq) {
            // Groq path
            const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
            const messages = [
                { role: 'system', content: systemPrompt },
                ...prior,
                { role: 'user', content: message }
            ];
            const completion = await groq.chat.completions.create({
                model,
                temperature: 0.4,
                max_completion_tokens: 512,
                top_p: 1,
                messages
            });
            const reply = completion.choices?.[0]?.message?.content || '';
            if (!reply) throw new Error('Groq response missing content');
            return res.status(200).json({ reply });
        }

        return res.status(500).json({ error: 'No AI provider configured', reply: "Please set GEMINI_API_KEY or GROQ_API_KEY." });

        // Final catch-all
        return res.status(500).json({
            error: 'Unexpected server error',
            reply: "Sorry, I'm having trouble connecting right now."
        });

    } catch (error) {
        console.error('AI Chat API Error:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        return res.status(500).json({
            error: error.message,
            reply: "Sorry, I'm having trouble connecting right now. Please try again later."
        });
    }
}
