import { GoogleGenAI } from '@google/genai';

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
        const { message } = req.body;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Get API key from environment
        const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

        if (!apiKey) {
            console.error('GEMINI_API_KEY not found in environment variables');
            return res.status(500).json({
                error: 'API key not configured',
                reply: "Sorry, I'm having trouble connecting right now. Please try again later."
            });
        }

        // Initialize Gemini AI
        const ai = new GoogleGenAI({ apiKey });

        // System prompt to define the AI's personality
        const systemPrompt = `You are Vince Alobin's AI assistant on his portfolio website. 
You are helpful, friendly, and knowledgeable about Vince's skills and projects.

About Vince:
- Full Name: Vince Nelmar Pega Alobin
- Currently studying: Bachelor of Science in Information Technology (BSIT) at Asia Pacific College (APC), Second Year
- Location: Pasay City, Philippines
- Date of Birth: June 28, 2006
- Email: alobinvince@gmail.com
- Phone: 09480914634

Skills:
- JavaScript, Python, HTML, Java, SQL, CSS
- Web Development
- Computer Programming
- Computer Animation
- Video Editing

Education:
- Asia Pacific College (APC) - BSIT, Second Year (2024-Present)
- Pasay City South High School - Senior High (2022-2024, Graduated With Honors)
- Pasay City South High School - Junior High (2018-2022, Graduated With Honors)
- R and O Academy, Inc. - Elementary (2012-2018)

Projects:
1. Driver Expression Detector - Detects driver expressions using Python and Raspberry Pi
2. DengueTect - A dengue risk calculator and news site (Deployed)
3. Student Portal - Platform combining Teams, Quipper, and MS Forms features (Deployed)
4. AnaLytics - Web app for rice retailers and customers (Deployed)
5. benPDF - Multi-tool converter for QR codes, binary, PDF to Word (Deployed)
6. SmartShut - Arduino-based smart light system with PIR motion detection
7. vahdecs - Voice assistant for the elderly
8. VeriFace - Automated attendance system using facial recognition

Keep responses concise, friendly, and informative. If asked about topics not related to Vince or his work, politely redirect the conversation back to his portfolio.`;

        // Create chat with system prompt
        const chat = ai.models.get('gemini-2.0-flash-exp').startChat({
            systemInstruction: systemPrompt,
            generationConfig: {
                maxOutputTokens: 500,
                temperature: 0.7,
            }
        });

        // Send message and get response
        const result = await chat.sendMessage(message);
        const reply = result.text();

        return res.status(200).json({ reply });

    } catch (error) {
        console.error('AI Chat API Error:', error);
        return res.status(500).json({
            error: error.message,
            reply: "Sorry, I'm having trouble connecting right now. Please try again later."
        });
    }
}
