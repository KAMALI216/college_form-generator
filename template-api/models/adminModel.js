const { query } = require('../config/db');

async function findAdminByUsername(username) {
  const rows = await query(
    'SELECT id, username, password_hash FROM admins WHERE username = ? LIMIT 1',
    [username]
  );

  return rows[0] || null;
}

async function insertAdmin({ username, passwordHash }) {
  const result = await query(
    'INSERT INTO admins (username, password_hash) VALUES (?, ?)',
    [username, passwordHash]
  );

  return result.insertId;
}

module.exports = {
  findAdminByUsername,
  insertAdmin,
};