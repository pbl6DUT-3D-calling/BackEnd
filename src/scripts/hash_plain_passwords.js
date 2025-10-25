require('dotenv').config();
const bcrypt = require('bcrypt');
const { sequelize, User } = require('../models');

async function isHashed(pw) {
  if (!pw) return false;
  // bcrypt hashes start with $2a$, $2b$, or $2y$
  return pw.startsWith('$2a$') || pw.startsWith('$2b$') || pw.startsWith('$2y$');
}

async function main() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to DB');

    const users = await User.findAll();
    console.log(`Found ${users.length} users`);

    let updated = 0;
    for (const u of users) {
      const pw = u.password;
      if (!pw) continue; // skip null
      const hashed = await isHashed(pw);
      if (!hashed) {
        const newHash = await bcrypt.hash(pw, 10);
        u.password = newHash;
        await u.save();
        updated++;
        console.log(`- Updated user id=${u.user_id} (${u.email || u.username})`);
      }
    }

    console.log(`✅ Done. Updated ${updated} user(s).`);
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    try { await sequelize.close(); } catch(e){}
    process.exit(0);
  }
}

main();
