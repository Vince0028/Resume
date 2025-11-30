 $port = 5510
$prefix = "http://localhost:$port/"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
try {
    $listener.Start()
    Write-Host "Serving $prefix (Ctrl+C in this terminal to stop)" -ForegroundColor Cyan
} catch {
    Write-Host "Failed to start listener on $prefix : $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "If Access Denied, run elevated or reserve URL: netsh http add urlacl url=$prefix user=Everyone" -ForegroundColor Yellow
    exit 1
}
function Get-ContentType($path) {
    switch ([IO.Path]::GetExtension($path).ToLower()) {
        '.html' { 'text/html' }
        '.htm'  { 'text/html' }
        '.css'  { 'text/css' }
        '.js'   { 'application/javascript' }
        '.png'  { 'image/png' }
        '.jpg'  { 'image/jpeg' }
        '.jpeg' { 'image/jpeg' }
        '.gif'  { 'image/gif' }
        '.svg'  { 'image/svg+xml' }
        default { 'application/octet-stream' }
    }
}
while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $raw = $context.Request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($raw)) { $raw = 'index.html' }
        $full = Join-Path (Get-Location) $raw
        if (-not (Test-Path $full)) {
            $context.Response.StatusCode = 404
            $msg = "Not Found"
            $bytes = [Text.Encoding]::UTF8.GetBytes($msg)
            $context.Response.OutputStream.Write($bytes,0,$bytes.Length)
            $context.Response.OutputStream.Close()
            continue
        }
        $bytes = [IO.File]::ReadAllBytes($full)
        $context.Response.ContentType = Get-ContentType $full
        $context.Response.ContentLength64 = $bytes.Length
        $context.Response.OutputStream.Write($bytes,0,$bytes.Length)
        $context.Response.OutputStream.Close()
    } catch {
        Write-Host "Request error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}
