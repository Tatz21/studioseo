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
- [ ] **Phase 17:** Keyword Gap
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
| **ADR-011** | 2026-09-22 | Dual-Mode Canvas SEO Architecture Map with Velocity Verlet Physics & Radial Concentric Layout | Enables technical exploration of site hierarchy, internal PageRank equity, crawl depth tiers, and orphan page detection at 60 FPS with auto-damped idle CPU consumption. | ✅ Accepted |
| **ADR-012** | 2026-09-22 | Unified Page Audit Engine with Core Web Vitals (LCP, INP, CLS) & Quantified Action Plan | Connects DOM extraction AST with deterministic technical rules, Google 2026 Core Web Vitals thresholds, and an actionable remediation roadmap with copyable code snippets, establishing the platform's core MVP boundary. | ✅ Accepted |
| **ADR-013** | 2026-09-22 | Live Google PageSpeed Insights v5 API Integration with Mobile vs Desktop Strategies | Connects to Google's official PageSpeed API using authenticated API key for real-time Lighthouse 13.4.1 audits, Core Web Vitals extraction (FCP, LCP, TBT, CLS), strategy comparative deltas, and persistent audit history. | ✅ Accepted |
| **ADR-014** | 2026-09-22 | Google Search Console API Integration with Search Analytics, Sitemaps & URL Inspection | Connects GSC API contracts with domain property selection, time-series performance timeline, query/landing page drilldowns, device/geographic distribution, sitemap submission, and real-time Googlebot URL indexation inspection. | ✅ Accepted |
| **ADR-015** | 2026-09-22 | Bing Webmaster Tools & IndexNow Instant Indexation Protocol | Integrates Bing Webmaster API contracts with authenticated key, IndexNow instant batch URL publishing engine, crawl error telemetry, and Bing sitemap synchronization, completing Section 4: External Search Integrations. | ✅ Accepted |
| **ADR-016** | 2026-09-22 | Server-Side Crawler API Architecture & SSRF Guard (`/api/fetch` & `/api/audit`) | Moves all external website HTML fetching to server-side Node.js middleware, resolving browser CORS restrictions, auto-sanitizing URL typos (`https:///`), and guarding against SSRF (loopback, private subnets, cloud metadata 169.254.169.254). | ✅ Accepted |
| **ADR-017** | 2026-09-22 | Keyword Tracking Engine with 14-Day Trajectories, Intent Attribution & SERP Feature Mapping | Delivers rank tracking, historical trajectory visualizer, search intent classification, tag grouping, and mobile vs desktop tracking, inaugurating Section 5: Keyword & Competitive Intelligence. | ✅ Accepted |
| **ADR-018** | 2026-09-22 | Multi-Engine SERP Intelligence, Algorithmic Volatility Radar & Pixel-Accurate Sandbox | Implements server-side `/api/serp` endpoint, multi-engine (Google, Bing) organic ranking matrices with 2026 CTR curves, interactive PAA accordions, 0–10 algorithm volatility weather sensor, feature capture roadmap, pixel-width calculation meters (580px/990px), and bidirectional deep-linking with Keyword Tracking. | ✅ Accepted |
| **ADR-019** | 2026-09-22 | Automated Organic Competitor Discovery, 2D Positioning Quadrant & SERP Displacement Engine | Integrates `/api/competitors` endpoint, automatic competitor discovery derived from SERP rankings, 2D logarithmic positioning quadrant visualizer (Keywords vs Traffic), side-by-side head-to-head confrontation audits, and fragile ranking displacement playbooks with cross-tab SERP deep-linking. | ✅ Accepted |

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
  - Completed Phase 9 (SEO Map: graph topology data models, BFS crawl depth calculation, dual-mode layout engine with Velocity Verlet physics and radial concentric hierarchy, slide-over Node Inspector Drawer, and interactive Canvas visualizer).
  - Completed Phase 10 (Page Audit: on-page checks, Core Web Vitals engine for LCP, INP, CLS, FCP, TTFB, asset weight breakdown, and prioritized recommendations engine with copyable code fixes).
  - **🏆 Core MVP Boundary Reached (Phases 0 through 10 are 100% complete, verified, and operational).**
- **2026-09-22 (Session 2):**
  - Completed Phase 11 (PageSpeed Integration: Google PageSpeed Insights v5 live API integration with verified key, Mobile vs Desktop strategies, Lighthouse 13.4.1 category scores, Core Web Vitals lab metrics, Opportunities/Diagnostics breakdown, and comparative delta tables).
  - Verified Phase 11 live in browser against `https://example.com` with real Google Cloud responses.
  - Completed Phase 12 (Google Search Console: GSC API integration with key `8225cd87...5772`, domain property selector, 7d/28d/3m time-series timeline, queries keyword rankings table with trends, top landing pages table, device & geographic breakdowns, sitemap submission and catalog, and interactive Google index URL Inspection Tool).
  - Verified Phase 12 live in browser across all subtabs, sitemap submissions, and Google URL index inspections with 0 errors.
  - Completed Phase 13 (Bing Webmaster: Bing Webmaster Tools API with key `53f83d76...5f96`, IndexNow instant batch URL publishing engine, daily quota tracker, search query performance, landing page traffic, Bingbot crawl health & HTTP status breakdown, and Bing sitemaps catalog).
  - **🏆 Section 4 (External Search Integrations, Phases 11–13) is 100% complete, verified, and operational.**
  - **Architecture Upgrade:** Implemented server-side crawler API (`/api/fetch`, `/api/audit`) and SSRF guard (`server/ssrfGuard.ts`, `server/crawlerApi.ts`, `vite.config.ts`), resolving browser CORS blocks, eliminating third-party proxies, and auto-correcting URL typos (tested and verified live on `https:///posterscraft.com`).
  - Completed Phase 14 (Keyword Tracking: rank tracking, 14-day position trajectories, search intent classification, tag filters, SERP feature detection, desktop vs mobile tracking, add keyword modal, and active dataset of 11 keywords).
  - Completed Phase 15 (SERP Integration: server-side `/api/serp` endpoint, multi-engine Google & Bing search ranking analysis, 2026 CTR decay curve calculations, Featured Snippet breakdown, expandable People Also Ask (PAA) accordion, 0–10 Algorithm Volatility Radar / Google Weather Sensor with 14-day timeline & update log, SERP Feature Opportunity Roadmap with actionable checklists and 1-click plan copying, pixel-accurate snippet sandbox with 580px Title & 990px Description limit bars and multi-platform card previews, and bidirectional deep-linking with Keyword Tracking).
  - Completed Phase 16 (Competitor Discovery: server-side `/api/competitors` endpoint, auto-discovery of organic competitors from SERP scans [AllPosters, Poster Store, Desenio, Society6, Etsy, Art.com], overlap score calculation, 2D market positioning quadrant [Leaders, Established, Specialists, Emerging] with highlighted user pinpoint, interactive head-to-head confrontation audit and keyword face-off table with win/loss advantage badges, SERP displacement radar targeting fragile competitor positions [#2–#7], and bidirectional deep-linking).
  - Verified Phase 16 live in browser across all 4 subtabs with browser recording and screenshots saved.
  - Ready for Phase 17: Keyword Gap.




