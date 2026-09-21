export interface ColumnDefinition {
  name: string;
  type: string;
  isPrimary?: boolean;
  isNullable?: boolean;
  defaultValue?: string;
  foreignKey?: {
    table: string;
    column: string;
    onDelete?: string;
  };
  description: string;
}

export interface TableDefinition {
  name: string;
  category: 'core' | 'crawling' | 'audit' | 'rankings';
  description: string;
  columns: ColumnDefinition[];
  indexes: string[];
}

export interface MigrationLog {
  id: string;
  name: string;
  batch: number;
  appliedAt: string;
  status: 'applied' | 'pending' | 'rolled_back';
  statementsCount: number;
}

export interface QueryResult {
  columns: string[];
  rows: Record<string, any>[];
  rowCount: number;
  executionTimeMs: number;
  error?: string;
}
