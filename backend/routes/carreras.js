const express = require('express');
const router = express.Router();
const sequelize = require('../db');

// Obtener todas las carreras
router.get('/', async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      'SELECT id_carrera, nombre, id_departamento FROM carreras ORDER BY id_carrera'
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error al obtener carreras:", err);
    res.status(500).json({ success: false, error: 'Error al obtener las carreras' });
  }
});

// Obtener carrera por ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      'SELECT id_carrera, nombre, id_departamento FROM carreras WHERE id_carrera=$1',
      { bind: [req.params.id] }
    );
    if (!rows.length) return res.status(404).json({ success: false, error: 'Carrera no encontrada' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error al obtener carrera:", err);
    res.status(500).json({ success: false, error: 'Error al obtener la carrera' });
  }
});

// Crear carrera
router.post('/', async (req, res) => {
  try {
    const { nombre, id_departamento } = req.body;
    const [rows] = await sequelize.query(
      'INSERT INTO carreras (nombre, id_departamento) VALUES ($1,$2) RETURNING id_carrera, nombre, id_departamento',
      { bind: [nombre, id_departamento] }
    );
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error al crear carrera:", err);
    res.status(500).json({ success: false, error: 'Error al crear la carrera' });
  }
});

// Actualizar carrera
router.put('/:id', async (req, res) => {
  try {
    const { nombre, id_departamento } = req.body;
    const [rows] = await sequelize.query(
      'UPDATE carreras SET nombre=$1, id_departamento=$2 WHERE id_carrera=$3 RETURNING id_carrera, nombre, id_departamento',
      { bind: [nombre, id_departamento, req.params.id] }
    );
    if (!rows.length) return res.status(404).json({ success: false, error: 'Carrera no encontrada' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error al actualizar carrera:", err);
    res.status(500).json({ success: false, error: 'Error al actualizar la carrera' });
  }
});

// Eliminar carrera
router.delete('/:id', async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      'DELETE FROM carreras WHERE id_carrera=$1 RETURNING id_carrera',
      { bind: [req.params.id] }
    );
    if (!rows.length) return res.status(404).json({ success: false, error: 'Carrera no encontrada' });
    res.json({ success: true, message: 'Carrera eliminada correctamente' });
  } catch (err) {
    console.error("Error al eliminar carrera:", err);
    res.status(500).json({ success: false, error: 'Error al eliminar la carrera' });
  }
});

module.exports = router;
