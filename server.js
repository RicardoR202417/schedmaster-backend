const express = require('express');
const cors = require('cors');

const authRoutes = require('./src/routes/auth.routes');
const catalogoRoutes = require('./src/routes/catalogo.routes'); // <- importa tu router

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use('/routes/auth', authRoutes);
app.use('/routes', catalogoRoutes); // <- esta línea hace que /routes/divisiones funcione

app.listen(3001, () => {
  console.log('Servidor corriendo en puerto 3001');
});
