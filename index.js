const express = require('express');
const cors = require('cors');

const authRoutes = require('./src/routes/auth.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.listen(3001, () => {
  console.log('Servidor corriendo en puerto 3001');
});
