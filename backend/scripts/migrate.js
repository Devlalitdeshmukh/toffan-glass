const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const mysql = require("mysql2/promise");
const { loadEnv } = require("../src/config/loadEnv");

loadEnv();

const MIGRATIONS_TABLE = "schema_migrations";
const MIGRATIONS_DIR = path.resolve(__dirname, "..", "migrations");

const readSqlFiles = async () => {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    return [];
  }
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((name) => name.endsWith(".sql"))
    .sort((a, b) => a.localeCompare(b));

  return files.map((filename) => {
    const fullPath = path.join(MIGRATIONS_DIR, filename);
    const sql = fs.readFileSync(fullPath, "utf8");
    const checksum = crypto.createHash("sha256").update(sql).digest("hex");
    return { filename, sql, checksum };
  });
};

const stripComments = (sql) => {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/--.*$/gm, " ");
};

const assertStructureOnlyMigration = (filename, sql) => {
  const disallowedStatements = ["insert", "update", "delete", "replace", "truncate", "upsert"];
  const cleanedSql = stripComments(sql);
  const statements = cleanedSql
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const statement of statements) {
    const normalizedStatement = statement.replace(/\s+/g, " ").toLowerCase();
    for (const keyword of disallowedStatements) {
      if (new RegExp(`^${keyword}\\b`, "i").test(normalizedStatement)) {
        throw new Error(
          `Migration ${filename} contains disallowed data statement "${keyword}". Migrations here must be structure-only.`,
        );
      }
    }
  }
};

const ensureMigrationsTable = async (connection) => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      id INT PRIMARY KEY AUTO_INCREMENT,
      filename VARCHAR(255) NOT NULL UNIQUE,
      checksum VARCHAR(64) NOT NULL,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

const getAppliedMigrations = async (connection) => {
  const [rows] = await connection.query(
    `SELECT filename, checksum, executed_at FROM ${MIGRATIONS_TABLE} ORDER BY filename ASC`,
  );
  return rows;
};

const printStatus = (allMigrations, appliedByName) => {
  if (allMigrations.length === 0) {
    console.log("No migration files found.");
    return;
  }
  console.log("Migration status:");
  for (const migration of allMigrations) {
    const row = appliedByName.get(migration.filename);
    const status = row ? "APPLIED" : "PENDING";
    const checksumStatus = row
      ? row.checksum === migration.checksum
        ? "checksum-ok"
        : "checksum-mismatch"
      : "";
    const suffix = checksumStatus ? ` (${checksumStatus})` : "";
    console.log(` - ${migration.filename}: ${status}${suffix}`);
  }
};

const run = async () => {
  const args = process.argv.slice(2);
  const isStatusOnly = args.includes("--status");

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_NAME || "toffan_glass",
    multipleStatements: true,
  });

  try {
    await ensureMigrationsTable(connection);

    const allMigrations = await readSqlFiles();
    const appliedRows = await getAppliedMigrations(connection);
    const appliedByName = new Map(appliedRows.map((row) => [row.filename, row]));

    printStatus(allMigrations, appliedByName);
    if (isStatusOnly) return;

    const pending = allMigrations.filter((m) => !appliedByName.has(m.filename));
    if (pending.length === 0) {
      console.log("No pending migrations.");
      return;
    }

    for (const migration of pending) {
      assertStructureOnlyMigration(migration.filename, migration.sql);
      console.log(`Applying ${migration.filename} ...`);

      await connection.beginTransaction();
      try {
        await connection.query(migration.sql);
        await connection.query(
          `INSERT INTO ${MIGRATIONS_TABLE} (filename, checksum) VALUES (?, ?)`,
          [migration.filename, migration.checksum],
        );
        await connection.commit();
      } catch (error) {
        await connection.rollback();
        throw error;
      }
    }

    console.log("All pending migrations applied successfully.");
  } finally {
    await connection.end();
  }
};

run().catch((error) => {
  console.error("Migration failed:", error.message);
  process.exit(1);
});
