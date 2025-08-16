const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DB_FILE = process.env.DATABASE_FILE || path.join(__dirname, 'data', 'doacao.db');
const DB_DIR = path.dirname(DB_FILE);
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const db = new sqlite3.Database(DB_FILE);

// Initialize tables
const initSql = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  city TEXT,
  phone TEXT,
  bio TEXT,
  profile_photo TEXT,
  photo_path TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS donations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_path TEXT,
  city TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS claims (
  id TEXT PRIMARY KEY,
  donation_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(donation_id) REFERENCES donations(id),
  FOREIGN KEY(user_id) REFERENCES users(id)
);
`;

db.exec(initSql, (err) => {
  if (err) console.error('Failed to initialize DB', err);
  else {
    console.log('Database initialized at', DB_FILE);
    
    // Adicionar novos campos se não existirem
    const alterQueries = [
      'ALTER TABLE users ADD COLUMN phone TEXT',
      'ALTER TABLE users ADD COLUMN bio TEXT',
      'ALTER TABLE users ADD COLUMN profile_photo TEXT'
    ];
    
    alterQueries.forEach(query => {
      db.run(query, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding column:', err);
        }
      });
    });
  }
});

module.exports = db;
