
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

    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'Server misconfiguration: No API Key' });
    }

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: {
                    name: "Portfolio Guestbook",
                    email: "alobinvince@gmail.com"
                },
                to: [
                    {
                        email: "alobinvince@gmail.com",
                        name: "Vince Nelmar Alobin"
                    }
                ],
                replyTo: {
                    email: email,
                    name: name
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
                `
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(JSON.stringify(errorData));
        }

        return res.status(200).json({ success: true });

    } catch (error) {
        console.error('Brevo API Error:', error);
        return res.status(500).json({ error: 'Failed to send email', details: error.message });
    }
}
