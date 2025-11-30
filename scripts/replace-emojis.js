const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');


const replacements = {
    '🏆': '<i class="bi bi-trophy-fill"></i>',
    '💻': '<i class="bi bi-terminal-fill"></i>',
    '🌐': '<i class="bi bi-globe2"></i>',
    '🎨': '<i class="bi bi-palette-fill"></i>',
    '🎬': '<i class="bi bi-camera-reels-fill"></i>',
    '🍓': '<i class="bi bi-cpu-fill"></i>',
    '🔬': '<i class="bi bi-flask"></i>',
    '✅': '<i class="bi bi-check-circle-fill"></i>',
    '✨': '<i class="bi bi-star-fill"></i>',
    '🎯': '<i class="bi bi-bullseye"></i>',
};

for (const [emoji, icon] of Object.entries(replacements)) {
    content = content.split(emoji).join(icon);
}

fs.writeFileSync('index.html', content, 'utf8');
console.log('✓ Successfully replaced all emojis with Bootstrap icons!');
