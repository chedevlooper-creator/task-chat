$sw = [System.Diagnostics.Stopwatch]::StartNew()
$body = @{text='Saat kaç?'} | ConvertTo-Json
$r = Invoke-RestMethod -Uri 'http://127.0.0.1:3000/api/chat' -Method Post -ContentType 'application/json' -Body $body -TimeoutSec 30
$sw.Stop()
Write-Host "Total elapsed: $($sw.ElapsedMilliseconds)ms"
Write-Host "Reply: $($r.reply)"