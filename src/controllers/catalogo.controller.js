// src/controllers/catalogo.controller.js
const db = require('../services/db');

exports.getDivisiones = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id_division, siglas, nombre_division FROM divisiones'
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error obteniendo divisiones' });
  }
};

exports.getCarrerasByDivision = async (req, res) => {
  const id_division = req.params.id_division;
  try {
    const [rows] = await db.execute(
      'SELECT id_carrera, nombre_carrera FROM carreras WHERE id_division = ?',
      [id_division]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error obteniendo carreras' });
  }
};
