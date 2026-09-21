# Design System & UI Specifications (`DESIGN.md`)

*This document outlines the visual identity, design tokens, UI components, typography, color palette, and interaction guidelines for the SEO Platform.*

---

## 1. Visual Identity & Design Philosophy
- **Theme Concept:** *Obsidian & Cyber-Emerald* (A sleek, high-contrast dark theme with luminous emerald/cyan accents, paired with an ultra-clean crisp light mode).
- **Core Mood:** Professional, analytical, authoritative, and futuristic yet refined.
- **Visual Depth:** Multi-layered surfaces, subtle glassmorphism (`backdrop-filter: blur(12px)`), soft radial glow highlights, and 1px translucent borders.

---

## 2. Color System & Design Tokens

### 2.1 Dark Mode Palette (Default)
| Token Name | Hex / HSL | Usage |
|:---|:---|:---|
| `--bg-canvas` | `#0B0F17` | Root application background |
| `--bg-surface` | `#111827` | Primary card and panel surface |
| `--bg-surface-elevated` | `#1F2937` | Modals, dropdowns, hover states |
| `--bg-glass` | `rgba(17, 24, 39, 0.75)` | Glassmorphic overlays with blur |
| `--border-subtle` | `rgba(255, 255, 255, 0.08)` | Standard card/divider borders |
| `--border-glow` | `rgba(16, 185, 129, 0.35)` | Active state highlights & focused borders |
| `--text-primary` | `#F9FAFB` | Primary headers, values, titles |
| `--text-secondary` | `#9CA3AF` | Subtitles, labels, secondary metadata |
| `--text-muted` | `#6B7280` | Placeholders, inactive hints, footnotes |

### 2.2 Semantic & Accent Colors
| Semantic | Token | Color Value | Usage |
|:---|:---|:---|:---|
| **Primary Accent** | `--accent-primary` | `#10B981` (Emerald 500) | Main CTAs, health score meters, active tabs |
| **Secondary Accent** | `--accent-cyan` | `#06B6D4` (Cyan 500) | Crawl status, link counts, graphs |
| **Success / Passed** | `--status-success` | `#10B981` | Passed SEO audit checks |
| **Warning** | `--status-warning` | `#F59E0B` (Amber 500) | SEO warnings (e.g. missing meta desc) |
| **Critical / Error** | `--status-critical` | `#EF4444` (Rose 500) | Critical issues (e.g. 404s, broken canonicals) |
| **Informational** | `--status-info` | `#3B82F6` (Blue 500) | Notice tags, recommendations |

---

## 3. Typography Hierarchy

### 3.1 Font Families
- **Primary Body & Display:** `'Inter'`, `'Outfit'`, or system sans-serif (`system-ui, -apple-system, sans-serif`).
- **Data, Code & URLs:** `'JetBrains Mono'`, `'Fira Code'`, or monospace.

### 3.2 Scale & Weights
| Level | Size | Weight | Line Height | Letter Spacing |
|:---|:---|:---|:---|:---|
| **Display / H1** | `2.25rem (36px)` | 700 / Bold | 1.2 | `-0.025em` |
| **Page Title / H2**| `1.75rem (28px)` | 600 / Semi-Bold| 1.3 | `-0.02em` |
| **Section / H3** | `1.25rem (20px)` | 600 / Semi-Bold| 1.4 | `-0.01em` |
| **Body Large** | `1rem (16px)` | 400 / Regular | 1.5 | `normal` |
| **Body Small / Meta**| `0.875rem (14px)` | 400 / Medium | 1.5 | `normal` |
| **Caption / Badge** | `0.75rem (12px)` | 600 / Semi-Bold| 1.4 | `+0.05em` (Uppercase)|

---

## 4. Layout & Grid System
- **Maximum Width:** `1440px` for desktop dashboard views.
- **Spacing Scale:** Multiples of 4px / 8px (`8px`, `16px`, `24px`, `32px`, `48px`, `64px`).
- **Responsive Breakpoints:**
  - **Mobile (`sm`):** `< 640px` (Single-column layout, bottom-sheet menus).
  - **Tablet (`md`):** `640px - 1024px` (2-column metric grid, collapsible sidebar).
  - **Desktop (`lg`):** `> 1024px` (Full 3-4 column grid, persistent sidebar, sticky URL inspector).

---

## 5. Component Library Specifications

### 5.1 Real-Time URL Inspector & Audit Bar
- Sleek search-style input with prefix protocol pill (`https://`), dynamic clear button, and an animated **"Scan Page"** CTA button with emerald gradient hover.

### 5.2 SEO Health Score Gauge
- Circular progress meter (0-100%) with dynamic color interpolation:
  - `90 - 100%`: 🟢 Vibrant Emerald (`#10B981`)
  - `70 - 89%`: 🟡 Warm Amber (`#F59E0B`)
  - `< 70%`: 🔴 Rose Red (`#EF4444`)

### 5.3 Issue & Recommendation Cards
- Grouped by severity: **Critical Blockers**, **Warnings & Opportunities**, **Passed Checks**.
- Collapsible cards featuring:
  - Issue Title & Category Tag.
  - "Why it matters" explanation.
  - "How to fix" step-by-step code snippet / guideline.

### 5.4 Data Tables (Keywords, Links, Assets)
- Sticky headers, zebra-striping with translucent hover highlights, column sorting, and instant fuzzy search filtering.

---

## 6. Micro-Interactions & Animation
- **Hover Transitions:** `transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1)`.
- **Card Hover:** Subtle elevation lift (`translateY(-2px)`) + delicate glow border (`box-shadow: 0 0 15px rgba(16, 185, 129, 0.15)`).
- **Scanning Animation:** Pulsing radar-line effect along the audit progress bar.
