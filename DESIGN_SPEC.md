# UI Design Specification — Dernek İş Yönetimi Mobile App

> **Style:** Claymorphism (soft, playful, 3D)
> **Domain:** Association / Club Business Management
> **Platform:** Mobile (iOS & Android)

---

## 1. Design Tokens

### Color Palette

| Role | Light | Dark |
|------|-------|------|
| Primary | `#6C5CE7` | `#8B7CF7` |
| Secondary | `#00B894` | `#00D6A4` |
| Accent / CTA | `#FDCB6E` | `#FFEAA7` |
| Background | `#F0EDFF` | `#1A1A2E` |
| Surface | `#FFFFFF` | `#252540` |
| Text Primary | `#2D3436` | `#EAEAEA` |
| Text Secondary | `#636E72` | `#A0A0B0` |
| Border / Clay | `#DFE6E9` | `#353550` |
| Success | `#00B894` | `#00D6A4` |
| Warning | `#F39C12` | `#FDCB6E` |
| Error | `#E17055` | `#FF7675` |
| Info | `#0984E3` | `#74B9FF` |

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| H1 | Space Grotesk | 28px | 700 |
| H2 | Space Grotesk | 22px | 600 |
| H3 | Space Grotesk | 18px | 600 |
| Body | Inter | 16px | 400 |
| Body Bold | Inter | 16px | 600 |
| Caption | Inter | 12px | 400 |
| Button | Space Grotesk | 14px | 600 |

**Font Pairing:** Space Grotesk (headings) + Inter (body)
**Rationale:** Space Grotesk's geometric quirks pair beautifully with Claymorphism's soft 3D aesthetic. Inter provides excellent readability at small sizes on mobile.

### Spacing Scale

```
4px   — micro spacing (icon gaps)
8px   — tight spacing (list items)
12px  — small spacing (form fields)
16px  — base spacing (card padding)
24px  — medium spacing (section gaps)
32px  — large spacing (page margins)
48px  — hero spacing
```

### Border Radius

| Element | Radius |
|---------|--------|
| Cards / Clay Blocks | 20px |
| Buttons | 16px |
| Input Fields | 14px |
| Chips / Tags | 12px |
| Avatars | 50% (circle) |

### Shadows (Claymorphism)

```css
/* Primary shadow — floating clay effect */
.clay-shadow {
  box-shadow:
    8px 8px 16px rgba(108, 92, 231, 0.15),
   -8px -8px 16px rgba(255, 255, 255, 0.8);
}

/* Inset shadow — pressed clay effect */
.clay-inset {
  box-shadow:
    inset 4px 4px 8px rgba(108, 92, 231, 0.1),
    inset -4px -4px 8px rgba(255, 255, 255, 0.6);
}

/* Elevated clay — buttons */
.clay-button {
  box-shadow:
    6px 6px 12px rgba(108, 92, 231, 0.2),
   -6px -6px 12px rgba(255, 255, 255, 0.9);
}
.clay-button:active {
  box-shadow:
    inset 3px 3px 6px rgba(108, 92, 231, 0.2),
    inset -3px -3px 6px rgba(255, 255, 255, 0.5);
}
```

---

## 2. App Structure

### Navigation Pattern: Bottom Tab Bar + Top Header

```
┌─────────────────────────────────┐
│  👋 Merhaba, Ahmet              │  ← Top Header
│  Dernek No: 2024-0847           │
│                         [🔔] [⚙]│
├─────────────────────────────────┤
│                                 │
│     [    SCREEN CONTENT    ]    │
│     [                          ]│
│     [                          ]│
│                                 │
├─────────────────────────────────┤
│  🏠    📋    ➕    💰    👤     │  ← Bottom Tab Bar
│ AnaSayfa İşlemler Yeni  Aidat Profil│
└─────────────────────────────────┘
```

### Tab Structure

| Icon | Label | Screen |
|------|-------|--------|
| 🏠 | Ana Sayfa | Dashboard overview (Kaldırıldı) |
| 📋 | İşlemler | Transaction history |
| ➕ | Yeni | Quick action FAB (Kaldırıldı) |
| 💰 | Aidat | Membership dues (Kaldırıldı) |
| 👤 | Profil | User profile & settings (Kaldırıldı) |

---

## 3. Screen Specifications

### 3.1 Dashboard (Ana Sayfa)

**Layout:**
```
┌─────────────────────────────────┐
│ 👋 Merhaba, Ahmet Bey           │
│ Dernek No: 2024-0847      [🔔]  │
├─────────────────────────────────┤
│  ┌──────────────┐ ┌──────────┐  │
│  │  Aidat Borcu │ │ Son Ödeme│  │
│  │   ₺1,200    │ │ 15 May   │  │
│  │  🔴 Acil    │ │  ✅ Ödendi│  │
│  └──────────────┘ └──────────┘  │
│  ┌──────────────┐ ┌──────────┐  │
│  │  Aidat Durumu│ │ Etkinlik │  │
│  │   10/12 ✅   │ │   3      │  │
│  │  🟢 Tamam   │ │  📅 Yakın│  │
│  └──────────────┘ └──────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │  📊 Aylık Özet            │  │
│  │  ┌─────────────────────┐  │  │
│  │  │  [Clay Chart Card]  │  │  │
│  │  │  Aidat Ödemeleri     │  │  │
│  │  │  ████████░░ 83%     │  │  │
│  │  └─────────────────────┘  │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │  📢 Duyurular             │  │
│  │  ───────────────────────  │  │
│  │  📌 Genel Kurul Toplantısı│  │
│  │     25 Nisan 2025         │  │
│  │  ───────────────────────  │  │
│  │  📌 Ramazan İftar Programı│  │
│  │     18 Mart 2025          │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

**Clay Cards:**
- 4 summary cards in 2x2 grid, each with distinct icon, large number, status badge
- Chart card spans full width with progress visualization
- Announcements card with divider-separated list items

### 3.2 Quick Action Center (Yeni)

**Layout:**
```
┌─────────────────────────────────┐
│        Hızlı İşlemler           │
├─────────────────────────────────┤
│                                 │
│    ┌─────┐  ┌─────┐  ┌─────┐    │
│    │ 💳  │  │ 📝  │  │ 📄  │    │
│    │Aidat│  │Üyelik│  │İzin │    │
│    │ Öde │  │ Başv │  │ Al  │    │
│    └─────┘  └─────┘  └─────┘    │
│                                 │
│    ┌─────┐  ┌─────┐  ┌─────┐    │
│    │ 📞  │  │ 🎯  │  │ 📊  │    │
│    │Destek│ │Etkin│  │Rapor│    │
│    │ Talep│ │ Kayıt│  │ İste│    │
│    └─────┘  └─────┘  └─────┘    │
│                                 │
├─────────────────────────────────┤
│        [  Borç Sorgula  ]       │
└─────────────────────────────────┘
```

**Clay Buttons:**
- 3x2 grid of large claymorphism action buttons
- Each: icon centered at top, label below, subtle inner glow
- Full-width CTA button at bottom in primary color

### 3.3 Aidat (Dues) Screen

**Layout:**
```
┌─────────────────────────────────┐
│        Aidat Durumu             │
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │
│  │   Toplam Borç: ₺1,200     │  │
│  │   Son Ödeme: 15 May 2025  │  │
│  │   [       ÖDE        ]    │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │  Ödeme Planı              │  │
│  │  ───────────────────────  │  │
│  │  ✅ Ocak 2025   ₺100     │  │
│  │  ✅ Şubat 2025  ₺100     │  │
│  │  ✅ Mart 2025   ₺100     │  │
│  │  ⏳ Nisan 2025  ₺100     │  │
│  │  ⬜ Mayıs 2025  ₺100     │  │
│  │  ⬜ Haziran 2025 ₺100     │  │
│  │  ...                      │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │  Ödeme Geçmişi            │  │
│  │  ───────────────────────  │  │
│  │  01.03.2025  ₺100  Kredi  │  │
│  │  01.02.2025  ₺100  Havale │  │
│  │  01.01.2025  ₺100  Nakit  │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

### 3.4 Profil (Profile) Screen

**Layout:**
```
┌─────────────────────────────────┐
│        Profil                   │
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │
│  │   [  Avatar  ]            │  │
│  │   Ahmet Yılmaz            │  │
│  │   Üye No: 2024-0847       │  │
│  │   Üyelik: 2020'den beri   │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │  ⚙️  Hesap Ayarları       │  │
│  │  🔔  Bildirim Tercihleri  │  │
│  │  🔒  Güvenlik             │  │
│  │  📧  E-posta Bildirimleri │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │  📋  Üyelik Bilgileri     │  │
│  │  🏛️  Dernek Yönetimi      │  │
│  │  ❓  Yardım & Destek      │  │
│  │  📱  Uygulama Hakkında    │  │
│  └───────────────────────────┘  │
│                                 │
│      [   Çıkış Yap   ]         │
└─────────────────────────────────┘
```

---

## 4. Component Library

### 4.1 Clay Cards

```css
.clay-card {
  background: linear-gradient(145deg, #FFFFFF, #F0EDFF);
  border-radius: 20px;
  padding: 16px;
  box-shadow:
    8px 8px 16px rgba(108, 92, 231, 0.12),
   -8px -8px 16px rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.6);
}
```

### 4.2 Clay Buttons

```css
.clay-btn-primary {
  background: linear-gradient(145deg, #6C5CE7, #8B7CF7);
  color: #FFFFFF;
  border-radius: 16px;
  padding: 14px 24px;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
  font-size: 14px;
  border: none;
  box-shadow:
    6px 6px 12px rgba(108, 92, 231, 0.25),
   -6px -6px 12px rgba(255, 255, 255, 0.7);
  transition: all 0.2s ease;
}
.clay-btn-primary:active {
  box-shadow:
    inset 4px 4px 8px rgba(80, 60, 180, 0.3),
    inset -4px -4px 8px rgba(140, 125, 247, 0.3);
}
```

### 4.3 Input Fields

```css
.clay-input {
  background: linear-gradient(145deg, #F8F7FF, #FFFFFF);
  border: 1px solid #DFE6E9;
  border-radius: 14px;
  padding: 12px 16px;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  box-shadow:
    inset 3px 3px 6px rgba(108, 92, 231, 0.06),
    inset -3px -3px 6px rgba(255, 255, 255, 0.8);
}
.clay-input:focus {
  border-color: #6C5CE7;
  box-shadow:
    inset 3px 3px 6px rgba(108, 92, 231, 0.1),
    0 0 0 3px rgba(108, 92, 231, 0.15);
}
```

### 4.4 Status Chips

```css
.chip-success {
  background: linear-gradient(145deg, #00B894, #00D6A4);
  color: #FFFFFF;
  border-radius: 12px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
}
.chip-warning {
  background: linear-gradient(145deg, #F39C12, #FDCB6E);
  color: #2D3436;
}
.chip-error {
  background: linear-gradient(145deg, #E17055, #FF7675);
  color: #FFFFFF;
}
```

### 4.5 Bottom Tab Bar

```css
.tab-bar {
  background: linear-gradient(180deg, #FFFFFF, #F0EDFF);
  border-radius: 24px 24px 0 0;
  padding: 8px 0 24px;
  box-shadow: 0 -4px 20px rgba(108, 92, 231, 0.08);
  display: flex;
  justify-content: space-around;
}
.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border-radius: 12px;
  transition: all 0.2s ease;
}
.tab-item.active {
  background: linear-gradient(145deg, #6C5CE7, #8B7CF7);
  color: #FFFFFF;
  box-shadow: 4px 4px 8px rgba(108, 92, 231, 0.2);
}
```

---

## 5. UX Guidelines

### Do's
- Use soft, pillowy claymorphism cards for all content containers
- Apply generous white space between elements
- Use gradient backgrounds on buttons and cards for depth
- Include subtle hover/press animations on interactive elements
- Maintain consistent 16px border radius on all major surfaces

### Don'ts
- Avoid flat, material-design style cards (contradicts claymorphism)
- Don't use harsh drop shadows — keep them soft and diffuse
- Avoid thin borders — claymorphism relies on shadows, not strokes
- Don't overcrowd screens — each screen should have 1 primary action
- Avoid pure black text — use `#2D3436` for softer contrast

### Accessibility
- Minimum contrast ratio: 4.5:1 for body text
- All interactive elements minimum 44x44px touch targets
- Support dynamic type scaling
- Provide haptic feedback on button press

### Animations
- Screen transitions: 250ms ease-out
- Button press: 150ms with scale(0.97)
- Card entrance: 300ms staggered fade + slide-up
- Loading states: clay pulse animation (subtle opacity shift)

---

## 6. Icon Set

Use rounded, outlined icons (not filled) to complement claymorphism:

| Icon | Purpose |
|------|---------|
| home-outline | Dashboard tab |
| list-outline | Transactions tab |
| add-circle-outline | Quick action FAB |
| wallet-outline | Dues tab |
| person-outline | Profile tab |
| bell-outline | Notifications |
| settings-outline | Settings |
| checkmark-circle | Paid status |
| time-outline | Pending status |
| close-circle | Overdue status |

---

## 7. Dark Mode Overrides

```css
:root.dark {
  --bg-primary: #1A1A2E;
  --bg-surface: #252540;
  --bg-elevated: #2D2D4A;
  --text-primary: #EAEAEA;
  --text-secondary: #A0A0B0;
  --border-clay: #353550;
  --shadow-clay: 8px 8px 16px rgba(0, 0, 0, 0.4),
                -8px -8px 16px rgba(40, 40, 70, 0.3);
}
```

Dark mode claymorphism:
- Deeper, more pronounced shadows
- Surface cards use darker gradients
- Icons remain outlined but lighter stroke color
- Primary color shifts to lighter `#8B7CF7`

---

## 8. Recommended Tech Stack

- **React Native** or **Flutter** for cross-platform mobile
- **Tailwind** equivalent for styling (NativeWind for RN)
- **Recharts** or **Victory Native** for charts
- **React Navigation** for routing
- **Zustand** or **Riverpod** for state management

---

*Generated using UI UX Pro Max design intelligence principles*
*Style: Claymorphism | Domain: Association Management | Platform: Mobile*
