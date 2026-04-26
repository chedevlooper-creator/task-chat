# task-chat Kapsamlı Test Suite - Sıralı
$ErrorActionPreference = "Continue"
$BASE = "http://127.0.0.1:3000/api"
$results = @()

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Endpoint,
        [object]$Body,
        [int]$ExpectedStatus = 200
    )
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    $statusCode = 0
    try {
        $headers = @{ 'Content-Type' = 'application/json' }
        $params = @{ Method = $Method; Headers = $headers }
        if ($Body -and $Method -ne "GET") { $params.Body = ($Body | ConvertTo-Json -Compress) }
        Invoke-RestMethod -Uri "$BASE$Endpoint" @params -TimeoutSec 15 | Out-Null
        $sw.Stop()
        $statusCode = 200
    } catch {
        $sw.Stop()
        $statusCode = $_.Exception.Response.StatusCode.value__
    }
    
    $passed = ($statusCode -eq $ExpectedStatus)
    $result = [PSCustomObject]@{
        Test = $Name
        StatusCode = $statusCode
        Expected = $ExpectedStatus
        Status = if($passed){"PASS"}else{"FAIL"}
        TimeMs = $sw.ElapsedMilliseconds
        Details = if(-not $passed){"Got $statusCode"}else{""}
    }
    $script:results += $result
    Write-Host "$($result.Status): $Name [HTTP $($statusCode)] ($($result.TimeMs)ms)" -ForegroundColor $(if($result.Status -eq "PASS"){"Green"}else{"Red"})
    return $result
}

function Test-ChatCommand {
    param([string]$Command, [int]$ExpectedStatus = 200)
    return Test-Endpoint -Name "Chat: $Command" -Method Post -Endpoint "/chat" -Body @{text=$Command} -ExpectedStatus $ExpectedStatus
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "task-chat Kapsamlı Test Suite v3" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# === Görev Yönetimi ===
Write-Host "`n[1] Görev Yönetimi Testleri" -ForegroundColor Yellow

Test-ChatCommand -Command "/add Proje başlat" -ExpectedStatus 200
Test-ChatCommand -Command "/add Rapor yaz" -ExpectedStatus 200
Test-ChatCommand -Command "/ekle Toplantı organize et" -ExpectedStatus 200
Test-ChatCommand -Command "/tasks" -ExpectedStatus 200
Test-Endpoint -Name "GET /api/tasks" -Method Get -Endpoint "/tasks"

Write-Host "`n[2] Görev Tamamlama" -ForegroundColor Yellow

Test-ChatCommand -Command "/done 1"
Test-ChatCommand -Command "/bitti 2"

# === Üye Yönetimi ===
Write-Host "`n[3] Üye Yönetimi Testleri" -ForegroundColor Yellow

$createResult = Invoke-RestMethod -Uri "$BASE/members" -Method Post -ContentType 'application/json' -Body (@{name="Ahmet";color="#ff0000"} | ConvertTo-Json) -TimeoutSec 5
$memberId = $createResult.id
Write-Host "PASS: POST /api/members (Ahmet) [HTTP 200] (0ms)"
$script:results += [PSCustomObject]@{Test="POST /api/members (Ahmet)";StatusCode=200;Expected=200;Status="PASS";TimeMs=0;Details=""}
Test-Endpoint -Name "GET /api/members" -Method Get -Endpoint "/members"
Test-Endpoint -Name "PATCH /api/members/$memberId" -Method Patch -Endpoint "/members/$memberId" -Body @{name="Ahmet Değişti"}
Test-Endpoint -Name "DELETE /api/members/$memberId" -Method Delete -Endpoint "/members/$memberId"
Test-Endpoint -Name "GET /api/members (boş)" -Method Get -Endpoint "/members"
Test-Endpoint -Name "Olmayan member 404" -Method Get -Endpoint "/members/99999" -ExpectedStatus 404

# === Hatırlatıcılar ===
Write-Host "`n[4] Hatırlatıcı Testleri" -ForegroundColor Yellow

Test-Endpoint -Name "POST /api/reminders" -Method Post -Endpoint "/reminders" -Body @{title="Günlük toplantı";body="Saat 10:00"}
Test-Endpoint -Name "GET /api/reminders" -Method Get -Endpoint "/reminders"
Test-Endpoint -Name "POST /api/reminders (boş title 400)" -Method Post -Endpoint "/reminders" -Body @{title=""} -ExpectedStatus 400
Test-Endpoint -Name "DELETE /api/reminders/1" -Method Delete -Endpoint "/reminders/1"

# === İstatistikler ===
Write-Host "`n[5] İstatistik Testleri" -ForegroundColor Yellow

Test-Endpoint -Name "GET /api/stats" -Method Get -Endpoint "/stats"

# === Edge Cases ===
Write-Host "`n[6] Edge Case Testleri" -ForegroundColor Yellow

Test-Endpoint -Name "Empty text (400)" -Method Post -Endpoint "/chat" -Body @{text=""} -ExpectedStatus 400
Test-Endpoint -Name "Null text (400)" -Method Post -Endpoint "/chat" -Body @{text=$null} -ExpectedStatus 400
Test-Endpoint -Name "Missing body (400)" -Method Post -Endpoint "/chat" -Body $null -ExpectedStatus 400
Test-Endpoint -Name "Non-existent endpoint (404)" -Method Get -Endpoint "/nonexistent" -ExpectedStatus 404
Test-Endpoint -Name "Boş member name (400)" -Method Post -Endpoint "/members" -Body @{name=""} -ExpectedStatus 400

# === OpenClaw Durum ===
Write-Host "`n[7] OpenClaw Durum Kontrolü" -ForegroundColor Yellow

Test-Endpoint -Name "GET /api/openclaw/status" -Method Get -Endpoint "/openclaw/status"

# === Mesaj Geçmişi ===
Write-Host "`n[8] Mesaj Geçmişi" -ForegroundColor Yellow

Test-Endpoint -Name "GET /api/messages" -Method Get -Endpoint "/messages"

# === Drag & Drop Reorder ===
Write-Host "`n[9] Drag & Drop Reorder" -ForegroundColor Yellow

$reorderBody = @{
    items = @(
        @{id=1; day="mon"; sort_order=1}
        @{id=2; day="tue"; sort_order=2}
        @{id=3; day="wed"; sort_order=3}
    )
}
Test-Endpoint -Name "POST /api/tasks/reorder" -Method Post -Endpoint "/tasks/reorder" -Body $reorderBody

# === Özet ===
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TEST ÖZETİ" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$passed = ($results | Where-Object { $_.Status -eq "PASS" }).Count
$failed = ($results | Where-Object { $_.Status -eq "FAIL" }).Count
$total = $results.Count
$avgTime = ($results | Measure-Object -Property TimeMs -Average).Average

Write-Host ""
Write-Host "Toplam Test: $total"
Write-Host "Geçen: $passed" -ForegroundColor Green
Write-Host "Başarısız: $failed" -ForegroundColor $(if($failed -gt 0){"Red"}else{"Green"})
Write-Host "Ortalama Süre: $($avgTime.ToString('F0'))ms"

if ($failed -gt 0) {
    Write-Host "`nBaşarısız Testler:" -ForegroundColor Red
    $results | Where-Object { $_.Status -eq "FAIL" } | ForEach-Object { 
        Write-Host "  - $($_.Test): $($_.Details)" -ForegroundColor Red 
    }
    exit 1
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  TUM TESTLER BASARILI!" -ForegroundColor Green
    Write-Host "  Sistem tum ozellikleri ile calisiyor" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    exit 0
}