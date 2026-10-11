import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return res.status(500).json({
            message: 'Missing environment variables. Please check SUPABASE_URL and SUPABASE_KEY in Vercel settings.'
        });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        if (req.method === 'GET') {
            const limit = parseInt(req.query.limit as string) || 50;
            const { data, error } = await supabase
                .from('livechat')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;

            const mapped = (data || []).map(item => ({
                ...item,
                createdAt: item.created_at,
            }));
            return res.status(200).json(mapped);
        }

        if (req.method === 'POST') {
            const { username, message } = req.body || {};
            if (!username || !message) {
                return res.status(400).json({ message: 'username and message are required' });
            }

            const { data, error } = await supabase
                .from('livechat')
                .insert({ username, message })
                .select()
                .single();

            if (error) throw error;

            return res.status(201).json({ ...data, createdAt: data.created_at });
        }

        return res.status(405).json({ message: 'Method not allowed' });
    } catch (err: any) {
        console.error('[livechat] Error:', err);
        return res.status(500).json({ message: err.message || 'Internal server error' });
    }
}
