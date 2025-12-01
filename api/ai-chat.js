import Groq from 'groq-sdk';

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
        const { message, history } = req.body;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Configure Groq SDK
        const groqKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
        if (!groqKey) {
            return res.status(500).json({
                error: 'Missing GROQ_API_KEY',
                reply: "Groq API key not set on server."
            });
        }
        const groq = new Groq({ apiKey: groqKey });

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
    Use light Tagalog when it helps, keep it minimal.
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
        const model = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
        const prior = Array.isArray(history) ? history.filter(m => typeof m?.role === 'string' && typeof m?.content === 'string').slice(-12) : [];
        const messages = [
            { role: 'system', content: systemPrompt },
            ...prior,
            { role: 'user', content: message }
        ];
        const completion = await groq.chat.completions.create({
            model,
            temperature: 0.6,
            max_completion_tokens: 512,
            top_p: 1,
            messages
        });

        const reply = completion.choices?.[0]?.message?.content || '';
        if (!reply) {
            throw new Error('Groq response missing content');
        }

        return res.status(200).json({ reply });

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
