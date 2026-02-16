const db = require('../config/db');

async function login(correo) {
  const [rows] = await db.query(
    'select * from usuarios where correo = ?',
    [correo]
  );

  return rows[0];
}

module.exports = {
  login,
};
