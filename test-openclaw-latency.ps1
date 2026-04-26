$sw = [System.Diagnostics.Stopwatch]::StartNew()
$headers = @{
    'Content-Type' = 'application/json'
    'Authorization' = 'Bearer e2869008d26c5d4d8d39c495fe35377550af2d4723b0afdf'
    'x-openclaw-session-key' = 'perf-test'
}
$body = @{
    model = 'openclaw/default'
    user = 'perf-test'
    stream = $false
    messages = @(
        @{role='user'; content='Kısa bir selam ver.'}
    )
} | ConvertTo-Json -Compress
$r = Invoke-RestMethod -Uri 'https://consists-chancellor-literally-dedicated.trycloudflare.com/v1/chat/completions' -Method Post -Headers $headers -Body $body -TimeoutSec 30
$sw.Stop()
Write-Host "OpenClaw API latency (HTTP/2): $($sw.ElapsedMilliseconds)ms"
Write-Host "Reply: $($r.choices[0].message.content)"