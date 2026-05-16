// Run: node scripts/reset-admin-password.mjs
// Yeh script admin ka password reset karta hai agar login fail ho
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

// Read DATABASE_URL from environment
import { config } from 'dotenv';
config({ path: '.env' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  // NEW_PASSWORD: Yahan apna desired password daalein
  const NEW_PASSWORD = 'Admin@12345';

  console.log('Connecting to database...');
  
  // Check admin user
  const { rows } = await pool.query(
    `SELECT id, email, "firstName", "lastName", LEFT("passwordHash", 7) as hash_prefix, LENGTH("passwordHash") as hash_len FROM users WHERE role = 'ADMIN' LIMIT 1`
  );

  if (!rows.length) {
    console.log('❌ No admin user found in database!');
    return;
  }

  const user = rows[0];
  console.log('✅ Admin found:', user.email, '-', user.firstName, user.lastName);
  console.log('   Hash prefix (should be $2b$12):', user.hash_prefix);
  console.log('   Hash length (should be 60):', user.hash_len);

  if (user.hash_len !== 60) {
    console.log('⚠️  WARNING: Hash length is NOT 60 — hash may be corrupted!');
  }

  // Hash new password
const newHash = await bcrypt.hash(NEW_PASSWORD, 8);
  console.log('\n🔐 New hash generated (length:', newHash.length, ')');

  // Update in DB
  await pool.query(
    `UPDATE users SET "passwordHash" = $1 WHERE id = $2`,
    [newHash, user.id]
  );

  console.log('✅ Password reset successfully!');
  console.log('   New Password:', NEW_PASSWORD);
  console.log('   Login with this password at /login');
}

main()
  .then(() => pool.end())
  .catch((e) => {
    console.error('❌ Error:', e.message);
    pool.end();
  });
