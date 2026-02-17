
import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../.env' }); // Load from root env if running in nested folder, but better to copy .env to backend

@Injectable()
export class GuestbookService {
    private supabase: SupabaseClient;

    constructor() {
        // Fallback to process.env if available, otherwise try loaded
        const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
        const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

        if (supabaseUrl && supabaseKey) {
            this.supabase = createClient(supabaseUrl, supabaseKey);
        } else {
            console.warn('Supabase not configured in NestJS backend.');
        }
    }

    async addComment(data: { name: string; email: string; message: string }) {
        if (!this.supabase) {
            throw new InternalServerErrorException('Database connection not configured');
        }

        const { name, email, message } = data;
        if (!name || !message) {
            throw new BadRequestException('Missing name or message');
        }

        const cleanMessage = this.filterProfanity(message);
        const cleanName = this.filterProfanity(name);

        const { data: result, error } = await this.supabase
            .from('ui_guestbook')
            .insert([
                {
                    name: cleanName,
                    email: email,
                    message: cleanMessage,
                    created_at: new Date().toISOString(),
                },
            ])
            .select();

        if (error) {
            throw new InternalServerErrorException(error.message);
        }

        return { success: true, data: result };
    }

    async getComments() {
        if (!this.supabase) {
            throw new InternalServerErrorException('Database connection not configured');
        }

        const { data, error } = await this.supabase
            .from('ui_guestbook')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            throw new InternalServerErrorException(error.message);
        }
        return data;
    }

    async sendEmail(data: { name: string; email: string; message: string }) {
        const { name, email, message } = data;
        const apiKey = process.env.BREVO_API_KEY;

        if (!apiKey) {
            throw new InternalServerErrorException('Server misconfiguration: No API Key');
        }

        try {
            const response = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    'api-key': apiKey,
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    sender: {
                        name: 'Portfolio Guestbook',
                        email: 'alobinvince@gmail.com',
                    },
                    to: [
                        {
                            email: 'alobinvince@gmail.com',
                            name: 'Vince Nelmar Alobin',
                        },
                    ],
                    replyTo: {
                        email: email,
                        name: name,
                    },
                    subject: `New Guestbook Message from ${name}`,
                    htmlContent: `
                    <html>
                        <body>
                            <h1>New Guestbook Message</h1>
                            <p><strong>Name:</strong> ${name}</p>
                            <p><strong>Email:</strong> ${email}</p>
                            <p><strong>Message:</strong></p>
                            <blockquote style="border-left: 4px solid #ccc; padding-left: 10px; color: #555;">
                                ${message.replace(/\n/g, '<br>')}
                            </blockquote>
                        </body>
                    </html>
                `,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(JSON.stringify(errorData));
            }

            return { success: true };
        } catch (error) {
            console.error('Brevo API Error:', error);
            throw new InternalServerErrorException(
                'Failed to send email: ' + error.message,
            );
        }
    }

    private filterProfanity(text: string): string {
        const BAD_WORDS = [
            'fuck',
            'shit',
            'bitch',
            'asshole',
            'damn',
            'dick',
            'pussy',
            'cunt',
            'bastard',
            'idiot',
            'stupid',
            'whore',
            'slut',
            'putangina',
            'putang ina',
            'tangina',
            'tang ina',
            'gago',
            'tanga',
            'bobo',
            'inutil',
            'tarantado',
            'ulol',
            'ulul',
            'olol',
            'buwisit',
            'leche',
            'puki',
            'tite',
            'kantot',
            'hindot',
            'kupal',
            'hayop',
            'siraulo',
            'gaga',
            'pokpok',
            'pakyu',
            'pak yu',
        ];

        let filtered = text;
        BAD_WORDS.forEach((word) => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            filtered = filtered.replace(regex, '*'.repeat(word.length));
        });
        return filtered;
    }
}
