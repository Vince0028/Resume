class TextScrambleEffect {
    constructor(element, options = {}) {
        this.element = element;
        this.chars = options.chars || '.:-=+*/<>[]{}!@#$%^&()';
        this.speed = options.speed || 50;
        this.radius = options.radius || 100;
        this.originalText = element.textContent.trim();
        this.isHovering = false;

        this.splitText();
        this.initEvents();
    }

    splitText() {
        const text = this.originalText;
        this.element.innerHTML = '';
        this.spanChars = [];

        // Split by words first to preserve wrapping integrity
        // Filter out empty strings caused by multiple spaces or newlines
        const words = text.split(/\s+/).filter(w => w.length > 0);

        words.forEach((word, index) => {
            // Create a wrapper for the word to prevent breaking inside it
            const wordSpan = document.createElement('span');
            wordSpan.style.display = 'inline-block';
            wordSpan.style.whiteSpace = 'nowrap';

            // Process chars in the word
            for (let char of word) {
                const charSpan = document.createElement('span');
                charSpan.textContent = char;
                charSpan.style.display = 'inline-block';
                charSpan.style.transition = 'color 0.2s';
                charSpan.style.willChange = 'transform'; // Optimize animation
                charSpan.dataset.original = char;

                wordSpan.appendChild(charSpan);
                this.spanChars.push(charSpan);
            }

            // Add margin for space instead of a text node
            if (index < words.length - 1) {
                wordSpan.style.marginRight = '0.25em'; // Adjustable word spacing
            }

            this.element.appendChild(wordSpan);
        });
    }

    initEvents() {
        document.addEventListener('mousemove', (e) => {
            this.handleMouseMove(e);
        });

        // Handle touch for mobile
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.handleMouseMove(e.touches[0]);
            }
        });
    }

    handleMouseMove(e) {
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        this.spanChars.forEach(span => {
            const rect = span.getBoundingClientRect();
            const charX = rect.left + rect.width / 2;
            const charY = rect.top + rect.height / 2;

            const dist = Math.hypot(mouseX - charX, mouseY - charY);

            if (dist < this.radius) {
                // Determine intensity based on distance
                const intensity = 1 - (dist / this.radius);

                if (Math.random() < intensity * 0.5) { // Random chance to scramble based on closeness
                    span.textContent = this.getRandomChar();
                    span.style.color = '#6366f1'; // Add a subtle tint when scrambling
                    span.style.transform = `translateY(${Math.random() * 2 - 1}px)`;
                } else {
                    // Occasionally revert to keep it readable
                    if (Math.random() > 0.7) {
                        span.textContent = span.dataset.original;
                        span.style.color = '';
                        span.style.transform = '';
                    }
                }
            } else {
                // Reset if not already reset
                if (span.textContent !== span.dataset.original) {
                    span.textContent = span.dataset.original;
                    span.style.color = '';
                    span.style.transform = '';
                }
            }
        });
    }

    getRandomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
}

// Initialize the effect on load
// Initialize the effect on load
document.addEventListener('DOMContentLoaded', () => {
    // Select almost every element that might contain text
    // We cast a wide net here to ensure "every single text" is covered.
    // The filter below ensures we only affect leaf nodes (text itself).
    const selectors = 'h1, h2, h3, h4, h5, h6, p, li, span, strong, em, b, i, button, a, label, small, th, td, div, blockquote, caption, cite, .pill, .badge, .card-title, .card-text';
    const textElements = document.querySelectorAll(selectors);

    // Filter out huge chunks of text or specific containers if needed to avoid lag
    textElements.forEach(el => {
        // Skip elements inside the github calendar to prevent layout breakage
        if (el.closest('#github-calendar')) return;

        // Only apply to leaf nodes (elements with no child tags) that contain actual text
        if (el.children.length === 0 && el.textContent.trim().length > 0) {
            new TextScrambleEffect(el, {
                radius: 30, // Much tighter interaction radius (was 80)
                speed: 30
            });
        }
    });
});
