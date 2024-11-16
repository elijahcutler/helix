const Database = require('better-sqlite3');
const db = new Database('./containers.db');

// Initialize the table
db.exec(`
  CREATE TABLE IF NOT EXISTS containers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    version TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    status TEXT NOT NULL
  )
`);

module.exports = db;
