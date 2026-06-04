/**
 * seed-admin.js
 * Creates the admin_users table (if needed) and inserts the default admin user.
 * Run once: node seed-admin.js
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function seed() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'vendor_db',
  });

  try {
    // Create table if not already there
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const username = 'aima@admin';
    const plainPassword = 'aima@admin#1';

    // Hash password with bcrypt cost factor 12
    const hash = await bcrypt.hash(plainPassword, 12);

    // Insert — ignore if username already exists
    const [result] = await connection.query(
      'INSERT IGNORE INTO admin_users (username, password_hash, role) VALUES (?, ?, ?)',
      [username, hash, 'admin']
    );

    if (result.affectedRows === 1) {
      console.log(`✅ Admin user created: ${username}`);
    } else {
      console.log(`ℹ️  Admin user already exists: ${username} (no changes made)`);
    }
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seed();
