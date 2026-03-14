const express = require('express');
const router = express.Router();

const horarioController = require('../controllers/horario.controller'); 

// ==========================================
// Rutas que ya tenías (GET)
// ==========================================
router.get('/', horarioController.getHorarios);
router.get('/:id/dias', horarioController.getDiasPorHorario);

// ==========================================
// 👇 NUEVAS RUTAS PARA EL CRUD DE HORARIOS 👇
// ==========================================

// Crear un nuevo horario (POST porque enviamos datos nuevos)
router.post('/crear', horarioController.createHorario);

// Editar un horario existente (PUT porque actualizamos datos)
// El ':id' indica que le pasaremos el número del horario por la URL
router.put('/editar/:id', horarioController.updateHorario);

// Desactivar un horario (PUT para cambiar su estado a 0)
router.put('/desactivar/:id', horarioController.deactivateHorario);

module.exports = router;