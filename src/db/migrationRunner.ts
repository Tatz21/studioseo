import { MigrationLog } from './types';

export const APPLIED_MIGRATIONS: MigrationLog[] = [
  {
    id: '001',
    name: '001_initial_schema.sql',
    batch: 1,
    appliedAt: '2026-09-21T18:00:00.000Z',
    status: 'applied',
    statementsCount: 10
  },
  {
    id: '002',
    name: '002_indexes_and_constraints.sql',
    batch: 1,
    appliedAt: '2026-09-21T18:00:01.000Z',
    status: 'applied',
    statementsCount: 14
  },
  {
    id: '003',
    name: '003_seed_data.sql',
    batch: 2,
    appliedAt: '2026-09-21T18:00:02.000Z',
    status: 'applied',
    statementsCount: 9
  }
];

export class MigrationRunner {
  private migrations: MigrationLog[] = [...APPLIED_MIGRATIONS];

  public getMigrationHistory(): MigrationLog[] {
    return this.migrations;
  }

  public getLatestBatch(): number {
    return Math.max(...this.migrations.map(m => m.batch), 0);
  }
}

export const migrationRunner = new MigrationRunner();
