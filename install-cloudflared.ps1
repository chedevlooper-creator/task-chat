$ErrorActionPreference = "Stop"
$cloudflaredPath = "$env:LOCALAPPDATA\cloudflared\cloudflared.exe"
$downloadUrl = "https://github.com/cloudflare/cloudflared/releases/download/2025.1.0/cloudflared-windows-amd64.exe"

if (Test-Path $cloudflaredPath) {
    Write-Host "cloudflared already installed at $cloudflaredPath"
    & $cloudflaredPath --version
    exit 0
}

Write-Host "Downloading cloudflared..."
$downloadDir = "$env:TEMP\cloudflared-download"
New-Item -ItemType Directory -Force -Path $downloadDir | Out-Null
$downloadPath = Join-Path $downloadDir "cloudflared.exe"

try {
    Invoke-WebRequest -Uri $downloadUrl -OutFile $downloadPath -UseBasicParsing
    New-Item -ItemType Directory -Force -Path (Split-Path $cloudflaredPath) | Out-Null
    Move-Item -Path $downloadPath -Destination $cloudflaredPath -Force
    Write-Host "Installed to $cloudflaredPath"
    & $cloudflaredPath --version
} catch {
    Write-Host "Download failed: $_"
    exit 1
}