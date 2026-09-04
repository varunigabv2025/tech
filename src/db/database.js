const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../../trustflow.db');

function createDb() {
  try {
    const Database = require('better-sqlite3');
    const db = new Database(dbPath);
    db.pragma('foreign_keys = ON');
    return db;
  } catch (error) {
    const { DatabaseSync } = require('node:sqlite');
    const db = new DatabaseSync(dbPath);
    db.exec('PRAGMA foreign_keys = ON');
    db.pragma = (statement) => {
      db.exec(`PRAGMA ${statement}`);
    };
    console.warn('better-sqlite3 unavailable; using built-in node:sqlite. Reason:', error.message);
    return db;
  }
}

const db = createDb();

const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');
db.exec(schema);

const { seedDemoUsers } = require('./seedAuth');
seedDemoUsers(db);

module.exports = db;
