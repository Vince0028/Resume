const guestbookApp = Vue.createApp({
    data() {
        return {
            visitorName: '',
            visitorEmail: '',
            visitorMessage: '',
            isSending: false,
            statusMessage: '',
            statusType: '',
            comments: [],
            currentIndex: 0,
            isLoadingComments: false
        }
    },
    computed: {
        visibleComments() {
            return this.comments.slice(this.currentIndex, this.currentIndex + 2);
        },
        hasNext() {
            return this.currentIndex + 2 < this.comments.length;
        },
        hasPrev() {
            return this.currentIndex > 0;
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
            await this.performAction(url, 'Comment added to Guestbook!', false);
            this.fetchComments(); // Refresh comments after adding
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
                // endpoint 'comments' -> /api/ui-guestbook (GET)
                if (endpoint === 'email') return '/api/send-email';
                return '/api/ui-guestbook';
            }
        },

        async fetchComments() {
            this.isLoadingComments = true;
            try {
                const url = this.getApiUrl('comments');
                const response = await fetch(url);
                if (!response.ok) throw new Error('Failed to fetch comments');
                const data = await response.json();
                this.comments = Array.isArray(data) ? data : [];
            } catch (error) {
                console.error('Error fetching comments:', error);
            } finally {
                this.isLoadingComments = false;
            }
        },

        nextPage() {
            if (this.hasNext) this.currentIndex += 2;
        },

        prevPage() {
            if (this.hasPrev) this.currentIndex -= 2;
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
            this.comments = this.comments.filter(msg => msg.id !== id);
        }
    },
    mounted() {
        this.fetchComments();
    }
});

guestbookApp.mount('#vue-guestbook');
