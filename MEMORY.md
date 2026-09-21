# Project Memory & Context (`MEMORY.md`)

*This file serves as the single source of truth for persistent project state, user preferences, architectural decisions, and development history across sessions.*

---

## 1. Project Overview
- **Project Name:** SEO Map / SEO Studio Pro
- **Root Directory:** `G:\SEO`
- **Created Date:** September 21, 2026
- **Current Status:** Executing Sequential Roadmap (Phases 0 & 1 Complete, moving to Phase 2)
- **Goal:** Build an end-to-end Enterprise SEO Map & Optimization Platform per the 42-phase roadmap.

---

## 2. Core Execution Model
- **Sequential Execution:** Every phase must be completed, tested, verified, and documented before proceeding to the next.
- **Phase Report Requirement:** Every phase concludes with the 9-point required report:
  1. Phase/status
  2. Implemented work
  3. Files/modules changed
  4. Tests
  5. Build/type-check
  6. Known issues
  7. Security concerns
  8. Migrations
  9. Next phase

---

## 3. 42-Phase Roadmap Status

### Foundations (Phases 0–4)
- [x] **Phase 0:** Project Initialization — monorepo/structure, TypeScript, environment, docs (`MEMORY.md`, `RULES.md`, `DESIGN.md`, `PHASES.md`, `docs/`)
- [x] **Phase 1:** Design System — tokens, themes, components, accessibility (`Obsidian & Cyber-Emerald` tokens, typography, glassmorphism)
- [x] **Phase 2:** Authentication — auth, sessions, protected routes (`src/auth/`, `UserProfileDropdown`, `AuthModal`)
- [x] **Phase 3:** Database Foundation — PostgreSQL, schema, migrations (`migrations/`, `src/db/`, `SchemaExplorer`)
- [x] **Phase 4:** Website Management — add site, validation, settings, crawl config

### MVP Core (Phases 5–10)
- [x] **Phase 5:** Crawler Foundation — robots, sitemap, queue, fetcher, SSRF, limits
- [x] **Phase 6:** SEO Data Extraction — metadata, headings, canonical, links, images, schema, status
- [x] **Phase 7:** Technical SEO Engine — deterministic checks and evidence
- [x] **Phase 8:** SEO Scoring Engine — weighted, versioned scoring and snapshots
- [ ] **Phase 9:** SEO Map — graph, search/filter/depth, drawer, performance
- [ ] **Phase 10:** Page Audit — checks, PageSpeed, recommendations; **MVP Boundary**

### Integrations & Intelligence (Phases 11–24)
- [ ] **Phases 11–13:** PageSpeed, Google Search Console, Bing Webmaster
- [ ] **Phases 14–17:** Keyword Tracking, SERP Integration, Competitor Discovery, Keyword Gap
- [ ] **Phases 18–19:** Backlinks, Content Analysis
- [ ] **Phases 20–24:** GEO/Local SEO, AEO, AI Visibility, AI Assistant, Recommendations Engine

### Operations & Enterprise Scale (Phases 25–42)
- [ ] **Phases 25–30:** Free Audit, Free SEO Tools, Billing, Usage Management, Reports, Notifications
- [ ] **Phases 31–36:** Analytics, Security Hardening, Performance Optimization, Large Website Testing, Accessibility, E2E
- [ ] **Phases 37–42:** Production Infra, Monitoring, Launch Prep, Launch, Post-Launch, Future Flutter App

---

## 4. Architectural Decisions Record (ADR)
| ID | Date | Decision | Rationale | Status |
|:---|:---|:---|:---|:---|
| **ADR-001** | 2026-09-21 | Establish documentation-first workflow (`MEMORY.md`, `README.md`, `docs/`) | Ensures consistent context retention and structured roadmap tracking across sessions. | ✅ Accepted |
| **ADR-002** | 2026-09-21 | Define explicit coding/security rules ([`RULES.md`](file:///g:/SEO/RULES.md)) & design tokens ([`DESIGN.md`](file:///g:/SEO/DESIGN.md)) | Guarantees code maintainability, security safety, and consistent premium UI aesthetics. | ✅ Accepted |
| **ADR-003** | 2026-09-21 | Adopt 42-Phase Sequential Implementation Roadmap ([`docs/PHASES.md`](file:///g:/SEO/docs/PHASES.md)) | Clear sequential execution with strict verification and 9-point phase reporting. | ✅ Accepted |
| **ADR-004** | 2026-09-21 | Implement modular client-side session auth with role-based access & demo presets | Enables immediate role testing (Admin, Member, Viewer) with persistent sessions without requiring external auth servers. | ✅ Accepted |
| **ADR-005** | 2026-09-21 | Establish 10-table PostgreSQL relational schema with versioned SQL migrations and in-app Schema Explorer | Guarantees rigorous relational data modeling across organizations, sites, audits, issues, and keywords with instant queryability. | ✅ Accepted |
| **ADR-006** | 2026-09-21 | Implement Domain Validation & SSRF Guard with Configurable Crawl Boundaries | Protects crawler infrastructure from accessing private/internal networks while persisting per-site crawling limits and user agents. | ✅ Accepted |
| **ADR-007** | 2026-09-21 | Breadth-First Priority Crawl Architecture with RFC 9309 Robots Parser & XML Sitemaps | Ensures polite, systematic discovery of internal page structures, respect for crawl limits/delays, and direct synchronization with relational audit tables. | ✅ Accepted |
| **ADR-008** | 2026-09-22 | Modular AST DOM Extraction Pipeline with Hierarchy Validation & Schema Validation | Isolates specialized extractors for metadata, headings, canonical, links, images, schema, and content readability with resilience against malformed markup. | ✅ Accepted |
| **ADR-009** | 2026-09-22 | Deterministic Technical SEO Rule Engine with Measured Evidence & Code Remediation | Provides pure, reproducible rule evaluations with concrete measured values vs criteria, eliminating false positives and generating code fixes. | ✅ Accepted |
| **ADR-010** | 2026-09-22 | Versioned Multi-Category SEO Scoring Algorithm with Historical Snapshots & Diff Comparison | Delivers calibrated score grades (A+ to F), transparent category weight attribution (Tech 30%, Content 25%, Media 20%, A11y 15%, Schema 10%), and time-series progress tracking. | ✅ Accepted |

---

## 5. Changelog & Session Log
- **2026-09-21 (Session 1):**
  - Completed Phase 0 (Project Initialization & Docs) and Phase 1 (Design System & Tokens).
  - Completed Phase 2 (Authentication: auth, sessions, protected routes).
  - Completed Phase 3 (Database Foundation: PostgreSQL DDL migrations, 10-table schema, in-app Schema Explorer & SQL workbench).
  - Completed Phase 4 (Website Management: add site, domain validation, SSRF guard, crawl config drawer, websites dashboard).
  - Completed Phase 5 (Crawler Foundation: robots.txt RFC 9309 parser, XML sitemap index parser, BFS priority queue, HTTP fetcher with TTFB timer, SSRF defense, and live monitor UI).
  - Completed Phase 6 (SEO Data Extraction: metadata, headings tree & hierarchy validation, canonical & hreflang, links & rel attributes, images & alt Web Vitals, Schema.org JSON-LD, and interactive Data Extraction Inspector).
  - Completed Phase 7 (Technical SEO Engine: 24 standardized deterministic rules, measured evidence collection, impact assessments, code fix templates, and Technical Audit Inspector).
  - Completed Phase 8 (SEO Scoring Engine: versioned multi-category scoring algorithm, letter grading system, snapshot store with 30-day history, snapshot comparison modal, and live snapshot capture).
  - Verified Phase 8 in browser with 0 errors.
  - Ready for Phase 9 (SEO Map — graph, search/filter/depth, drawer, performance).
