const express = require('express');
const router = express.Router();
const catalogo = require('../controllers/catalogo.controller');

router.get('/divisiones', catalogo.getDivisiones);
router.get('/carreras/:id_division', catalogo.getCarrerasByDivision);

module.exports = router;
