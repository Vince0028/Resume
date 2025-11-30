

param(
    [string]$Url = 'http://localhost:3001/api/chat'
)
try {
    $resp = Invoke-RestMethod -Uri $Url -Method GET -TimeoutSec 5
    Write-Host "API responded OK. Sample response type: $($resp.GetType().Name)"
    if ($resp -is [System.Array]) { Write-Host "Returned $( $resp.Length ) messages." }
} catch {
    Write-Host "API health check failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
