class TextType {
    constructor(element, options = {}) {
        this.element = element;
        this.texts = options.texts || [element.textContent];
        this.typingSpeed = options.typingSpeed || 50;
        this.deletingSpeed = options.deletingSpeed || 30;
        this.pauseDuration = options.pauseDuration || 2000;
        this.initialDelay = options.initialDelay || 0;
        this.loop = options.loop !== undefined ? options.loop : true;
        this.showCursor = options.showCursor !== undefined ? options.showCursor : true;
        this.cursorCharacter = options.cursorCharacter || '|';

        this.currentTextIndex = 0;
        this.currentCharIndex = 0;
        this.isDeleting = false;
        this.isWaiting = false;

        this.init();
    }

    init() {
        // Clear original content and set up structure
        this.element.innerHTML = '';
        this.element.classList.add('text-type');

        // Create text span
        this.textSpan = document.createElement('span');
        this.textSpan.className = 'text-type__content';
        this.element.appendChild(this.textSpan);

        // Create cursor span
        if (this.showCursor) {
            this.cursorSpan = document.createElement('span');
            this.cursorSpan.className = 'text-type__cursor';
            this.cursorSpan.textContent = this.cursorCharacter;
            this.element.appendChild(this.cursorSpan);
        }

        // Start typing loop
        setTimeout(() => this.type(), this.initialDelay);
    }

    type() {
        const currentText = this.texts[this.currentTextIndex];

        if (this.isDeleting) {
            this.textSpan.textContent = currentText.substring(0, this.currentCharIndex - 1);
            this.currentCharIndex--;
            this.updateCursorState();

            if (this.currentCharIndex === 0) {
                this.isDeleting = false;
                this.currentTextIndex = (this.currentTextIndex + 1) % this.texts.length;

                // If not looping and we finished the last sentence, stop here
                if (!this.loop && this.currentTextIndex === 0) return;

                setTimeout(() => this.type(), 500); // Small pause before typing next
            } else {
                setTimeout(() => this.type(), this.deletingSpeed);
            }
        } else {
            this.textSpan.textContent = currentText.substring(0, this.currentCharIndex + 1);
            this.currentCharIndex++;
            this.updateCursorState();

            if (this.currentCharIndex === currentText.length) {
                if (!this.loop && this.currentTextIndex === this.texts.length - 1) {
                    // Finished all texts and no loop
                    if (this.showCursor) this.cursorSpan.style.display = 'none'; // Optional: hide cursor at end
                    return;
                }

                this.isDeleting = true;
                setTimeout(() => this.type(), this.pauseDuration);
            } else {
                // Variable speed randomization (optional, adding slight variance for realism)
                const speed = this.typingSpeed + (Math.random() * 20 - 10);
                setTimeout(() => this.type(), speed);
            }
        }
    }

    updateCursorState() {
        if (!this.showCursor || !this.cursorSpan) return;

        // Example: Hide cursor while typing if desired (controlled by options)
        // For now, we keep it visible like the React component default
    }
}

// Auto-initialize if data attributes are present, or can be called manually
document.addEventListener('DOMContentLoaded', () => {
    // Example usage for elements with data-text-type attribute
    // <h1 data-text-type='["Welcome to My Resume", "Explore My Portfolio"]'></h1>
});
