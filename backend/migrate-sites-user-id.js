const dotenv = require('dotenv');
const { pool } = require('./src/config/db');

dotenv.config();

const migrate = async () => {
  const connection = await pool.getConnection();
  try {
    console.log('Starting migration: sites.customer_id -> sites.user_id');

    const [columns] = await connection.execute('SHOW COLUMNS FROM sites');
    const hasUserId = columns.some((c) => c.Field === 'user_id');
    const hasCustomerId = columns.some((c) => c.Field === 'customer_id');

    if (!hasUserId) {
      await connection.execute('ALTER TABLE sites ADD COLUMN user_id INT NULL AFTER city_id');
      await connection.execute('ALTER TABLE sites ADD INDEX idx_user (user_id)');
      await connection.execute('ALTER TABLE sites ADD CONSTRAINT fk_sites_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL');
      console.log('Added sites.user_id column + FK/index');
    } else {
      console.log('sites.user_id already exists');
    }

    if (hasCustomerId) {
      await connection.execute('UPDATE sites SET user_id = customer_id WHERE user_id IS NULL');
      console.log('Copied existing customer_id values into user_id');
    } else {
      console.log('sites.customer_id not found, no backfill needed');
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exitCode = 1;
  } finally {
    connection.release();
  }
};

migrate();
