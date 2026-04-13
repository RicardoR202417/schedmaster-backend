// ============================================================
// src/routes/neurona.routes.js
// ============================================================

const express = require('express');
const router  = express.Router();

const neuronaController = require('../controllers/neurona.controller');

router.post('/entrenar',      neuronaController.entrenarModelo);
router.get('/modelo',         neuronaController.obtenerModelo);
router.post('/evaluar',       neuronaController.evaluarUsuario);
router.get('/evaluar-todos',  neuronaController.evaluarTodos);

module.exports = router;