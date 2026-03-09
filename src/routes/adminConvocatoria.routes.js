const express = require('express');
const router = express.Router();

const periodoController = require('../controllers/adminConvocatoria.controller');

/* rutas */
router.post('/', periodoController.crearPeriodo);
router.get('/', periodoController.obtenerPeriodos);

// AGREGA ESTA LÍNEA: Ruta para actualizar una convocatoria existente
router.put('/:id', periodoController.actualizarPeriodo);

module.exports = router;