# Database Migrations (Structure Only)

This project now supports versioned, **structure-only** SQL migrations.

## Commands

- `npm run migrate`
  - Applies all pending migrations from `backend/migrations/*.sql`.
- `npm run migrate:status`
  - Shows applied vs pending migrations.
- `npm run migrate:create -- <name>`
  - Creates next migration file (example: `002_add_site_status_index.sql`).

## Rules

- Migration files must contain only schema changes:
  - Allowed: `CREATE`, `ALTER`, `DROP`, `RENAME`
  - Blocked by runner: `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `REPLACE`, `UPSERT`
- Migrations are tracked in table: `schema_migrations`
- Each migration runs once and is recorded with checksum.

## Folder

- `backend/migrations/001_initial_structure.sql`:
  - Baseline for all current tables/columns/indexes (no seed data).

## Important

- `npm run init` is destructive and recreates tables + seed data.
- For normal schema evolution in dev/prod, use only migration commands.

