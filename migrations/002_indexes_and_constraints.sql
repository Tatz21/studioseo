-- ==============================================================================
-- Migration 002: Indexes, Constraints & Performance Tuning
-- Target: PostgreSQL 14+
-- ==============================================================================

-- Index on Users by Email and Organization
CREATE INDEX IF NOT EXISTS idx_users_org_id ON users(org_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Index on Websites by Domain
CREATE INDEX IF NOT EXISTS idx_websites_org_domain ON websites(org_id, domain);

-- Index on Crawl Jobs by Website & Status
CREATE INDEX IF NOT EXISTS idx_crawl_jobs_website_status ON crawl_jobs(website_id, status);
CREATE INDEX IF NOT EXISTS idx_crawl_jobs_started_at ON crawl_jobs(started_at DESC);

-- Index on Pages by Website & Path
CREATE INDEX IF NOT EXISTS idx_pages_website_path ON pages(website_id, path);
CREATE INDEX IF NOT EXISTS idx_pages_status_code ON pages(status_code);

-- Index on Page Audits by Page & Audited Timestamp
CREATE INDEX IF NOT EXISTS idx_page_audits_page_id ON page_audits(page_id);
CREATE INDEX IF NOT EXISTS idx_page_audits_overall_score ON page_audits(overall_score);
CREATE INDEX IF NOT EXISTS idx_page_audits_audited_at ON page_audits(audited_at DESC);

-- Index on SEO Issues by Audit, Severity & Category
CREATE INDEX IF NOT EXISTS idx_seo_issues_audit_severity ON seo_issues(page_audit_id, severity);
CREATE INDEX IF NOT EXISTS idx_seo_issues_rule_code ON seo_issues(rule_code);
CREATE INDEX IF NOT EXISTS idx_seo_issues_category ON seo_issues(category);

-- Index on Links by From/To Page IDs
CREATE INDEX IF NOT EXISTS idx_links_from_page ON links(from_page_id);
CREATE INDEX IF NOT EXISTS idx_links_to_page ON links(to_page_id);
CREATE INDEX IF NOT EXISTS idx_links_internal ON links(is_internal);

-- Index on Keywords & Rankings
CREATE INDEX IF NOT EXISTS idx_keywords_website_term ON keywords(website_id, term);
CREATE INDEX IF NOT EXISTS idx_keyword_rankings_keyword_date ON keyword_rankings(keyword_id, recorded_at DESC);
