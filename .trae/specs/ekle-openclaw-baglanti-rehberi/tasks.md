# Tasks
- [x] Task 1: Sunucuya OpenClaw durum endpoint’i ekle
  - [x] `GET /api/openclaw/status` endpoint’ini tanımla
  - [x] Eksik gereksinimleri (flag/token) ve kullanılan gateway/agent değerlerini güvenli şekilde üret
  - [x] Hassas veri (token) sızıntısı olmadığını garanti et

- [x] Task 2: Frontend query ekle ve ChatPanel’e bağla
  - [x] `useOpenclawStatus` query’si ekle
  - [x] ChatPanel header/empty state içinde “kurulum rehberi” bölümü göster
  - [x] Hata durumlarında (send.isError / server code -1) rehbere yönlendirme ekle

- [x] Task 3: Test ve doğrulama
  - [x] Sunucu endpoint’i için vitest node test ekle (token sızıntısı kontrolü dahil)
  - [x] `npm test` ve `npm run build` ile doğrula

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 depends on Task 1 and Task 2
