import { TableDefinition } from './types';

export const SCHEMA_TABLES: TableDefinition[] = [
  {
    name: 'organizations',
    category: 'core',
    description: 'Workspaces and billing account organizations that own website properties.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, isNullable: false, defaultValue: 'uuid_generate_v4()', description: 'Primary key unique identifier' },
      { name: 'name', type: 'VARCHAR(255)', isNullable: false, description: 'Organization commercial title' },
      { name: 'slug', type: 'VARCHAR(100)', isNullable: false, description: 'URL-friendly unique slug' },
      { name: 'plan_tier', type: 'VARCHAR(50)', isNullable: true, defaultValue: "'pro'", description: 'Subscription tier (starter, pro, enterprise)' },
      { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', isNullable: false, defaultValue: 'CURRENT_TIMESTAMP', description: 'Creation timestamp' },
      { name: 'updated_at', type: 'TIMESTAMP WITH TIME ZONE', isNullable: false, defaultValue: 'CURRENT_TIMESTAMP', description: 'Last updated timestamp' }
    ],
    indexes: ['pk_organizations_id', 'uq_organizations_slug']
  },
  {
    name: 'users',
    category: 'core',
    description: 'Authenticated team members, administrators, and clients.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, isNullable: false, defaultValue: 'uuid_generate_v4()', description: 'Primary key unique identifier' },
      { name: 'org_id', type: 'UUID', isNullable: false, foreignKey: { table: 'organizations', column: 'id', onDelete: 'CASCADE' }, description: 'Foreign key referencing owning organization' },
      { name: 'email', type: 'VARCHAR(255)', isNullable: false, description: 'Unique user email address' },
      { name: 'password_hash', type: 'VARCHAR(255)', isNullable: true, description: 'Bcrypt hashed password' },
      { name: 'name', type: 'VARCHAR(150)', isNullable: false, description: 'Display name' },
      { name: 'role', type: 'VARCHAR(30)', isNullable: false, defaultValue: "'member'", description: 'Role (admin, member, viewer)' },
      { name: 'avatar_url', type: 'TEXT', isNullable: true, description: 'User profile image URL' },
      { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', isNullable: false, defaultValue: 'CURRENT_TIMESTAMP', description: 'Creation timestamp' }
    ],
    indexes: ['pk_users_id', 'uq_users_email', 'idx_users_org_id']
  },
  {
    name: 'websites',
    category: 'core',
    description: 'Target websites and web domains registered for automated SEO tracking.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, isNullable: false, defaultValue: 'uuid_generate_v4()', description: 'Primary key unique identifier' },
      { name: 'org_id', type: 'UUID', isNullable: false, foreignKey: { table: 'organizations', column: 'id', onDelete: 'CASCADE' }, description: 'Foreign key to parent organization' },
      { name: 'domain', type: 'VARCHAR(255)', isNullable: false, description: 'Root host domain (e.g. timelinerskolkata.com)' },
      { name: 'name', type: 'VARCHAR(255)', isNullable: false, description: 'Friendly project title' },
      { name: 'canonical_url', type: 'TEXT', isNullable: false, description: 'Primary canonical root URL' },
      { name: 'crawl_depth_limit', type: 'INT', isNullable: false, defaultValue: '3', description: 'Maximum crawler recursive depth' },
      { name: 'max_pages_limit', type: 'INT', isNullable: false, defaultValue: '500', description: 'Maximum URL crawl limit' },
      { name: 'settings', type: 'JSONB', isNullable: false, defaultValue: "'{}'::jsonb", description: 'Crawler and audit configuration flags' },
      { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', isNullable: false, defaultValue: 'CURRENT_TIMESTAMP', description: 'Registered date' }
    ],
    indexes: ['pk_websites_id', 'uq_websites_org_domain', 'idx_websites_org_domain']
  },
  {
    name: 'crawl_jobs',
    category: 'crawling',
    description: 'Crawl executions and background spider tasks traversing website domains.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, isNullable: false, defaultValue: 'uuid_generate_v4()', description: 'Primary key unique identifier' },
      { name: 'website_id', type: 'UUID', isNullable: false, foreignKey: { table: 'websites', column: 'id', onDelete: 'CASCADE' }, description: 'Target website' },
      { name: 'status', type: 'VARCHAR(30)', isNullable: false, defaultValue: "'pending'", description: 'Job status (pending, running, completed, failed)' },
      { name: 'crawl_depth', type: 'INT', isNullable: false, defaultValue: '2', description: 'Requested crawl depth' },
      { name: 'pages_crawled', type: 'INT', isNullable: false, defaultValue: '0', description: 'Number of successfully crawled URLs' },
      { name: 'pages_failed', type: 'INT', isNullable: false, defaultValue: '0', description: 'Number of failed/blocked URLs' },
      { name: 'stats', type: 'JSONB', isNullable: false, defaultValue: "'{}'::jsonb", description: 'Detailed crawl performance statistics' },
      { name: 'started_at', type: 'TIMESTAMP WITH TIME ZONE', isNullable: true, description: 'Execution start time' },
      { name: 'completed_at', type: 'TIMESTAMP WITH TIME ZONE', isNullable: true, description: 'Completion time' }
    ],
    indexes: ['pk_crawl_jobs_id', 'idx_crawl_jobs_website_status', 'idx_crawl_jobs_started_at']
  },
  {
    name: 'pages',
    category: 'crawling',
    description: 'Discovered web page URLs, HTTP status codes, and latency metrics.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, isNullable: false, defaultValue: 'uuid_generate_v4()', description: 'Primary key unique identifier' },
      { name: 'website_id', type: 'UUID', isNullable: false, foreignKey: { table: 'websites', column: 'id', onDelete: 'CASCADE' }, description: 'Parent website' },
      { name: 'crawl_job_id', type: 'UUID', isNullable: true, foreignKey: { table: 'crawl_jobs', column: 'id', onDelete: 'SET NULL' }, description: 'Associated crawl job' },
      { name: 'url', type: 'TEXT', isNullable: false, description: 'Full absolute URL' },
      { name: 'path', type: 'VARCHAR(500)', isNullable: false, description: 'Relative URL pathname' },
      { name: 'status_code', type: 'INT', isNullable: false, defaultValue: '200', description: 'HTTP response status (200, 301, 404, 500)' },
      { name: 'content_type', type: 'VARCHAR(100)', isNullable: false, defaultValue: "'text/html'", description: 'MIME response type' },
      { name: 'load_time_ms', type: 'INT', isNullable: false, defaultValue: '0', description: 'Response latency in milliseconds' },
      { name: 'page_size_kb', type: 'NUMERIC(10,2)', isNullable: false, defaultValue: '0.0', description: 'HTML payload size in kilobytes' },
      { name: 'crawled_at', type: 'TIMESTAMP WITH TIME ZONE', isNullable: false, defaultValue: 'CURRENT_TIMESTAMP', description: 'Fetch timestamp' }
    ],
    indexes: ['pk_pages_id', 'uq_pages_website_url', 'idx_pages_website_path', 'idx_pages_status_code']
  },
  {
    name: 'page_audits',
    category: 'audit',
    description: 'Comprehensive SEO audits, category subscores, readability, and metadata snapshots.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, isNullable: false, defaultValue: 'uuid_generate_v4()', description: 'Primary key unique identifier' },
      { name: 'page_id', type: 'UUID', isNullable: false, foreignKey: { table: 'pages', column: 'id', onDelete: 'CASCADE' }, description: 'Audited page reference' },
      { name: 'overall_score', type: 'INT', isNullable: false, description: 'Overall SEO Health Score (0-100)' },
      { name: 'grade', type: 'VARCHAR(5)', isNullable: false, description: 'Letter grade (A+, A, B, C, D, F)' },
      { name: 'tech_score', type: 'INT', isNullable: false, description: 'Technical SEO score (0-100)' },
      { name: 'content_score', type: 'INT', isNullable: false, description: 'Content quality score (0-100)' },
      { name: 'social_score', type: 'INT', isNullable: false, description: 'Social & OpenGraph score (0-100)' },
      { name: 'perf_score', type: 'INT', isNullable: false, description: 'Performance & speed score (0-100)' },
      { name: 'word_count', type: 'INT', isNullable: false, defaultValue: '0', description: 'Extracted body text word count' },
      { name: 'reading_ease_score', type: 'INT', isNullable: false, defaultValue: '0', description: 'Flesch-Kincaid Reading Ease score' },
      { name: 'raw_metadata', type: 'JSONB', isNullable: false, defaultValue: "'{}'::jsonb", description: 'Full extracted meta tags, OG, and JSON-LD' },
      { name: 'audited_at', type: 'TIMESTAMP WITH TIME ZONE', isNullable: false, defaultValue: 'CURRENT_TIMESTAMP', description: 'Audit timestamp' }
    ],
    indexes: ['pk_page_audits_id', 'idx_page_audits_page_id', 'idx_page_audits_overall_score', 'idx_page_audits_audited_at']
  },
  {
    name: 'seo_issues',
    category: 'audit',
    description: 'Granular prioritized issues, root-cause evidence, and actionable code fixes.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, isNullable: false, defaultValue: 'uuid_generate_v4()', description: 'Primary key unique identifier' },
      { name: 'page_audit_id', type: 'UUID', isNullable: false, foreignKey: { table: 'page_audits', column: 'id', onDelete: 'CASCADE' }, description: 'Associated page audit' },
      { name: 'severity', type: 'VARCHAR(20)', isNullable: false, description: 'critical, warning, passed, info' },
      { name: 'category', type: 'VARCHAR(50)', isNullable: false, description: 'technical, content, social, performance, links' },
      { name: 'rule_code', type: 'VARCHAR(100)', isNullable: false, description: 'Unique diagnostic rule identifier' },
      { name: 'title', type: 'VARCHAR(255)', isNullable: false, description: 'Issue summary title' },
      { name: 'description', type: 'TEXT', isNullable: false, description: 'Detailed diagnostic finding' },
      { name: 'impact', type: 'TEXT', isNullable: false, description: 'Impact on search visibility and ranking' },
      { name: 'recommendation', type: 'TEXT', isNullable: false, description: 'Actionable guidance on resolving issue' },
      { name: 'snippet', type: 'TEXT', isNullable: true, description: 'Recommended HTML code snippet fix' }
    ],
    indexes: ['pk_seo_issues_id', 'idx_seo_issues_audit_severity', 'idx_seo_issues_rule_code', 'idx_seo_issues_category']
  },
  {
    name: 'links',
    category: 'crawling',
    description: 'Internal and external hyperlink graph mapping for link equity and crawl analysis.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, isNullable: false, defaultValue: 'uuid_generate_v4()', description: 'Primary key unique identifier' },
      { name: 'from_page_id', type: 'UUID', isNullable: false, foreignKey: { table: 'pages', column: 'id', onDelete: 'CASCADE' }, description: 'Source origin page' },
      { name: 'to_url', type: 'TEXT', isNullable: false, description: 'Destination link target URL' },
      { name: 'to_page_id', type: 'UUID', isNullable: true, foreignKey: { table: 'pages', column: 'id', onDelete: 'SET NULL' }, description: 'Target internal page if resolved' },
      { name: 'anchor_text', type: 'TEXT', isNullable: true, description: 'Clickable anchor text' },
      { name: 'is_internal', type: 'BOOLEAN', isNullable: false, defaultValue: 'TRUE', description: 'True for internal site links' },
      { name: 'is_nofollow', type: 'BOOLEAN', isNullable: false, defaultValue: 'FALSE', description: 'True if rel="nofollow" attribute is present' },
      { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', isNullable: false, defaultValue: 'CURRENT_TIMESTAMP', description: 'Link discovery timestamp' }
    ],
    indexes: ['pk_links_id', 'idx_links_from_page', 'idx_links_to_page', 'idx_links_internal']
  },
  {
    name: 'keywords',
    category: 'rankings',
    description: 'Target keywords monitored for search volume, difficulty, and rankings.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, isNullable: false, defaultValue: 'uuid_generate_v4()', description: 'Primary key unique identifier' },
      { name: 'website_id', type: 'UUID', isNullable: false, foreignKey: { table: 'websites', column: 'id', onDelete: 'CASCADE' }, description: 'Target website' },
      { name: 'term', type: 'VARCHAR(255)', isNullable: false, description: 'Keyword query term' },
      { name: 'search_volume', type: 'INT', isNullable: false, defaultValue: '0', description: 'Monthly estimated search volume' },
      { name: 'difficulty', type: 'INT', isNullable: false, defaultValue: '0', description: 'Keyword ranking difficulty (0-100)' },
      { name: 'cpc', type: 'NUMERIC(10,2)', isNullable: false, defaultValue: '0.0', description: 'Estimated Cost-Per-Click in USD/INR' },
      { name: 'target_page_id', type: 'UUID', isNullable: true, foreignKey: { table: 'pages', column: 'id', onDelete: 'SET NULL' }, description: 'Optimal landing page' },
      { name: 'tracked_since', type: 'TIMESTAMP WITH TIME ZONE', isNullable: false, defaultValue: 'CURRENT_TIMESTAMP', description: 'Date added to tracking' }
    ],
    indexes: ['pk_keywords_id', 'uq_keywords_website_term', 'idx_keywords_website_term']
  },
  {
    name: 'keyword_rankings',
    category: 'rankings',
    description: 'Historical SERP rank positions and featured snippet detections over time.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, isNullable: false, defaultValue: 'uuid_generate_v4()', description: 'Primary key unique identifier' },
      { name: 'keyword_id', type: 'UUID', isNullable: false, foreignKey: { table: 'keywords', column: 'id', onDelete: 'CASCADE' }, description: 'Tracked keyword reference' },
      { name: 'position', type: 'INT', isNullable: false, description: 'Google organic search rank (1-100)' },
      { name: 'previous_position', type: 'INT', isNullable: true, description: 'Previous rank position for delta calculation' },
      { name: 'serp_features', type: 'JSONB', isNullable: false, defaultValue: "'[]'::jsonb", description: 'SERP elements (featured snippet, local pack, image pack)' },
      { name: 'recorded_at', type: 'TIMESTAMP WITH TIME ZONE', isNullable: false, defaultValue: 'CURRENT_TIMESTAMP', description: 'Rank check timestamp' }
    ],
    indexes: ['pk_keyword_rankings_id', 'idx_keyword_rankings_keyword_date']
  }
];
