$BASE = "http://127.0.0.1:3000/api"

Write-Host "=== Testing PATCH member (DEBUG) ===" -ForegroundColor Cyan

$body = @{name="Test User";color="#00ff00"} | ConvertTo-Json -Compress
$r = Invoke-RestMethod -Uri "$BASE/members" -Method Post -ContentType 'application/json' -Body $body -TimeoutSec 5
Write-Host "Created member: $($r | ConvertTo-Json)"
$memberId = $r.id
Write-Host "Member ID: $memberId"

Write-Host "`nNow PATCH member $memberId..."
try {
    $patchBody = @{name="Updated Name"} | ConvertTo-Json -Compress
    $r2 = Invoke-RestMethod -Uri "$BASE/members/$memberId" -Method Patch -ContentType 'application/json' -Body $patchBody -TimeoutSec 5
    Write-Host "PATCH result: $($r2 | ConvertTo-Json)"
} catch {
    Write-Host "PATCH Error: $($_.Exception.Message)"
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
}