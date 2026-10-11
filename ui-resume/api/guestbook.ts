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
            const { data, error } = await supabase
                .from('guestbook')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const mapped = (data || []).map(item => ({
                ...item,
                createdAt: item.created_at,
            }));
            return res.status(200).json(mapped);
        }

        if (req.method === 'POST') {
            const { name, comment } = req.body || {};
            if (!name || !comment) {
                return res.status(400).json({ message: 'name and comment are required' });
            }

            const { data, error } = await supabase
                .from('guestbook')
                .insert({ name, comment })
                .select()
                .single();

            if (error) throw error;

            return res.status(201).json({ ...data, createdAt: data.created_at });
        }

        return res.status(405).json({ message: 'Method not allowed' });
    } catch (err: any) {
        console.error('[guestbook] Error:', err);
        return res.status(500).json({ message: err.message || 'Internal server error' });
    }
}
