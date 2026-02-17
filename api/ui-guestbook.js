import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
} else {
    console.warn('Supabase not configured for Guestbook.');
}

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'POST') {
        const { name, email, message } = req.body;

        if (!name || !message) {
            return res.status(400).json({ error: 'Missing name or message' });
        }

        if (!supabase) {
            return res.status(500).json({ error: 'Database connection not configured' });
        }

        try {
            // Basic profanity filter (similar to chat.js)
            const BAD_WORDS = [
                'fuck', 'shit', 'bitch', 'asshole', 'damn', 'dick', 'pussy', 'cunt', 'bastard', 'idiot', 'stupid', 'whore', 'slut',
                'putangina', 'putang ina', 'tangina', 'tang ina', 'gago', 'tanga', 'bobo', 'inutil', 'tarantado', 'ulol', 'ulul', 'olol', 'buwisit', 'leche', 'puki', 'tite', 'kantot', 'hindot', 'kupal', 'hayop', 'siraulo', 'gaga', 'pokpok', 'pakyu', 'pak yu'
            ];

            function filterProfanity(text) {
                let filtered = text;
                BAD_WORDS.forEach(word => {
                    const regex = new RegExp(`\\b${word}\\b`, 'gi');
                    filtered = filtered.replace(regex, '*'.repeat(word.length));
                });
                return filtered;
            }

            const cleanMessage = filterProfanity(message);
            const cleanName = filterProfanity(name);

            const { data, error } = await supabase
                .from('ui_guestbook')
                .insert([
                    {
                        name: cleanName,
                        email: email, // Email is optional for public display but good for storage
                        message: cleanMessage,
                        created_at: new Date().toISOString()
                    }
                ])
                .select();

            if (error) throw error;

            return res.status(200).json({ success: true, data });
        } catch (error) {
            console.error('Guestbook API Error:', error);
            return res.status(500).json({ error: error.message });
        }
    }

    // Optional: GET to retrieve comments
    if (req.method === 'GET') {
        if (!supabase) {
            return res.status(500).json({ error: 'Database connection not configured' });
        }

        try {
            const { data, error } = await supabase
                .from('ui_guestbook')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            return res.status(200).json(data);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
