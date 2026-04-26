# OpenClaw Bağlantı Rehberi Spec

## Why
OpenClaw sohbeti yalnızca belirli ortam değişkenleri ve Gateway ayarları doğruysa çalışıyor; kullanıcılar “neden çalışmıyor?” durumunda hızlı teşhis ve doğru kurulum adımlarına ihtiyaç duyuyor.

## What Changes
- Sunucu OpenClaw durumunu (etkin mi, hangi ayar eksik) güvenli şekilde döndüren bir endpoint sağlayacak.
- Chat paneli, OpenClaw devre dışıyken veya bağlantı hatasında kullanıcıya kurulum adımlarını ve tanılamayı gösterecek.
- **BREAKING** Yok.

## Impact
- Affected specs: OpenClaw bağlantısı görünürlüğü, tanılama, kullanıcı yönlendirme
- Affected code: server.js (yeni endpoint), src/lib/queries.ts (yeni query), src/components/ChatPanel.tsx (UI), server/openclawBridge.js (env bilgisini sızdırmayan yardımcı)

## ADDED Requirements
### Requirement: OpenClaw Durum Endpoint’i
Sistem, OpenClaw bağlantı durumunu ve eksik ayarları token sızdırmadan döndürmelidir.

#### Scenario: Başarılı durum sorgusu
- **WHEN** istemci `GET /api/openclaw/status` çağırır
- **THEN** yanıt JSON içinde en az şu alanlar döner:
  - `enabled`: boolean (OpenClaw agent etkin mi)
  - `missing`: string[] (eksik gereksinimler; örn. `TASK_CHAT_ENABLE_OPENCLAW_AGENT`, `OPENCLAW_GATEWAY_TOKEN`)
  - `gateway_url`: string (maskelenmiş veya varsayılan; token içermez)
  - `agent`: string (varsayılan dahil)

#### Scenario: Token gizliliği
- **WHEN** istemci durum endpoint’ini çağırır
- **THEN** yanıt hiçbir şekilde `OPENCLAW_GATEWAY_TOKEN` değerini veya türetilmiş hassas bilgiyi içermez.

### Requirement: Chat Panelinde Kurulum Rehberi
Sistem, OpenClaw devre dışıyken chat panelinde kısa bir “Nasıl kurulur?” rehberi göstermelidir.

#### Scenario: OpenClaw devre dışı
- **WHEN** kullanıcı chat panelini açar ve OpenClaw etkin değildir
- **THEN** panel, kurulum için gerekli ortam değişkenlerini ve gateway tarafındaki gerekli ayarı listeler.

#### Scenario: Bağlantı hatası
- **WHEN** kullanıcı mesaj gönderir ve sunucu OpenClaw gateway’e erişemez / yetkilendirme hatası alır
- **THEN** panel, hata mesajına ek olarak kullanıcıyı aynı kurulum rehberine yönlendirir.

## MODIFIED Requirements
### Requirement: Chat Yanıtı Fallback’ı
Mevcut `POST /api/chat` davranışı korunmalı; OpenClaw devre dışıyken lokal komutlar çalışmalı ve açıklayıcı fallback yanıt döndürmelidir.

## REMOVED Requirements
### Requirement: Yok
**Reason**: Mevcut davranışlar korunuyor.
**Migration**: Yok.

