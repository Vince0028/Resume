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
        async addMessage() {
            if (!this.visitorName || !this.visitorEmail || !this.visitorMessage) return;

            this.isSending = true;
            this.statusMessage = '';

            try {
                const response = await fetch('/api/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: this.visitorName,
                        email: this.visitorEmail,
                        message: this.visitorMessage
                    })
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error + (result.details ? ': ' + result.details : ''));
                }

                
                this.visitorName = '';
                this.visitorEmail = '';
                this.visitorMessage = '';

                this.statusType = 'success';
                this.statusMessage = 'Message sent successfully!';

            } catch (error) {
                console.error('Error:', error);
                this.statusType = 'error';
                if (error.message.includes('Failed to fetch')) {
                    this.statusMessage = 'Network Error: Cannot reach server. Are you running "vercel dev" or deployed?';
                } else {
                    this.statusMessage = 'Failed to send message: ' + error.message;
                }
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
