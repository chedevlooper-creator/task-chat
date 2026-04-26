# Project: Dernek İş Yönetimi (Association Business Management)

## What This Is
A weekly planner with openclaw chat bridge, featuring a mobile-optimized association business management app with claymorphism design. The project includes a React/Vite frontend, Express backend, and SQLite database.

## Core Value
Members can manage their association activities — view dues status, make payments, track transactions, and access association services through a beautiful claymorphic mobile interface.

## Context
- **Stack:** React 18, Vite, Express 5, SQLite (better-sqlite3), TailwindCSS, TypeScript
- **UI Style:** Claymorphism (soft, 3D, playful)
- **Platform:** Mobile-first web app (iOS & Android via PWA)
- **State:** Existing codebase with server.js, src/, design-system/, tailwind.config.js
- **Language:** Turkish (user-facing content)

## Requirements

### Validated
- ✓ Express backend with SQLite database — existing
- ✓ React/Vite frontend with TailwindCSS — existing
- ✓ TypeScript configuration — existing
- ✓ Build pipeline (vite) — existing

### Active
- [ ] Bottom tab navigation (5 tabs)
- [ ] Claymorphism design system implementation
- [ ] Dark mode support

### Out of Scope
- Dashboard (Ana Sayfa) with member overview, dues status, announcements
- Quick Action Center (Yeni) for rapid task access
- Dues Management (Aidat) screen with payment tracking
- Profile screen with settings and membership info
- Native iOS/Android apps (PWA approach only)
- Payment gateway integration (manual tracking for v1)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Claymorphism design | Soft, approachable feel for association members | Selected |
| PWA over native | Faster iteration, single codebase | Selected |
| Turkish language | Primary user base | Selected |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-23 after initialization*
