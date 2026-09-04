const bcrypt = require('bcryptjs');

function seedDemoUsers(db) {
  try {
    const checkTable = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='users'"
    ).get();

    if (!checkTable) {
      return;
    }

    const saltRounds = 10;
    const defaultPassword = 'TrustFlow@123';
    const hashedPassword = bcrypt.hashSync(defaultPassword, saltRounds);
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const demoUsers = [
      {
        id: 'USR001',
        name: 'Kumar Knitwear Works (Demo MSME)',
        email: 'msme@trustflow.demo',
        password_hash: hashedPassword,
        role: 'MSME',
        unit_id: 'U001'
      },
      {
        id: 'USR002',
        name: 'Alchemy Finance Partners (Demo Financier)',
        email: 'financier@trustflow.demo',
        password_hash: hashedPassword,
        role: 'FINANCIER',
        unit_id: null
      }
    ];

    const insertStmt = db.prepare(`
      INSERT OR IGNORE INTO users (id, name, email, password_hash, role, unit_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    demoUsers.forEach((user) => {
      const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(user.email);
      if (!existing) {
        insertStmt.run(
          user.id,
          user.name,
          user.email.toLowerCase().trim(),
          user.password_hash,
          user.role,
          user.unit_id,
          now,
          now
        );
      }
    });
  } catch (error) {
    console.error('Error seeding demo auth users:', error);
  }
}

module.exports = { seedDemoUsers };
