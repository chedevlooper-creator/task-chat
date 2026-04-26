$BASE = "http://127.0.0.1:3000/api"

Write-Host "`n=== Edge Case Debug ===" -ForegroundColor Cyan

Write-Host "`n1. Empty text test:"
try {
    $r = Invoke-RestMethod -Uri "$BASE/chat" -Method Post -ContentType 'application/json' -Body (@{text=""} | ConvertTo-Json) -TimeoutSec 5
    Write-Host "   Status: $($r | ConvertTo-Json)"
} catch {
    Write-Host "   Error: $($_.Exception.Response.StatusCode.value__)"
}

Write-Host "`n2. Null body test:"
try {
    $r = Invoke-RestMethod -Uri "$BASE/chat" -Method Post -ContentType 'application/json' -Body (@{text=$null} | ConvertTo-Json) -TimeoutSec 5
    Write-Host "   Status: $($r | ConvertTo-Json)"
} catch {
    Write-Host "   Error: $($_.Exception.Response.StatusCode.value__)"
}

Write-Host "`n3. Non-existent endpoint:"
try {
    $r = Invoke-RestMethod -Uri "$BASE/nonexistent" -Method Get -TimeoutSec 5
    Write-Host "   Status: OK"
} catch {
    Write-Host "   Status Code: $($_.Exception.Response.StatusCode.value__)"
}

Write-Host "`n4. Empty reminder title:"
try {
    $r = Invoke-RestMethod -Uri "$BASE/reminders" -Method Post -ContentType 'application/json' -Body (@{title=""} | ConvertTo-Json) -TimeoutSec 5
    Write-Host "   Status: $($r | ConvertTo-Json)"
} catch {
    Write-Host "   Status Code: $($_.Exception.Response.StatusCode.value__)"
}

Write-Host "`n5. POST reminders with title:"
try {
    $r = Invoke-RestMethod -Uri "$BASE/reminders" -Method Post -ContentType 'application/json' -Body (@{title="Test Hatırlatıcı";body="Test body"} | ConvertTo-Json) -TimeoutSec 5
    Write-Host "   Status: OK - $($r | ConvertTo-Json)"
} catch {
    Write-Host "   Status Code: $($_.Exception.Response.StatusCode.value__)"
}

Write-Host "`n6. GET reminders:"
try {
    $r = Invoke-RestMethod -Uri "$BASE/reminders" -Method Get -TimeoutSec 5
    Write-Host "   Status: $($r | ConvertTo-Json)"
} catch {
    Write-Host "   Status Code: $($_.Exception.Response.StatusCode.value__)"
}