import React, { useState } from 'react';
import { SCHEMA_TABLES } from '../../db/schemaDefinition';
import { dbStore } from '../../db/databaseStore';
import { APPLIED_MIGRATIONS } from '../../db/migrationRunner';
import { QueryResult } from '../../db/types';
import { 
  Database, 
  Table, 
  Layers, 
  Key, 
  ArrowRight, 
  Terminal, 
  Play, 
  History, 
  CheckCircle2, 
  FileCode, 
  AlertCircle 
} from 'lucide-react';

export const SchemaExplorer: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'tables' | 'query' | 'migrations'>('tables');
  const [selectedTableName, setSelectedTableName] = useState<string>('websites');
  
  // SQL Workbench state
  const [sqlQuery, setSqlQuery] = useState<string>('SELECT * FROM websites LIMIT 10;');
  const [queryResult, setQueryResult] = useState<QueryResult>(() => dbStore.executeQuery('SELECT * FROM websites LIMIT 10;'));

  const selectedTable = SCHEMA_TABLES.find(t => t.name === selectedTableName) || SCHEMA_TABLES[0];

  const handleRunQuery = (queryToRun?: string) => {
    const q = queryToRun || sqlQuery;
    const result = dbStore.executeQuery(q);
    setQueryResult(result);
  };

  const quickQueries = [
    { label: 'Websites Under Management', sql: 'SELECT * FROM websites;' },
    { label: 'All Registered Users', sql: 'SELECT id, email, name, role, created_at FROM users;' },
    { label: 'Discovered Web Pages', sql: 'SELECT id, url, status_code, load_time_ms, page_size_kb FROM pages;' },
    { label: 'Page Audits & Scores', sql: 'SELECT page_id, overall_score, grade, tech_score, content_score FROM page_audits;' },
    { label: 'Tracked Keywords & Volume', sql: 'SELECT term, search_volume, difficulty, cpc FROM keywords;' }
  ];

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      {/* Header with DB Status */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)'
          }}>
            <Database size={22} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.25rem' }}>Database Foundation (PostgreSQL)</h2>
              <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                <CheckCircle2 size={11} /> Connected (PostgreSQL 16)
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              10 Relational Tables • 3 Migrations Applied • Connection Pool Ready
            </p>
          </div>
        </div>

        {/* Sub-Tab Navigation */}
        <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--bg-surface)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setActiveSubTab('tables')}
            className={`btn ${activeSubTab === 'tables' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
          >
            <Table size={15} />
            <span>Table Schemas ({SCHEMA_TABLES.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('query')}
            className={`btn ${activeSubTab === 'query' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
          >
            <Terminal size={15} />
            <span>SQL Query Bench</span>
          </button>
          <button
            onClick={() => setActiveSubTab('migrations')}
            className={`btn ${activeSubTab === 'migrations' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
          >
            <History size={15} />
            <span>Migrations ({APPLIED_MIGRATIONS.length})</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: TABLE SCHEMAS */}
      {activeSubTab === 'tables' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 280px) 1fr', gap: '1.5rem' }}>
          {/* Tables Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
              Relational Tables
            </span>
            {SCHEMA_TABLES.map(t => (
              <button
                key={t.name}
                type="button"
                onClick={() => setSelectedTableName(t.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: selectedTableName === t.name ? 'var(--accent-primary)' : 'var(--border-subtle)',
                  background: selectedTableName === t.name ? 'var(--accent-primary-light)' : 'var(--bg-surface)',
                  color: selectedTableName === t.name ? 'var(--accent-primary)' : 'var(--text-primary)',
                  fontWeight: selectedTableName === t.name ? 700 : 500,
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Table size={14} />
                  <span className="font-mono">{t.name}</span>
                </div>
                <span className="badge badge-info" style={{ fontSize: '0.6rem', padding: '0.15rem 0.4rem' }}>
                  {t.columns.length} cols
                </span>
              </button>
            ))}
          </div>

          {/* Selected Table Columns and Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h3 className="font-mono" style={{ fontSize: '1.15rem', color: 'var(--accent-primary)', marginBottom: '0.2rem' }}>
                  TABLE: {selectedTable.name}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {selectedTable.description}
                </p>
              </div>
              <span className="badge badge-cyan" style={{ textTransform: 'uppercase' }}>
                Category: {selectedTable.category}
              </span>
            </div>

            {/* Column Schema Table */}
            <div style={{ overflowX: 'auto', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-medium)', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.725rem' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Column Name</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Type</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Key / Constraint</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Default</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTable.columns.map((col, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        <span className="font-mono">{col.name}</span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span className="badge badge-info font-mono" style={{ fontSize: '0.65rem' }}>
                          {col.type}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        {col.isPrimary && (
                          <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>
                            <Key size={10} /> PK
                          </span>
                        )}
                        {col.foreignKey && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-cyan)', fontSize: '0.75rem' }}>
                            <ArrowRight size={12} />
                            <span className="font-mono">{col.foreignKey.table}.{col.foreignKey.column}</span>
                          </div>
                        )}
                        {!col.isPrimary && !col.foreignKey && (
                          <span style={{ color: 'var(--text-muted)' }}>{col.isNullable ? 'NULL' : 'NOT NULL'}</span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {col.defaultValue || '-'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                        {col.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Indexes List */}
            {selectedTable.indexes.length > 0 && (
              <div style={{
                background: 'var(--bg-canvas)',
                padding: '0.85rem 1.25rem',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)'
              }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                  Configured Indexes ({selectedTable.indexes.length}):
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {selectedTable.indexes.map((idxName, i) => (
                    <span key={i} className="badge badge-secondary font-mono" style={{ fontSize: '0.7rem' }}>
                      <Layers size={11} /> {idxName}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: SQL QUERY BENCH */}
      {activeSubTab === 'query' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Quick Query Templates */}
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
              Quick Preset Queries:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {quickQueries.map((qq, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => { setSqlQuery(qq.sql); handleRunQuery(qq.sql); }}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                >
                  <FileCode size={13} color="var(--accent-primary)" />
                  <span>{qq.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SQL Editor Area */}
          <div style={{ position: 'relative' }}>
            <textarea
              value={sqlQuery}
              onChange={e => setSqlQuery(e.target.value)}
              className="textarea font-mono"
              rows={4}
              style={{
                fontSize: '0.875rem',
                color: 'var(--accent-cyan)',
                background: 'var(--bg-canvas)',
                border: '1px solid var(--border-medium)'
              }}
              placeholder="SELECT * FROM websites;"
            />
            <button
              onClick={() => handleRunQuery()}
              className="btn btn-primary"
              style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                fontSize: '0.75rem',
                padding: '0.35rem 0.75rem'
              }}
            >
              <Play size={13} />
              <span>Execute SQL</span>
            </button>
          </div>

          {/* Query Results */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            {/* Results Header */}
            <div style={{
              padding: '0.75rem 1.25rem',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-surface-elevated)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  Results: {queryResult.rowCount} rows
                </span>
                <span style={{ color: 'var(--text-muted)' }}>|</span>
                <span style={{ color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
                  {queryResult.executionTimeMs} ms
                </span>
              </div>
            </div>

            {/* Error Message */}
            {queryResult.error ? (
              <div style={{ padding: '1.5rem', color: 'var(--status-critical)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={18} />
                <span>{queryResult.error}</span>
              </div>
            ) : queryResult.rows.length > 0 ? (
              <div style={{ overflowX: 'auto', maxHeight: '380px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-medium)', background: 'var(--bg-surface)' }}>
                      {queryResult.columns.map(c => (
                        <th key={c} className="font-mono" style={{ padding: '0.65rem 0.85rem', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {queryResult.rows.map((row, rIdx) => (
                      <tr key={rIdx} style={{ borderBottom: '1px solid var(--border-subtle)', background: rIdx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                        {queryResult.columns.map(c => (
                          <td key={c} className="font-mono" style={{ padding: '0.65rem 0.85rem', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                            {typeof row[c] === 'object' ? JSON.stringify(row[c]) : String(row[c] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Query executed successfully. 0 rows returned.
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: MIGRATIONS LEDGER */}
      {activeSubTab === 'migrations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Sequential version-controlled database migrations applied against the PostgreSQL instance.
          </p>

          <div style={{ overflowX: 'auto', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-medium)', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.725rem' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Migration Name</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Batch</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Statements</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Applied At</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {APPLIED_MIGRATIONS.map(m => (
                  <tr key={m.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileCode size={16} color="var(--accent-cyan)" />
                        <span className="font-mono">{m.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-mono)' }}>
                      {m.batch}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className="badge badge-info">{m.statementsCount} DDLs</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                      {new Date(m.appliedAt).toLocaleString()}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className="badge badge-success">
                        <CheckCircle2 size={12} /> {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
