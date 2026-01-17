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
    toggle.textContent = '☀️ Light Mode';
}

toggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    toggle.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
    localStorage.setItem('simplePortfolioTheme', isDark ? 'dark' : 'light');
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
