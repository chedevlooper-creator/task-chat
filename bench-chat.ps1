$results = @()
for ($i = 0; $i -lt 5; $i++) {
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    $body = @{text="Bugün ne yapıyorum?"} | ConvertTo-Json
    $r = Invoke-RestMethod -Uri 'http://127.0.0.1:3000/api/chat' -Method Post -ContentType 'application/json' -Body $body -TimeoutSec 60
    $sw.Stop()
    $results += [PSCustomObject]@{
        Iter = $i + 1
        Ms = $sw.ElapsedMilliseconds
        Len = $r.reply.Length
    }
    Start-Sleep -Seconds 2
}
$results | Format-Table -AutoSize
$avg = ($results | Measure-Object -Property Ms -Average).Average
$min = ($results | Measure-Object -Property Ms -Minimum).Minimum
$max = ($results | Measure-Object -Property Ms -Maximum).Maximum
Write-Host ""
Write-Host "Average: $($avg.ToString('F0'))ms | Min: $($min)ms | Max: $($max)ms" -ForegroundColor Cyan