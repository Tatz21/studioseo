# Project Rules & Development Guidelines (`RULES.md`)

*These rules govern all architectural, coding, UX, and operational workflows for this repository. All contributors and AI agents must strictly adhere to these standards.*

---

## 1. Core Engineering Principles
1. **Documentation-Driven Development:**
   - Every major architecture or pattern decision must be logged in [`MEMORY.md`](file:///g:/SEO/MEMORY.md) (ADR section).
   - Keep [`README.md`](file:///g:/SEO/README.md), [`DESIGN.md`](file:///g:/SEO/DESIGN.md), and `docs/` in sync whenever features or interfaces change.
2. **Zero Incomplete Code & No Placeholders:**
   - Write fully functioning modules with realistic fallback states and robust error handling.
   - Never leave `TODO: implement later` in production paths.
3. **Type Safety & Defensive Programming:**
   - Strongly type data structures, API payloads, and crawler output.
   - Validate and sanitize all external inputs (e.g., target URLs, regex queries, file uploads).

---

## 2. Code Quality & Standards

### 2.1 File Organization & Naming
- **Directory Structure:** Group by feature domain (e.g., `src/engine/`, `src/components/`, `src/styles/`).
- **Filenames:**
  - Kebab-case or camelCase for utilities (`domParser.ts` / `scorer.ts`).
  - PascalCase for UI components (`HealthScoreGauge.tsx` / `SerpSocialPreview.tsx`).
  - Screaming snake-case for root doc references (`MEMORY.md`, `RULES.md`, `DESIGN.md`).

### 2.2 Error Handling & Resilience
- Gracefully handle network timeouts, blocked requests (403/429), and malformed DOM structures during web crawling.
- Always provide descriptive error messages to the user with actionable remediation steps.

---

## 3. UI/UX & Aesthetic Rules
- **Modern & Premium Aesthetics:**
  - Never produce bare, unstyled, or default browser layouts.
  - Apply the design system defined in [`DESIGN.md`](file:///g:/SEO/DESIGN.md) (glassmorphism, tailored palettes, dynamic states).
- **Responsive & Accessible:**
  - Mobile-first, responsive layouts across desktop, tablet, and mobile breakpoints.
  - High-contrast compliance (WCAG AA minimum) and accessible focus rings for keyboard navigation.
- **Visual Feedback:**
  - Add skeleton loaders, loading bars, and micro-animations for asynchronous scan jobs.

---

## 4. Security & Safety
1. **No Sensitive Data Exposure:** Never commit `.env` files containing API keys or private tokens.
2. **URL & Domain Guardrails:**
   - Prevent Server-Side Request Forgery (SSRF) when crawling by blocking private/local IP ranges (`127.0.0.1`, `10.x.x.x`, `192.168.x.x`, `localhost`).
   - Respect `robots.txt` directives when configured.
3. **Resource Attribution & Safety:** Verify non-destructive operations prior to executing file removals or data wipes.

---

## 5. Review & Verification Checklist
Before submitting or completing a milestone:
- [x] Code builds without errors or unhandled warnings.
- [x] Documentation (`README.md`, `MEMORY.md`, `DESIGN.md`, `RULES.md`) updated.
- [x] UI rendered with rich aesthetic standards matching `DESIGN.md`.
- [x] Error states tested (e.g., offline URL, timeout, malformed HTML).
