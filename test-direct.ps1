$headers = @{
    'Authorization' = 'Bearer e2869008d26c5d4d8d39c495fe35377550af2d4723b0afdf'
    'Content-Type' = 'application/json'
}
$body = @{
    model = 'openclaw/default'
    messages = @(
        @{
            role = 'user'
            content = 'Merhaba!'
        }
    )
    stream = $false
} | ConvertTo-Json
Invoke-RestMethod -Uri 'https://isa-delivery-guestbook-meters.trycloudflare.com/v1/chat/completions' -Method Post -Headers $headers -Body $body