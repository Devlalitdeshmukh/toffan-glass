const fs = require("fs");
const path = require("path");

const migrationsDir = path.resolve(__dirname, "..", "migrations");
const nameArg = process.argv[2];

if (!nameArg) {
  console.error("Usage: npm run migrate:create -- <migration_name>");
  process.exit(1);
}

const sanitizedName = nameArg
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "_")
  .replace(/^_+|_+$/g, "");

if (!sanitizedName) {
  console.error("Migration name must contain letters or numbers.");
  process.exit(1);
}

if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
}

const existing = fs
  .readdirSync(migrationsDir)
  .filter((file) => /^\d+_.*\.sql$/.test(file))
  .sort((a, b) => a.localeCompare(b));

const nextNumber = existing.length + 1;
const filename = `${String(nextNumber).padStart(3, "0")}_${sanitizedName}.sql`;
const filePath = path.join(migrationsDir, filename);

const template = `-- Structure-only migration
-- Allowed: CREATE, ALTER, DROP, RENAME
-- Not allowed: INSERT, UPDATE, DELETE, TRUNCATE, REPLACE

`;

fs.writeFileSync(filePath, template, "utf8");
console.log(`Created migration: ${filePath}`);

