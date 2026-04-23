# Roadmap: Dernek İş Yönetimi

## Overview
Build a claymorphism-styled association business management web app with member dashboard, dues tracking, profile management, and quick actions — all delivered through a React/Vite frontend with Express backend and SQLite database.

## Phases

- [ ] **Phase 1: Foundation & Design System** - Establish claymorphism design tokens and component library
- [ ] **Phase 2: Dashboard & Navigation** - Build home screen with 5-tab bottom navigation
- [ ] **Phase 3: Dues Management** - Implement aidat tracking with payment history
- [ ] **Phase 4: Profile & Settings** - Member profile and account configuration
- [ ] **Phase 5: Quick Actions & Polish** - Fast action center and UX refinements

## Phase Details

### Phase 1: Foundation & Design System
**Goal**: Set up claymorphism design system and core layout infrastructure
**Depends on**: Nothing (first phase)
**Requirements**: [UI-01, UI-02, UI-03]
**Success Criteria** (what must be TRUE):
  1. Color palette, typography, and spacing scale defined in Tailwind config
  2. Claymorphic card and button components render correctly in both light and dark mode
  3. Base layout with header and tab bar frame is functional
**Plans**: 2 plans

Plans:
- [ ] 01-01: Configure Tailwind design tokens (colors, typography, spacing, shadows)
- [ ] 01-02: Build claymorphic component library (cards, buttons, inputs, chips, tab bar)

### Phase 2: Dashboard & Navigation
**Goal**: Build the main dashboard with 5-tab bottom navigation
**Depends on**: Phase 1
**Requirements**: [NAV-01, DASH-01, DASH-02]
**Success Criteria** (what must be TRUE):
  1. Bottom tab bar with 5 tabs renders and is responsive
  2. Dashboard displays dues summary, events, and announcements cards
  3. Tab navigation preserves state when switching
**Plans**: 2 plans

Plans:
- [ ] 02-01: Implement bottom tab bar navigation component
- [ ] 02-02: Build dashboard screen with overview cards and announcements

### Phase 3: Dues Management
**Goal**: Full aidat (dues) management with payment tracking
**Depends on**: Phase 2
**Requirements**: [DUES-01, DUES-02, DUES-03]
**Success Criteria** (what must be TRUE):
  1. Monthly payment plan displays paid/pending/overdue status with claymorphic indicators
  2. Payment history shows date, amount, and method for each transaction
  3. Total outstanding balance displayed prominently with payment CTA button
**Plans**: 1 plan

Plans:
- [ ] 03-01: Build dues management screen with payment plan, history, and balance display

### Phase 4: Profile & Settings
**Goal**: Member profile screen with account management
**Depends on**: Phase 2
**Requirements**: [PROF-01, PROF-02]
**Success Criteria** (what must be TRUE):
  1. Profile displays avatar, name, membership number, and join date in claymorphic card
  2. Settings page includes notification, security, and app preferences
  3. Logout button functions correctly
**Plans**: 1 plan

Plans:
- [ ] 04-01: Build profile and settings screens with membership info and configuration options

### Phase 5: Quick Actions & Polish
**Goal**: Quick action center and final UX refinements
**Depends on**: Phase 3, Phase 4
**Requirements**: [QA-01, UX-01, UX-02]
**Success Criteria** (what must be TRUE):
  1. Quick action center renders 6 claymorphic action buttons in a responsive grid
  2. All screen transitions use 250ms ease-out animations
  3. No visual regressions across all screens in both light and dark modes
**Plans**: 1 plan

Plans:
- [ ] 05-01: Build quick action grid and add animations, loading states, and final polish

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Design System | 0/2 | Not started | - |
| 2. Dashboard & Navigation | 0/2 | Not started | - |
| 3. Dues Management | 0/1 | Not started | - |
| 4. Profile & Settings | 0/1 | Not started | - |
| 5. Quick Actions & Polish | 0/1 | Not started | - |
