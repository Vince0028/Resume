import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client only when environment variables are provided.
// If not present (local dev without Supabase), fall back to an in-memory store
// so you can test chat locally before deploying.
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
} else {
    console.warn('Supabase not configured — using in-memory message store for local testing.');
}

// In-memory fallback store used when Supabase is not configured.
// This is transient (process memory) and intended for local testing only.
const inMemoryStore = {
    messages: [],
    insert(message) {
        this.messages.push(message);
        return [message];
    },
    select() {
        return this.messages.slice();
    },
    findRecentByUsername(username, sinceIso) {
        return this.messages.filter(m => m.username === username && m.created_at >= sinceIso);
    }
};

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
            if (supabase) {
                const { data, error } = await supabase
                    .from('messages')
                    .select('*')
                    .order('created_at', { ascending: true })
                    .limit(50);

                if (error) throw error;
                return res.status(200).json(data);
            } else {
                // Return up to 50 messages, sorted ascending
                const msgs = inMemoryStore.select().sort((a, b) => a.created_at.localeCompare(b.created_at)).slice(0, 50);
                return res.status(200).json(msgs);
            }
        }

        // POST: Send a message
        if (req.method === 'POST') {
            const { username, content } = req.body;

            if (!username || !content) {
                return res.status(400).json({ error: 'Missing username or content' });
            }

            // Add created_at so clients receive the timestamp immediately.
            const now = new Date().toISOString();

            if (supabase) {
                // If Supabase is configured, require the username to be a registered chat user.
                const { data: userRows, error: userError } = await supabase
                    .from('chat_users')
                    .select('id')
                    .eq('username', username)
                    .limit(1);

                if (userError) throw userError;
                if (!userRows || userRows.length === 0) {
                    return res.status(401).json({ error: 'Unknown user. Please register/login first.' });
                }

                const { data, error } = await supabase
                    .from('messages')
                    .insert([{ username, content, created_at: now }])
                    .select();

                if (error) throw error;
                // Return the inserted row(s) including created_at
                return res.status(200).json(data);
            } else {
                const id = `local-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                const inserted = { id, username, content, created_at: now };
                inMemoryStore.insert(inserted);
                return res.status(200).json([inserted]);
            }
        }

        // PUT: Check if username is taken
        if (req.method === 'PUT') {
            const { username } = req.body;

            if (!username) {
                return res.status(400).json({ error: 'Missing username' });
            }

            // Check for messages from this username in the last 5 minutes
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

            if (supabase) {
                const { data, error } = await supabase
                    .from('messages')
                    .select('username')
                    .eq('username', username)
                    .gte('created_at', fiveMinutesAgo)
                    .limit(1);

                if (error) throw error;

                const isTaken = data && data.length > 0;
                return res.status(200).json({ isTaken });
            } else {
                const recent = inMemoryStore.findRecentByUsername(username, fiveMinutesAgo);
                const isTaken = recent && recent.length > 0;
                return res.status(200).json({ isTaken });
            }
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
