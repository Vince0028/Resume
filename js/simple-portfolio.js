const toggle = document.getElementById('themeToggle');
const body = document.body;
const savedTheme = localStorage.getItem('simplePortfolioTheme');
const envelope = document.getElementById('envelope');
const envelopeBtn = document.getElementById('openEnvelopeBtn');
const stage = document.getElementById('envelopeStage');
const menuToggle = document.getElementById('menuToggle');
const topActions = document.querySelector('.top-actions');
let envelopeOpened = false;

if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
    toggle.innerHTML = '<i data-lucide="sun" style="width: 14px; height: 14px;"></i>';
}

toggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    toggle.innerHTML = isDark
        ? '<i data-lucide="sun" style="width: 14px; height: 14px;"></i>'
        : '<i data-lucide="moon" style="width: 14px; height: 14px;"></i>';
    localStorage.setItem('simplePortfolioTheme', isDark ? 'dark' : 'light');

    // Re-initialize Lucide icons for the new icon
    if (window.lucide) {
        lucide.createIcons();
    }
});

const openEnvelope = () => {
    if (envelopeOpened) return;
    envelopeOpened = true;
    stage.classList.add('opened');

    document.documentElement.style.overflow = 'auto';
    body.style.overflow = 'visible';
};

menuToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    topActions?.classList.toggle('show');
});

envelope.addEventListener('click', openEnvelope);
envelopeBtn.addEventListener('click', openEnvelope);
