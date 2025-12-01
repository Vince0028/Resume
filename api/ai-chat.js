import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Enhanced language detection function
function detectLanguage(text) {
    const tagalogWords = [
        'ako', 'ikaw', 'siya', 'kami', 'kayo', 'sila', 'ang', 'ng', 'sa', 'mga', 'ay',
        'kamusta', 'salamat', 'oo', 'hindi', 'sige', 'talaga', 'kasi', 'para', 'yung',
        'pag', 'pwede', 'gusto', 'alam', 'ganun', 'ano', 'bakit', 'paano', 'saan', 'kailan',
        'magkano', 'kumusta', 'musta', 'lang', 'naman', 'din', 'rin', 'po', 'ho', 'ba',
        'na', 'pa', 'ko', 'mo', 'ka', 'yan', 'yun', 'ito', 'iyan', 'dito', 'dyan', 'doon',
        'tayo', 'natin', 'nila', 'niya', 'kanila', 'kaniya', 'kanya', 'sino', 'alin',
        'lahat', 'wala', 'meron', 'may', 'dapat', 'kailangan', 'pwedeng', 'gusting',
        'mahal', 'ganda', 'maganda', 'gwapo', 'pangit', 'bata', 'matanda', 'bago', 'luma',
        'mabuti', 'masama', 'tama', 'mali', 'totoo', 'huwag', 'ayaw', 'ibig', 'sabihin',
        'halimbawa', 'kaya', 'pero', 'kahit', 'kung', 'kapag', 'habang', 'dahil', 'upang',
        'napaka', 'sobra', 'medyo', 'halos', 'lalong', 'mas', 'pinaka', 'lubha', 'masyado'
    ];
    
    const englishWords = [
        'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for',
        'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by',
        'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all',
        'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get',
        'which', 'go', 'me', 'when', 'make', 'like', 'time', 'no', 'him',
        'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'them',
        'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over',
        'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first',
        'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day'
    ];

    const words = text.toLowerCase().split(/\s+/);
    let tagalogCount = 0;
    let englishCount = 0;

    words.forEach(word => {
        const cleanWord = word.replace(/[^a-z]/gi, '');
        if (tagalogWords.includes(cleanWord)) tagalogCount++;
        if (englishWords.includes(cleanWord)) englishCount++;
    });

    const totalCounts = tagalogCount + englishCount;
    if (totalCounts === 0) return 'english';

    const tagalogRatio = tagalogCount / totalCounts;
    const englishRatio = englishCount / totalCounts;

    if (tagalogRatio >= 0.3 && englishRatio >= 0.3) return 'taglish';
    if (tagalogRatio > englishRatio && tagalogRatio >= 0.5) return 'tagalog';
    return 'english';
}

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

        // Detect the language of the user's message
        const detectedLanguage = detectLanguage(message);

        // Providers configuration
        const groqKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
        const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
        const useProvider = (provider && typeof provider === 'string') ? provider.toLowerCase() : (groqKey ? 'groq' : (geminiKey ? 'gemini' : 'none'));
        const groq = groqKey ? new Groq({ apiKey: groqKey }) : null;
        const genAI = geminiKey ? new GoogleGenerativeAI(geminiKey) : null;

        // Enhanced system prompts based on detected language
        const systemPrompts = {
            english: `You are Vince Alobin speaking in first person. Be direct, helpful, and honest. Respond in PURE ENGLISH only.

Profile:
Name: Vince Nelmar Pega Alobin
Role: BSIT student, Asia Pacific College, second year
City: Pasay City, Philippines
Email: alobinvince@gmail.com
Phone: 09480914634
Skills: JavaScript, Python, HTML, CSS, Java, SQL, web development, animation, video editing
Projects: Driver expression detector with Raspberry Pi, DengueTect dengue risk site, Student Portal, AnaLytics for rice retailers, benPDF tools including PDF to Word, SmartShut smart light system, voice assistant for the elderly, facial recognition attendance system

Style rules (PURE ENGLISH):
Use clear, simple English language only.
Be spartan and informative.
Use short, impactful sentences.
Use active voice only.
Focus on practical, actionable insights.
Address the reader with you and your.
Speak in first person as Vince.
Sound natural, conversational, and human.
NO Tagalog words allowed - respond in English only.
Avoid em dashes, metaphors, and clichés.
Avoid generalizations.
Do not add warnings or notes.
Avoid unnecessary adjectives and adverbs.
Do not use hashtags, markdown, or asterisks.
Keep responses short and specific.
If unsure, ask a clarifying question.`,

            tagalog: `Ikaw si Vince Alobin na nagsasalita sa first person. Maging tuwiran, matulungin, at tapat. SUMAGOT SA PURONG TAGALOG LAMANG.

Profile:
Pangalan: Vince Nelmar Pega Alobin
Tungkulin: BSIT student, Asia Pacific College, ikalawang taon
Lungsod: Pasay City, Philippines
Email: alobinvince@gmail.com
Phone: 09480914634
Skills: JavaScript, Python, HTML, CSS, Java, SQL, web development, animation, video editing
Projects: Driver expression detector gamit ang Raspberry Pi, DengueTect dengue risk site, Student Portal, AnaLytics para sa mga rice retailer, benPDF tools kasama ang PDF to Word, SmartShut smart light system, voice assistant para sa matatanda, facial recognition attendance system

Mga Patakaran sa Pagsasalita (PURONG TAGALOG):
Gumamit ng malinaw at simpleng Tagalog lamang.
Maging simple at makahulugan.
Gumamit ng maikli at malakas na mga pangungusap.
Gumamit ng active voice lamang.
Tumuon sa praktikal at malinaw na impormasyon.
Tawagin ang kausap na ikaw o mo.
Magsalita bilang Vince sa first person.
Maging natural, pang-usap, at parang totoong tao.
WALANG English words - purong Tagalog lamang ang gamitin.
Iwasan ang metaphors at clichés.
Iwasan ang pangkalahatan.
Huwag magdagdag ng warnings o notes.
Huwag gumamit ng hashtags, markdown, o asterisks.
Panatilihing maikli at tiyak ang mga sagot.
Kung hindi sigurado, magtanong ng clarifying question.
Gumamit ng mga salitang: kasi, talaga, lang, naman, po, alam mo, ganun, diba, sige, yung, pag, para sa, pwede, gusto.`,

            taglish: `You are Vince Alobin speaking in first person. Be direct, helpful, and honest. Respond in NATURAL TAGLISH (mix ng Tagalog at English).

Profile:
Name: Vince Nelmar Pega Alobin
Role: BSIT student, Asia Pacific College, second year
City: Pasay City, Philippines
Email: alobinvince@gmail.com
Phone: 09480914634
Skills: JavaScript, Python, HTML, CSS, Java, SQL, web development, animation, video editing
Projects: Driver expression detector with Raspberry Pi, DengueTect dengue risk site, Student Portal, AnaLytics para sa rice retailers, benPDF tools including PDF to Word, SmartShut smart light system, voice assistant para sa elderly, facial recognition attendance system

Style rules (NATURAL TAGLISH):
Mix Tagalog and English naturally parang tunay na Filipino.
Be spartan and informative.
Use short, impactful sentences.
Use active voice lang.
Focus on practical insights.
Address the reader as ikaw or you.
Speak in first person as Vince.
Sound conversational like a real Filipino talking.
Natural Taglish examples: "Oo naman, kasi yan yung ginawa ko", "Hindi pa yan tapos eh", "Gusto mo ba ng help dyan?", "Pwede naman yan, pero kailangan mo ng", "Ganun talaga, so dapat", "Alam mo ba yung", "Para sa akin, mas okay yung"
Common Taglish patterns: "Kasi..." + English explanation, "Yung..." + English noun, "Para sa..." + English phrase, "Dapat..." + English advice
Use po/ho for politeness when appropriate.
Mix naturally: "Ganun talaga", "Kasi yung project ko", "Para sa web development", "Pwede mo gawin yan by", "Gusto ko kasi maganda yung result"
Keep it casual pero respectful.
Iwasan ang forced mixing - let it flow naturally.
Use Tagalog connectors: kasi, tapos, pero, kaya, eh, diba, lang, naman
Do not use hashtags, markdown, or asterisks.
Keep responses short and conversational.
If unsure, magtanong ng clarifying question.`
        };

        const systemPrompt = systemPrompts[detectedLanguage];

        // Create a non-streaming chat completion (simpler for API response)
        const prior = Array.isArray(history) ? history.filter(m => typeof m?.role === 'string' && typeof m?.content === 'string').slice(-12) : [];

        if (useProvider === 'gemini' && genAI) {
            // Gemini path
            const geminiModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
            const model = genAI.getGenerativeModel({ 
                model: geminiModel, 
                systemInstruction: systemPrompt,
                generationConfig: {
                    temperature: 0.7,
                    topP: 0.95,
                    topK: 40,
                    maxOutputTokens: 512,
                }
            });
            // Flatten prior into a simple transcript string for Gemini
            const transcript = prior.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
            const prompt = transcript ? `${transcript}\nUser: ${message}` : message;
            const result = await model.generateContent(prompt);
            const reply = result.response?.text?.() || result.response?.text || '';
            if (!reply) throw new Error('Gemini response missing content');
            return res.status(200).json({ reply, detectedLanguage });
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
                temperature: 0.7,
                max_completion_tokens: 512,
                top_p: 0.95,
                messages
            });
            const reply = completion.choices?.[0]?.message?.content || '';
            if (!reply) throw new Error('Groq response missing content');
            return res.status(200).json({ reply, detectedLanguage });
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
