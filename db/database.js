const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Путь к базе: либо из переменной окружения, либо в папке data
const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'forno.db');
const schemaPath = path.join(__dirname, 'schema.sql');

// Создаем папку data, если её нет
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const schema = fs.readFileSync(schemaPath, 'utf8');
db.exec(schema);

module.exports = db;