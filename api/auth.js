import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
} else {
    console.warn('Supabase not configured — using in-memory user store for local testing.');
}

// Simple in-memory user store for local testing: { username: passwordHash }
const inMemoryUsers = new Map();

function hashPassword(password, salt = null) {
    salt = salt || crypto.randomBytes(16).toString('hex');
    const iterations = 100000;
    const keylen = 64;
    const digest = 'sha256';
    const derived = crypto.pbkdf2Sync(password, salt, iterations, keylen, digest).toString('hex');
    return `pbkdf2$${iterations}$${salt}$${derived}`;
}

function verifyPassword(password, stored) {
    if (!stored || typeof stored !== 'string') return false;
    const parts = stored.split('$');
    if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false;
    const iterations = parseInt(parts[1], 10);
    const salt = parts[2];
    const hash = parts[3];
    const derived = crypto.pbkdf2Sync(password, salt, iterations, Buffer.from(hash, 'hex').length, 'sha256').toString('hex');
    return derived === hash;
}

export default async function handler(req, res) {
    // Minimal CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        if (req.method === 'POST') {
            const { username, password } = req.body || {};
            if (!username || !password) {
                return res.status(400).json({ success: false, error: 'Missing username or password' });
            }

            // Very light-weight auth: if user exists, verify password; otherwise create user.
            if (supabase) {
                const { data: rows, error: selectError } = await supabase
                    .from('chat_users')
                    .select('id, username, password_hash')
                    .eq('username', username)
                    .limit(1);

                if (selectError) throw selectError;

                if (rows && rows.length > 0) {
                    const user = rows[0];
                    const ok = verifyPassword(password, user.password_hash);
                    if (!ok) return res.status(401).json({ success: false, error: 'Invalid credentials' });
                    return res.status(200).json({ success: true, isNewUser: false });
                }

                // Create new user
                const password_hash = hashPassword(password);
                const { data: insertData, error: insertError } = await supabase
                    .from('chat_users')
                    .insert([{ username, password_hash }])
                    .select('id');

                if (insertError) throw insertError;
                return res.status(200).json({ success: true, isNewUser: true });
            } else {
                // In-memory fallback
                if (inMemoryUsers.has(username)) {
                    const stored = inMemoryUsers.get(username);
                    if (!verifyPassword(password, stored)) {
                        return res.status(401).json({ success: false, error: 'Invalid credentials' });
                    }
                    return res.status(200).json({ success: true, isNewUser: false });
                }

                const password_hash = hashPassword(password);
                inMemoryUsers.set(username, password_hash);
                return res.status(200).json({ success: true, isNewUser: true });
            }
        }

        return res.status(405).json({ success: false, error: 'Method not allowed' });
    } catch (error) {
        console.error('Auth API error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Internal error' });
    }
}
