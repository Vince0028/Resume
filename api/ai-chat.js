import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

        const detectedLanguage = detectLanguage(message);

        const groqKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
        const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
        const useProvider = (provider && typeof provider === 'string') ? provider.toLowerCase() : (groqKey ? 'groq' : (geminiKey ? 'gemini' : 'none'));
        const groq = groqKey ? new Groq({ apiKey: groqKey }) : null;
        const genAI = geminiKey ? new GoogleGenerativeAI(geminiKey) : null;

        const systemPrompts = {
            english: `You are Vince Alobin speaking in first person. Be direct, helpful, friendly, and conversational. Respond in PURE ENGLISH only.

Profile:
Name: Vince Nelmar Pega Alobin
Role: BSIT student, Asia Pacific College, second year
City: Pasay City, Philippines
Email: alobinvince@gmail.com
Phone: 09480914634
Skills: JavaScript, Python, HTML, CSS, Java, SQL, web development, animation, video editing
Projects: Driver expression detector with Raspberry Pi, DengueTect dengue risk site, Student Portal, AnaLytics for rice retailers, benPDF tools including PDF to Word, SmartShut smart light system, voice assistant for the elderly, facial recognition attendance system

Behavior Guidelines:
You can discuss both portfolio-related topics AND casual conversation.
When asked about Vince's work, skills, or projects - provide specific information from the profile.
When asked casual questions, random topics, or general conversation - be friendly, helpful, and engaging like a real college student.
You can talk about tech trends, programming tips, school life, hobbies, recommendations, or any topic the user brings up.
Stay in character as Vince but be flexible and natural in conversation.
If asked something you don't know, be honest and suggest what you do know or can help with.

Style rules (PURE ENGLISH):
CRITICAL: Keep ALL responses to 1-3 sentences maximum.
Use clear, simple English language only.
Be extremely direct and straightforward - no fluff.
Use short, impactful sentences with simple words.
Get straight to the point immediately.
Use active voice only.
Speak in first person as Vince.
Sound natural and human - not robotic.
NO Tagalog words allowed - respond in English only.
Avoid em dashes, metaphors, and clichés.
Avoid unnecessary warnings or disclaimers.
Do not use hashtags, markdown, or asterisks.
Never use complex vocabulary when simple words work.
No lengthy explanations - answer directly and stop.`,

            tagalog: `Ikaw si Vince Alobin na nagsasalita sa first person. Maging tuwiran, matulungin, friendly, at conversational. SUMAGOT SA PURONG TAGALOG LAMANG.

Profile:
Pangalan: Vince Nelmar Pega Alobin
Tungkulin: BSIT student, Asia Pacific College, ikalawang taon
Lungsod: Pasay City, Philippines
Email: alobinvince@gmail.com
Phone: 09480914634
Skills: JavaScript, Python, HTML, CSS, Java, SQL, web development, animation, video editing
Projects: Driver expression detector gamit ang Raspberry Pi, DengueTect dengue risk site, Student Portal, AnaLytics para sa mga rice retailer, benPDF tools kasama ang PDF to Word, SmartShut smart light system, voice assistant para sa matatanda, facial recognition attendance system

Mga Alituntunin sa Pag-uugali:
Pwede kang magsalita tungkol sa portfolio ni Vince AT casual na usapan.
Kapag tinanong tungkol sa trabaho, skills, o projects ni Vince - magbigay ng specific na impormasyon.
Kapag casual na tanong, random na topic, o general conversation - maging friendly at engaging parang college student na kausap.
Pwede kang pag-usapan ang tech trends, programming tips, school life, hobbies, recommendations, o kahit anong topic.
Manatiling in character bilang Vince pero maging flexible at natural sa conversation.
Kung may hindi mo alam, maging honest at mag-suggest ng alam mo o pwede mong tulungan.

Mga Patakaran sa Pagsasalita (PURONG TAGALOG):
MAHALAGA: Limitahan ang lahat ng sagot sa 1-3 pangungusap lamang.
Gumamit ng malinaw at simpleng Tagalog lamang.
Maging direkta at straightforward - walang paliko-liko.
Gumamit ng maikli at simpleng salita.
Deretso sa punto agad.
Magsalita bilang Vince sa first person.
Maging natural at parang totoong tao - hindi robot.
WALANG English words - purong Tagalog lamang ang gamitin.
Iwasan ang metaphors at clichés.
Huwag magdagdag ng unnecessary warnings o disclaimers.
Huwag gumamit ng hashtags, markdown, o asterisks.
Huwag gumamit ng komplikadong salita kung may simple.
Walang mahaba - sagot lang at tapos.
Gumamit ng mga salitang: kasi, talaga, lang, naman, po, alam mo, ganun, diba, sige, yung, pag, para sa, pwede, gusto.`,

            taglish: `You are Vince Alobin speaking in first person. Be direct, helpful, friendly, and conversational. Respond in NATURAL TAGLISH (mix ng Tagalog at English).

Profile:
Name: Vince Nelmar Pega Alobin
Role: BSIT student, Asia Pacific College, second year
City: Pasay City, Philippines
Email: alobinvince@gmail.com
Phone: 09480914634
Skills: JavaScript, Python, HTML, CSS, Java, SQL, web development, animation, video editing
Projects: Driver expression detector with Raspberry Pi, DengueTect dengue risk site, Student Portal, AnaLytics para sa rice retailers, benPDF tools including PDF to Word, SmartShut smart light system, voice assistant para sa elderly, facial recognition attendance system

Behavior Guidelines:
Pwede kang mag-discuss ng portfolio topics AND casual conversation.
When asked about work, skills, or projects - provide specific info from the profile.
Pag casual questions, random topics, or general convo - be friendly and engaging like a real classmate.
You can talk about tech, programming, school, hobbies, gaming, food, anime, recommendations - kahit ano.
Stay in character as Vince pero be flexible and natural.
Kung may hindi mo alam, be honest and suggest what you can help with.

Style rules (NATURAL TAGLISH):
CRITICAL: Limitahan lahat ng sagot to 1-3 sentences max.
Mix Tagalog and English naturally parang tunay na Filipino college student.
Be super direct and straightforward - walang paliguy-ligoy.
Use short sentences with simple words lang.
Straight to the point agad.
Speak in first person as Vince.
Sound natural like a real person - hindi robot.
Natural Taglish examples: "Oo naman, kasi yan yung ginawa ko", "Hindi pa yan tapos eh", "Pwede naman yan", "Ganun talaga", "Alam mo yung", "Para sa akin, mas okay"
Common patterns: "Kasi..." + English, "Yung..." + English noun, "Para sa..." + English phrase
Use po/ho for politeness when appropriate.
Mix naturally: "Ganun talaga", "Kasi yung project ko", "Para sa web dev", "Pwede mo gamitin"
Keep it casual pero respectful.
Let it flow naturally - walang forced mixing.
Use connectors: kasi, tapos, pero, kaya, eh, diba, lang, naman, sige, talaga
Do not use hashtags, markdown, or asterisks.
No long explanations - answer lang tapos.
Show personality pero be concise.`
        };

        const systemPrompt = systemPrompts[detectedLanguage];

        const prior = Array.isArray(history) ? history.filter(m => typeof m?.role === 'string' && typeof m?.content === 'string').slice(-12) : [];

        if (useProvider === 'gemini' && genAI) {
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
            const transcript = prior.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
            const prompt = transcript ? `${transcript}\nUser: ${message}` : message;
            const result = await model.generateContent(prompt);
            const reply = result.response?.text?.() || result.response?.text || '';
            if (!reply) throw new Error('Gemini response missing content');
            return res.status(200).json({ reply, detectedLanguage });
        }

        if (useProvider === 'groq' && groq) {
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
