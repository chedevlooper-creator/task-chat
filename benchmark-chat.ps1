function measure-chat-latency {
    param([int]$iterations = 5)
    $results = @()
    for ($i = 0; $i -lt $iterations; $i++) {
        $sw = [System.Diagnostics.Stopwatch]::StartNew()
        try {
            $resp = Invoke-RestMethod -Uri 'http://127.0.0.1:3000/api/chat' -Method Post -ContentType 'application/json' -Body (@{text="Saat kaç?"} | ConvertTo-Json) -TimeoutSec 30
            $sw.Stop()
            $results += [PSCustomObject]@{
                Iteration = $i + 1
                TotalMs = $sw.ElapsedMilliseconds
                Success = $true
                ReplyLength = $resp.reply.Length
            }
        } catch {
            $sw.Stop()
            $results += [PSCustomObject]@{
                Iteration = $i + 1
                TotalMs = $sw.ElapsedMilliseconds
                Success = $false
                Error = $_.Exception.Message
            }
        }
        Start-Sleep -Milliseconds 500
    }
    $results | Format-Table -AutoSize
    $successful = $results | Where-Object { $_.Success }
    if ($successful.Count -gt 0) {
        $avg = ($successful | Measure-Object -Property TotalMs -Average).Average
        $min = ($successful | Measure-Object -Property TotalMs -Minimum).Minimum
        $max = ($successful | Measure-Object -Property TotalMs -Maximum).Maximum
        Write-Host ""
        Write-Host "=== Summary ===" -ForegroundColor Cyan
        Write-Host "Average: $($avg.ToString('F0'))ms"
        Write-Host "Min: $($min)ms"
        Write-Host "Max: $($max)ms"
    }
}
measure-chat-latency -iterations 5