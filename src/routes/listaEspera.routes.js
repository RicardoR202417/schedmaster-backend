const express = require('express');
const router = express.Router();
const controller = require('../controllers/listaEspera.controller');


router.get('/convocatoria-activa', controller.getConvocatoriaActiva);


router.post('/', controller.registrarCorreo);

module.exports = router;