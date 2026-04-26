$headers = @{
    'Content-Type' = 'application/json'
}
$body = @{
    text = 'Merhaba! Kimsin?'
} | ConvertTo-Json
Invoke-RestMethod -Uri 'http://127.0.0.1:3000/api/chat' -Method Post -Headers $headers -Body $body