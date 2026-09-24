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
- [x] **Phase 9:** SEO Map — graph, search/filter/depth, drawer, performance
- [x] **Phase 10:** Page Audit — checks, PageSpeed, recommendations; **MVP Boundary**

### Integrations & Intelligence (Phases 11–24)
- [x] **Phase 11:** PageSpeed Integration (Google API v5, Mobile vs Desktop, Core Web Vitals)
- [x] **Phase 12:** Google Search Console (Search Analytics, Sitemaps, URL Inspection)
- [x] **Phase 13:** Bing Webmaster (Bing Webmaster Tools API, IndexNow protocol, Crawl Health, Sitemaps)
### Integrations & Intelligence (Phases 11–24)
- [x] **Phase 11:** PageSpeed Integration (Google API v5, Mobile vs Desktop, Core Web Vitals)
- [x] **Phase 12:** Google Search Console (Search Analytics, Sitemaps, URL Inspection)
- [x] **Phase 13:** Bing Webmaster (Bing Webmaster Tools API, IndexNow protocol, Crawl Health, Sitemaps)
- [x] **Phase 14:** Keyword Tracking (Rank tracking, SERP positions, volatility, tagging, desktop vs mobile)
- [x] **Phase 15:** SERP Integration (Multi-engine SERP matrix, PAA accordions, Google Sensor/Weather volatility radar, feature opportunity roadmap, pixel sandbox, deep-linking)
- [x] **Phase 16:** Competitor Discovery (Organic competitors matrix, 2D positioning scatter quadrant, head-to-head battles, displacement radar, custom tracking)
- [x] **Phase 18:** Backlinks (Domain Rating DR/UR, Backlink Explorer, Referring Domains, Anchor Text Cloud, Competitor Link Intersect, Google Disavow Generator)
- [x] **Phase 19:** Content Analysis (6 Readability formulas, NLP entities, TF-IDF terms, scannability auditor, live copywriting studio) — Section 6 Complete!
- [x] **Phase 20:** GEO / Local SEO (Geo-grid 3x3/5x5 rankings, Google Local 3-Pack simulator, NAP citations consistency, LocalBusiness schema builder & validator, and hyper-local proximity keywords)
- [ ] **Phases 21–24:** AEO, AI Visibility, AI Assistant, Recommendations Engine

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
| **ADR-011** | 2026-09-22 | Dual-Mode Canvas SEO Architecture Map with Velocity Verlet Physics & Radial Concentric Layout | Enables technical exploration of site hierarchy, internal PageRank equity, crawl depth tiers, and orphan page detection at 60 FPS with auto-damped idle CPU consumption. | ✅ Accepted |
| **ADR-012** | 2026-09-22 | Unified Page Audit Engine with Core Web Vitals (LCP, INP, CLS) & Quantified Action Plan | Connects DOM extraction AST with deterministic technical rules, Google 2026 Core Web Vitals thresholds, and an actionable remediation roadmap with copyable code snippets, establishing the platform's core MVP boundary. | ✅ Accepted |
| **ADR-013** | 2026-09-22 | Live Google PageSpeed Insights v5 API Integration with Mobile vs Desktop Strategies | Connects to Google's official PageSpeed API using authenticated API key for real-time Lighthouse 13.4.1 audits, Core Web Vitals extraction (FCP, LCP, TBT, CLS), strategy comparative deltas, and persistent audit history. | ✅ Accepted |
| **ADR-014** | 2026-09-22 | Google Search Console API Integration with Search Analytics, Sitemaps & URL Inspection | Connects GSC API contracts with domain property selection, time-series performance timeline, query/landing page drilldowns, device/geographic distribution, sitemap submission, and real-time Googlebot URL indexation inspection. | ✅ Accepted |
| **ADR-015** | 2026-09-22 | Bing Webmaster Tools & IndexNow Instant Indexation Protocol | Integrates Bing Webmaster API contracts with authenticated key, IndexNow instant batch URL publishing engine, crawl error telemetry, and Bing sitemap synchronization, completing Section 4: External Search Integrations. | ✅ Accepted |
| **ADR-016** | 2026-09-22 | Server-Side Crawler API Architecture & SSRF Guard (`/api/fetch` & `/api/audit`) | Moves all external website HTML fetching to server-side Node.js middleware, resolving browser CORS restrictions, auto-sanitizing URL typos (`https:///`), and guarding against SSRF (loopback, private subnets, cloud metadata 169.254.169.254). | ✅ Accepted |
| **ADR-017** | 2026-09-22 | Keyword Tracking Engine with 14-Day Trajectories, Intent Attribution & SERP Feature Mapping | Delivers rank tracking, historical trajectory visualizer, search intent classification, tag grouping, and mobile vs desktop tracking, inaugurating Section 5: Keyword & Competitive Intelligence. | ✅ Accepted |
| **ADR-018** | 2026-09-22 | Multi-Engine SERP Intelligence, Algorithmic Volatility Radar & Pixel-Accurate Sandbox | Implements server-side `/api/serp` endpoint, multi-engine (Google, Bing) organic ranking matrices with 2026 CTR curves, interactive PAA accordions, 0–10 algorithm volatility weather sensor, feature capture roadmap, pixel-width calculation meters (580px/990px), and bidirectional deep-linking with Keyword Tracking. | ✅ Accepted |
| **ADR-019** | 2026-09-22 | Automated Organic Competitor Discovery, 2D Positioning Quadrant & SERP Displacement Engine | Integrates `/api/competitors` endpoint, automatic competitor discovery derived from SERP rankings, 2D logarithmic positioning quadrant visualizer (Keywords vs Traffic), side-by-side head-to-head confrontation audits, and fragile ranking displacement playbooks with cross-tab SERP deep-linking. | ✅ Accepted |
| **ADR-020** | 2026-09-22 | Two-Tier Workspace Navigation, Active Project Switcher & Spotlight Command Palette (⌘K) | Restructures flat 18-button navbar into 4 high-density workspace domains (Audits & Core, Search Integrations, Keywords & Competitors, Developer Tools) with a dynamic contextual sub-nav ribbon, active project selector pill (posterscraft.com), global Spotlight Command Palette (Ctrl+K/⌘K), and refined SaaS card styling with specular rim lighting. | ✅ Accepted |
| **ADR-021** | 2026-09-22 | Multi-Domain Keyword Gap Engine & Content Arbitrage Pipeline | Delivers `/api/keyword-gap` endpoint comparing target domain against up to 4 rivals across 4 gap segments (Missing, Weak, Strong, Shared), visual Venn overlap distributions, high-ROI low-KD arbitrage quick wins, 1-click Phase 14 tracker synchronization, and CSV/JSON strategy exports, completing Section 5. | ✅ Accepted |
| **ADR-022** | 2026-09-23 | Enterprise Backlinks Engine, Authority Scoring & Google Disavow Generator | Delivers `/api/backlinks` endpoint, logarithmic DR/UR scoring, 12-month acquisition velocity timeline, full backlink explorer with context snippet highlight, root referring domains matrix, Penguin-compliant anchor text distribution, competitor link gap intersect, and Google Search Console disavow.txt generator, inaugurating Section 6: Authority & Content. | ✅ Accepted |
| **ADR-023** | 2026-09-23 | Semantic Content Analysis, Multi-Index Readability & Live NLP Optimizer | Implements `/api/content-analysis` endpoint, 6 readability formulas (Flesch, Fog, SMOG, Coleman-Liau, ARI, FK Grade), named entity salience scoring, TF-IDF term recommendation engine, wall-of-text scannability audit, and real-time interactive copywriting editor with dynamic score calculation, completing Section 6: Authority & Content. | ✅ Accepted |
| **ADR-024** | 2026-09-24 | GEO / Local SEO Intelligence Suite, Interactive Geo-Grid & Google Local 3-Pack Simulator | Delivers `/api/geo` endpoint, multi-density geo-grid tracking (3x3 / 5x5), distance decay calculations, Google 3-Pack SERP preview with weighted ranking factors, multi-directory citation consistency auditor (GBP, Bing Places, Apple Maps, Justdial, Sulekha, Indiamart, Yelp), LocalBusiness JSON-LD schema builder with live syntax validation, and Spotlight Command Palette integration, inaugurating Section 7: AI & Future-Ready Search. | ✅ Accepted |

---

## 5. Changelog & Session Log
- **2026-09-21 (Session 1):**
  - Completed Phase 0 through Phase 10. Core MVP Boundary Reached.
- **2026-09-22 (Session 2):**
  - Completed Phase 11 through Phase 17. Section 4 & Section 5 Complete.
- **2026-09-23 (Session 3):**
  - Completed Phase 18 (Backlinks) and Phase 19 (Content Analysis). Section 6 Complete.
- **2026-09-24 (Session 4):**
  - Inaugurated **Section 7: AI & Future-Ready Search**.
  - Added new Header Navigation Workspace Domain: **AI & Future Search** (`ai`) housing GEO & Local SEO Studio (`geo`), with badge "Phase 20".
  - Completed **Phase 20 (GEO / Local SEO)**:
    - Server API: `/api/geo` endpoint with support for custom targets, coordinate grids, distance decay, and local packs.
    - Interactive 3x3 and 5x5 Geo-Grid rank tracker with customizable search radius (1km - 25km), pin selection, and competitor displacement rankings.
    - Google Local 3-Pack SERP preview simulator with review rating badges, distance markers, business details, and weighted ranking factor audit.
    - Citation Consistency Matrix auditing 10 major directories (GBP, Bing Places, Apple Maps, Justdial, Sulekha, IndiaMART, Facebook, Yelp, YellowPages, Tripadvisor) with status filters and remediation action items.
    - LocalBusiness JSON-LD Schema Studio with live syntax validation, opening hours, geographic coordinates, social sameAs links, and 1-click clipboard export.
    - Hyper-local keyword tracking table covering proximity and neighborhood search intents.
    - Global Spotlight Command Palette (⌘K / Ctrl+K) integration with `AI & Future Search` category and `geo` action.
  - Verified live in browser with video recording (`geo_local_seo_demo_1790273543940.webp`) and screenshot (`geo_seo_overview_1790273659989.png`).
  - Production build passed cleanly with `tsc && vite build` (0 type errors).
  - Ready for Phase 21: AEO (Answer Engine Optimization).





