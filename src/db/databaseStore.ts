import { QueryResult } from './types';

// In-Memory Relational Database Store pre-populated with Migration 003 seed data
export class DatabaseStore {
  private tables: Record<string, Record<string, any>[]> = {
    organizations: [
      { id: 'e1000000-0000-0000-0000-000000000001', name: 'Timeliners Kolkata Media Lab', slug: 'timeliners-kolkata', plan_tier: 'enterprise', created_at: '2026-01-01 00:00:00Z' },
      { id: 'e1000000-0000-0000-0000-000000000002', name: 'ApexRank AI Labs', slug: 'apexrank-ai', plan_tier: 'pro', created_at: '2026-02-01 00:00:00Z' }
    ],
    users: [
      { id: 'u1000000-0000-0000-0000-000000000001', org_id: 'e1000000-0000-0000-0000-000000000001', email: 'alex.director@seostudiopro.com', name: 'Alex Rivera', role: 'admin', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', created_at: '2026-01-15 08:00:00Z' },
      { id: 'u1000000-0000-0000-0000-000000000002', org_id: 'e1000000-0000-0000-0000-000000000001', email: 'sarah.chen@seostudiopro.com', name: 'Sarah Chen', role: 'member', avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', created_at: '2026-02-10 09:30:00Z' }
    ],
    websites: [
      { id: 'w1000000-0000-0000-0000-000000000001', org_id: 'e1000000-0000-0000-0000-000000000001', domain: 'timelinerskolkata.com', name: 'The Timeliners Kolkata', canonical_url: 'https://timelinerskolkata.com', crawl_depth_limit: 3, max_pages_limit: 500, created_at: '2026-01-20 10:00:00Z' },
      { id: 'w1000000-0000-0000-0000-000000000002', org_id: 'e1000000-0000-0000-0000-000000000002', domain: 'apexrank.ai', name: 'ApexRank AI Software', canonical_url: 'https://apexrank.ai', crawl_depth_limit: 2, max_pages_limit: 250, created_at: '2026-02-15 14:00:00Z' }
    ],
    crawl_jobs: [
      { id: 'c1000000-0000-0000-0000-000000000001', website_id: 'w1000000-0000-0000-0000-000000000001', status: 'completed', crawl_depth: 2, pages_crawled: 45, pages_failed: 0, started_at: '2026-09-20 12:00:00Z', completed_at: '2026-09-20 12:03:15Z' }
    ],
    pages: [
      { id: 'p1000000-0000-0000-0000-000000000001', website_id: 'w1000000-0000-0000-0000-000000000001', crawl_job_id: 'c1000000-0000-0000-0000-000000000001', url: 'https://timelinerskolkata.com/', path: '/', status_code: 200, load_time_ms: 240, page_size_kb: 48.5, crawled_at: '2026-09-20 12:00:10Z' },
      { id: 'p1000000-0000-0000-0000-000000000002', website_id: 'w1000000-0000-0000-0000-000000000001', crawl_job_id: 'c1000000-0000-0000-0000-000000000001', url: 'https://timelinerskolkata.com/wedding-photography', path: '/wedding-photography', status_code: 200, load_time_ms: 310, page_size_kb: 62.1, crawled_at: '2026-09-20 12:00:25Z' },
      { id: 'p1000000-0000-0000-0000-000000000003', website_id: 'w1000000-0000-0000-0000-000000000001', crawl_job_id: 'c1000000-0000-0000-0000-000000000001', url: 'https://timelinerskolkata.com/corporate-films', path: '/corporate-films', status_code: 200, load_time_ms: 280, page_size_kb: 54.0, crawled_at: '2026-09-20 12:00:40Z' }
    ],
    page_audits: [
      { id: 'a1000000-0000-0000-0000-000000000001', page_id: 'p1000000-0000-0000-0000-000000000001', overall_score: 94, grade: 'A', tech_score: 95, content_score: 92, social_score: 100, perf_score: 95, word_count: 840, reading_ease_score: 72, audited_at: '2026-09-20 12:01:00Z' }
    ],
    seo_issues: [
      { id: 's1000000-0000-0000-0000-000000000001', page_audit_id: 'a1000000-0000-0000-0000-000000000001', severity: 'passed', category: 'technical', rule_code: 'TECH_TITLE_OK', title: 'Optimal Title Tag Length', description: 'Title tag length is 59 characters.', impact: 'Displays cleanly without truncation in desktop and mobile search snippets.', recommendation: 'Maintain title relevance and monitor click-through rates.' },
      { id: 's1000000-0000-0000-0000-000000000002', page_audit_id: 'a1000000-0000-0000-0000-000000000001', severity: 'passed', category: 'technical', rule_code: 'TECH_SCHEMA_OK', title: 'Structured Data Found (LocalBusiness)', description: 'Valid Schema.org LocalBusiness JSON-LD markup found.', impact: 'Qualifies page for Google Rich Snippets and Knowledge Panel placement.', recommendation: 'Keep NAP synchronized across directories.' },
      { id: 's1000000-0000-0000-0000-000000000003', page_audit_id: 'a1000000-0000-0000-0000-000000000001', severity: 'warning', category: 'content', rule_code: 'CONTENT_IMG_ALT', title: 'Images Missing Alt Attributes', description: '1 out of 3 images lacks an alt tag.', impact: 'Reduces image search indexability.', recommendation: 'Add concise alt text.' }
    ],
    links: [
      { id: 'l1000000-0000-0000-0000-000000000001', from_page_id: 'p1000000-0000-0000-0000-000000000001', to_url: 'https://timelinerskolkata.com/wedding-photography', anchor_text: 'Wedding Stories', is_internal: true, is_nofollow: false },
      { id: 'l1000000-0000-0000-0000-000000000002', from_page_id: 'p1000000-0000-0000-0000-000000000001', to_url: 'https://instagram.com/timelinerskolkata', anchor_text: 'Instagram', is_internal: false, is_nofollow: true }
    ],
    keywords: [
      { id: 'k1000000-0000-0000-0000-000000000001', website_id: 'w1000000-0000-0000-0000-000000000001', term: 'wedding photography in kolkata', search_volume: 8100, difficulty: 38, cpc: 24.50 },
      { id: 'k1000000-0000-0000-0000-000000000002', website_id: 'w1000000-0000-0000-0000-000000000001', term: 'best candid wedding photographer kolkata', search_volume: 3600, difficulty: 42, cpc: 32.00 },
      { id: 'k1000000-0000-0000-0000-000000000003', website_id: 'w1000000-0000-0000-0000-000000000001', term: 'corporate video production kolkata', search_volume: 1900, difficulty: 29, cpc: 45.00 }
    ],
    keyword_rankings: [
      { id: 'r1000000-0000-0000-0000-000000000001', keyword_id: 'k1000000-0000-0000-0000-000000000001', position: 3, previous_position: 5, recorded_at: '2026-09-21 00:00:00Z' },
      { id: 'r1000000-0000-0000-0000-000000000002', keyword_id: 'k1000000-0000-0000-0000-000000000002', position: 1, previous_position: 2, recorded_at: '2026-09-21 00:00:00Z' },
      { id: 'r1000000-0000-0000-0000-000000000003', keyword_id: 'k1000000-0000-0000-0000-000000000003', position: 4, previous_position: 4, recorded_at: '2026-09-21 00:00:00Z' }
    ]
  };

  public getTableNames(): string[] {
    return Object.keys(this.tables);
  }

  public getTableData(tableName: string): Record<string, any>[] {
    return this.tables[tableName] || [];
  }

  public getTableRows(tableName: string): Record<string, any>[] {
    return this.getTableData(tableName);
  }

  /**
   * Executes a parsed SQL query against the in-memory database store.
   */
  public executeQuery(sql: string): QueryResult {
    const startTime = performance.now();
    const cleanSql = sql.trim().replace(/;$/, '');

    try {
      // Basic SELECT parser: SELECT ... FROM <table> [WHERE <col> = <val>]
      const selectMatch = cleanSql.match(/SELECT\s+(.+?)\s+FROM\s+([a-zA-Z_0-9]+)(\s+WHERE\s+(.+?))?(\s+LIMIT\s+(\d+))?$/i);
      
      if (!selectMatch) {
        throw new Error(`Unsupported SQL syntax. Supported: SELECT <fields> FROM <table_name> [WHERE column = 'val'] [LIMIT N]`);
      }

      const [_, fieldsStr, tableName, __, whereClause, ___, limitStr] = selectMatch;
      const targetTable = tableName.toLowerCase();

      if (!this.tables[targetTable]) {
        throw new Error(`Relation "${targetTable}" does not exist in the database.`);
      }

      let rows = [...this.tables[targetTable]];

      // Simple WHERE filter evaluator
      if (whereClause) {
        const condMatch = whereClause.match(/([a-zA-Z_0-9]+)\s*(=|!=|>|<)\s*['"]?([^'"]+)['"]?/);
        if (condMatch) {
          const [____, col, op, val] = condMatch;
          rows = rows.filter(row => {
            const rowVal = String(row[col] ?? '');
            if (op === '=') return rowVal.toLowerCase() === val.toLowerCase();
            if (op === '!=') return rowVal.toLowerCase() !== val.toLowerCase();
            if (op === '>') return Number(rowVal) > Number(val);
            if (op === '<') return Number(rowVal) < Number(val);
            return true;
          });
        }
      }

      if (limitStr) {
        rows = rows.slice(0, parseInt(limitStr, 10));
      }

      // Project fields
      let columns: string[] = [];
      let projectedRows: Record<string, any>[] = [];

      if (fieldsStr.trim() === '*') {
        if (rows.length > 0) {
          columns = Object.keys(rows[0]);
        }
        projectedRows = rows;
      } else {
        columns = fieldsStr.split(',').map(f => f.trim());
        projectedRows = rows.map(r => {
          const res: Record<string, any> = {};
          columns.forEach(col => {
            res[col] = r[col];
          });
          return res;
        });
      }

      const executionTimeMs = Math.round((performance.now() - startTime + Math.random() * 2) * 100) / 100;

      return {
        columns,
        rows: projectedRows,
        rowCount: projectedRows.length,
        executionTimeMs
      };
    } catch (err: any) {
      return {
        columns: [],
        rows: [],
        rowCount: 0,
        executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
        error: err.message || 'Error executing query.'
      };
    }
  }
}

export const dbStore = new DatabaseStore();
export const databaseStore = dbStore;
