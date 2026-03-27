console.log("🔥 RUTAS DE ANUNCIO CARGADAS");

const express = require('express');
const router = express.Router();

const anuncioController = require('../controllers/anuncio.controller');
const upload = require('../middlewares/upload');

// GET
router.get('/', anuncioController.obtenerAnuncios);

// POST
router.post('/', upload.single('imagen'), anuncioController.crearAnuncio);

// 🔥 PRUEBA PRIMERO
router.delete('/test', (req, res) => {
  res.send('DELETE funciona');
});

// DELETE REAL
router.delete('/:id', anuncioController.eliminarAnuncio);

router.put('/:id', upload.single('imagen'), anuncioController.actualizarAnuncio);

module.exports = router;