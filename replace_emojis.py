#!/usr/bin/env python3
# -*- coding: utf-8 -*-

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace emojis with Bootstrap Icons
replacements = {
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
}

for emoji, icon in replacements.items():
    content = content.replace(emoji, icon)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Successfully replaced all emojis with Bootstrap icons!")
