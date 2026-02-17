const bcrypt = require('bcrypt');

async function generarHash() {
  const password = 'Admin1'; // tu contraseña
  const hash = await bcrypt.hash(password, 10);
  console.log(hash);
}

generarHash();
