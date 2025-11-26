$file = 'index.html'
$content = Get-Content $file -Raw -Encoding UTF8

# Stats section emojis
$content = $content -replace '\ud83c\udfc6', '<i class="bi bi-trophy-fill"></i>'
$content = $content -replace '💻', '<i class="bi bi-code-slash"></i>'

# Expertise section emojis  
$content = $content -replace '\ud83c\udf10', '<i class="bi bi-globe2"></i>'
$content = $content -replace '\ud83c\udfa8', '<i class="bi bi-palette-fill"></i>'
$content = $content -replace '\ud83c\udfac', '<i class="bi bi-camera-reels-fill"></i>'

# Project badges
$content = $content -replace '\ud83c\udf53', '<i class="bi bi-cpu-fill"></i>'
$content = $content -replace '\ud83d\udd2c', '<i class="bi bi-flask"></i>'
$content = $content -replace '✅', '<i class="bi bi-check-circle-fill"></i>'

# Education badges
$content = $content -replace '✨', '<i class="bi bi-star-fill"></i>'

# Right sidebar
$content = $content -replace '\ud83c\udfaf', '<i class="bi bi-bullseye"></i>'

# Terminal icon (if any left)
$content = $content -replace '(?<=>)💻(?=<)', '<i class="bi bi-terminal-fill"></i>'

$content | Set-Content $file -Encoding UTF8 -NoNewline
Write-Host "Successfully replaced all emojis with Bootstrap icons!"
