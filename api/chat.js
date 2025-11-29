import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
// We check for both VITE_ prefixed (from local .env) and standard (from Vercel env) variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    // Set CORS headers to allow requests from your domain
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

    try {
        // GET: Fetch messages
        if (req.method === 'GET') {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .order('created_at', { ascending: true })
                .limit(50);

            if (error) throw error;
            return res.status(200).json(data);
        }

        // POST: Send a message
        if (req.method === 'POST') {
            const { username, content } = req.body;

            if (!username || !content) {
                return res.status(400).json({ error: 'Missing username or content' });
            }

            // Add created_at so clients receive the timestamp immediately.
            const now = new Date().toISOString();

            const { data, error } = await supabase
                .from('messages')
                .insert([{ username, content, created_at: now }])
                .select();

            if (error) throw error;
            // Return the inserted row(s) including created_at
            return res.status(200).json(data);
        }

        // PUT: Check if username is taken
        if (req.method === 'PUT') {
            const { username } = req.body;

            if (!username) {
                return res.status(400).json({ error: 'Missing username' });
            }

            // Check for messages from this username in the last 5 minutes
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

            const { data, error } = await supabase
                .from('messages')
                .select('username')
                .eq('username', username)
                .gte('created_at', fiveMinutesAgo)
                .limit(1);

            if (error) throw error;

            const isTaken = data && data.length > 0;
            return res.status(200).json({ isTaken });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
