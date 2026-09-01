const fs = require('fs');
const path = require('path');
const db = require('./database');

const schemaPath = path.join(__dirname, 'person3Schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');
db.exec(schema);

module.exports = db;
