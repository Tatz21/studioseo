-- ==============================================================================
-- Migration 001: Initial Schema Definition for SEO Platform
-- Target: PostgreSQL 14+ / Supabase / Enterprise RDBMS
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations & Workspaces
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    plan_tier VARCHAR(50) DEFAULT 'pro',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users & Team Access
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(150) NOT NULL,
    role VARCHAR(30) DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Websites Under Management
CREATE TABLE IF NOT EXISTS websites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    domain VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    canonical_url TEXT NOT NULL,
    crawl_depth_limit INT DEFAULT 3,
    max_pages_limit INT DEFAULT 500,
    settings JSONB DEFAULT '{"check_canonical": true, "check_images": true, "check_structured_data": true}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(org_id, domain)
);

-- 4. Crawl Jobs
CREATE TABLE IF NOT EXISTS crawl_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    website_id UUID REFERENCES websites(id) ON DELETE CASCADE,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    crawl_depth INT DEFAULT 2,
    pages_crawled INT DEFAULT 0,
    pages_failed INT DEFAULT 0,
    stats JSONB DEFAULT '{}'::jsonb,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Discovered Website Pages
CREATE TABLE IF NOT EXISTS pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    website_id UUID REFERENCES websites(id) ON DELETE CASCADE,
    crawl_job_id UUID REFERENCES crawl_jobs(id) ON DELETE SET NULL,
    url TEXT NOT NULL,
    path VARCHAR(500) NOT NULL,
    status_code INT DEFAULT 200,
    content_type VARCHAR(100) DEFAULT 'text/html',
    load_time_ms INT DEFAULT 0,
    page_size_kb NUMERIC(10, 2) DEFAULT 0.0,
    crawled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(website_id, url)
);

-- 6. Page Audits
CREATE TABLE IF NOT EXISTS page_audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
    overall_score INT NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
    grade VARCHAR(5) NOT NULL,
    tech_score INT NOT NULL,
    content_score INT NOT NULL,
    social_score INT NOT NULL,
    perf_score INT NOT NULL,
    word_count INT DEFAULT 0,
    reading_ease_score INT DEFAULT 0,
    text_to_html_ratio NUMERIC(5, 2) DEFAULT 0.0,
    raw_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    audited_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Specific SEO Issues & Evidence
CREATE TABLE IF NOT EXISTS seo_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_audit_id UUID REFERENCES page_audits(id) ON DELETE CASCADE,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('critical', 'warning', 'passed', 'info')),
    category VARCHAR(50) NOT NULL CHECK (category IN ('technical', 'content', 'social', 'performance', 'links')),
    rule_code VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    impact TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    snippet TEXT,
    evidence JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Internal and External Hyperlinks
CREATE TABLE IF NOT EXISTS links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
    to_url TEXT NOT NULL,
    to_page_id UUID REFERENCES pages(id) ON DELETE SET NULL,
    anchor_text TEXT,
    is_internal BOOLEAN DEFAULT TRUE,
    is_nofollow BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Tracked Keywords
CREATE TABLE IF NOT EXISTS keywords (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    website_id UUID REFERENCES websites(id) ON DELETE CASCADE,
    term VARCHAR(255) NOT NULL,
    search_volume INT DEFAULT 0,
    difficulty INT DEFAULT 0,
    cpc NUMERIC(10, 2) DEFAULT 0.0,
    target_page_id UUID REFERENCES pages(id) ON DELETE SET NULL,
    tracked_since TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(website_id, term)
);

-- 10. Keyword Historical Rankings
CREATE TABLE IF NOT EXISTS keyword_rankings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    keyword_id UUID REFERENCES keywords(id) ON DELETE CASCADE,
    position INT NOT NULL,
    previous_position INT,
    serp_features JSONB DEFAULT '[]'::jsonb,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
