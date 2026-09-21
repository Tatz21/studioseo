-- ==============================================================================
-- Migration 003: Seed Baseline Data
-- Target: PostgreSQL 14+
-- ==============================================================================

-- 1. Insert Default Organization
INSERT INTO organizations (id, name, slug, plan_tier, created_at)
VALUES 
    ('e1000000-0000-0000-0000-000000000001', 'Timeliners Kolkata Media Lab', 'timeliners-kolkata', 'enterprise', '2026-01-01 00:00:00Z'),
    ('e1000000-0000-0000-0000-000000000002', 'ApexRank AI Labs', 'apexrank-ai', 'pro', '2026-02-01 00:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Default Users
INSERT INTO users (id, org_id, email, name, role, avatar_url, created_at)
VALUES
    ('u1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'alex.director@seostudiopro.com', 'Alex Rivera', 'admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', '2026-01-15 08:00:00Z'),
    ('u1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000001', 'sarah.chen@seostudiopro.com', 'Sarah Chen', 'member', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', '2026-02-10 09:30:00Z')
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Websites
INSERT INTO websites (id, org_id, domain, name, canonical_url, crawl_depth_limit, max_pages_limit, created_at)
VALUES
    ('w1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'timelinerskolkata.com', 'The Timeliners Kolkata', 'https://timelinerskolkata.com', 3, 500, '2026-01-20 10:00:00Z'),
    ('w1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000002', 'apexrank.ai', 'ApexRank AI Software', 'https://apexrank.ai', 2, 250, '2026-02-15 14:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Crawl Jobs
INSERT INTO crawl_jobs (id, website_id, status, crawl_depth, pages_crawled, pages_failed, started_at, completed_at)
VALUES
    ('c1000000-0000-0000-0000-000000000001', 'w1000000-0000-0000-0000-000000000001', 'completed', 2, 45, 0, '2026-09-20 12:00:00Z', '2026-09-20 12:03:15Z')
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Discovered Pages
INSERT INTO pages (id, website_id, crawl_job_id, url, path, status_code, load_time_ms, page_size_kb, crawled_at)
VALUES
    ('p1000000-0000-0000-0000-000000000001', 'w1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'https://timelinerskolkata.com/', '/', 200, 240, 48.5, '2026-09-20 12:00:10Z'),
    ('p1000000-0000-0000-0000-000000000002', 'w1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'https://timelinerskolkata.com/wedding-photography', '/wedding-photography', 200, 310, 62.1, '2026-09-20 12:00:25Z'),
    ('p1000000-0000-0000-0000-000000000003', 'w1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'https://timelinerskolkata.com/corporate-films', '/corporate-films', 200, 280, 54.0, '2026-09-20 12:00:40Z')
ON CONFLICT (id) DO NOTHING;

-- 6. Insert Page Audits
INSERT INTO page_audits (id, page_id, overall_score, grade, tech_score, content_score, social_score, perf_score, word_count, reading_ease_score, audited_at)
VALUES
    ('a1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000001', 94, 'A', 95, 92, 100, 95, 840, 72, '2026-09-20 12:01:00Z')
ON CONFLICT (id) DO NOTHING;

-- 7. Insert Sample SEO Issues
INSERT INTO seo_issues (id, page_audit_id, severity, category, rule_code, title, description, impact, recommendation)
VALUES
    ('s1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'passed', 'technical', 'TECH_TITLE_OK', 'Optimal Title Tag Length', 'Title tag length is 59 characters.', 'Displays cleanly without truncation in desktop and mobile search snippets.', 'Maintain title relevance and monitor click-through rates.'),
    ('s1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'passed', 'technical', 'TECH_SCHEMA_OK', 'Structured Data Found (LocalBusiness)', 'Valid Schema.org LocalBusiness JSON-LD markup found.', 'Qualifies page for Google Rich Snippets and Knowledge Panel placement.', 'Keep NAP (Name, Address, Phone) synchronized across directories.')
ON CONFLICT (id) DO NOTHING;

-- 8. Insert Tracked Keywords
INSERT INTO keywords (id, website_id, term, search_volume, difficulty, cpc, target_page_id)
VALUES
    ('k1000000-0000-0000-0000-000000000001', 'w1000000-0000-0000-0000-000000000001', 'wedding photography in kolkata', 8100, 38, 24.50, 'p1000000-0000-0000-0000-000000000001'),
    ('k1000000-0000-0000-0000-000000000002', 'w1000000-0000-0000-0000-000000000001', 'best candid wedding photographer kolkata', 3600, 42, 32.00, 'p1000000-0000-0000-0000-000000000002'),
    ('k1000000-0000-0000-0000-000000000003', 'w1000000-0000-0000-0000-000000000001', 'corporate video production kolkata', 1900, 29, 45.00, 'p1000000-0000-0000-0000-000000000003')
ON CONFLICT (id) DO NOTHING;

-- 9. Insert Keyword Rankings
INSERT INTO keyword_rankings (id, keyword_id, position, previous_position, recorded_at)
VALUES
    ('r1000000-0000-0000-0000-000000000001', 'k1000000-0000-0000-0000-000000000001', 3, 5, '2026-09-21 00:00:00Z'),
    ('r1000000-0000-0000-0000-000000000002', 'k1000000-0000-0000-0000-000000000002', 1, 2, '2026-09-21 00:00:00Z'),
    ('r1000000-0000-0000-0000-000000000003', 'k1000000-0000-0000-0000-000000000003', 4, 4, '2026-09-21 00:00:00Z')
ON CONFLICT (id) DO NOTHING;
