const guestbookApp = Vue.createApp({
    data() {
        return {
            visitorName: '',
            visitorEmail: '',
            visitorMessage: '',
            isSending: false,
            statusMessage: '',
            statusType: '',
            messages: []
        }
    },
    methods: {
        async sendEmail() {
            if (!this.validateForm()) return;
            const url = this.getApiUrl('email');
            this.performAction(url, 'Email sent successfully!', true);
        },

        async addComment() {
            if (!this.validateForm()) return;
            const url = this.getApiUrl('comment');
            this.performAction(url, 'Comment added to Guestbook!', false);
        },

        getApiUrl(endpoint) {
            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

            if (isLocal) {
                // Local NestJS Server
                return `http://localhost:3000/guestbook/${endpoint}`;
            } else {
                // Vercel Serverless Functions fallback
                // endpoint 'email' -> /api/send-email
                // endpoint 'comment' -> /api/ui-guestbook
                return endpoint === 'email' ? '/api/send-email' : '/api/ui-guestbook';
            }
        },

        validateForm() {
            if (!this.visitorName || !this.visitorEmail || !this.visitorMessage) {
                this.statusType = 'error';
                this.statusMessage = 'Please fill in all fields.';
                return false;
            }
            return true;
        },

        async performAction(url, successMsg, isEmail) {
            this.isSending = true;
            this.statusMessage = '';

            try {
                const payload = {
                    name: this.visitorName,
                    email: this.visitorEmail,
                    message: this.visitorMessage
                };

                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                let result;
                try {
                    result = await response.json();
                } catch (e) {
                    result = {};
                }

                if (!response.ok) {
                    throw new Error(result.error || 'Request failed');
                }

                this.visitorName = '';
                this.visitorEmail = '';
                this.visitorMessage = '';

                this.statusType = 'success';
                this.statusMessage = successMsg;

                // If comment added, maybe refresh list? (Not implemented)

            } catch (error) {
                console.error('Error:', error);
                this.statusType = 'error';
                this.statusMessage = 'Failed: ' + error.message;
            } finally {
                this.isSending = false;
                setTimeout(() => {
                    this.statusMessage = '';
                }, 3000);
            }
        },
        deleteMessage(id) {
            this.messages = this.messages.filter(msg => msg.id !== id);
        }
    }
});

guestbookApp.mount('#vue-guestbook');
