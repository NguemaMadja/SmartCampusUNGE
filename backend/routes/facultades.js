const express = require('express');
const router = express.Router();
const sequelize = require('../db');

// Obtener todas las facultades
router.get('/', async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      'SELECT id_facultad, nombre FROM facultades ORDER BY id_facultad'
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error al obtener facultades:", err);
    res.status(500).json({ success: false, error: 'Error al obtener las facultades' });
  }
});

// Obtener facultad por ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      'SELECT id_facultad, nombre FROM facultades WHERE id_facultad = $1',
      { bind: [req.params.id] }
    );
    if (!rows.length) return res.status(404).json({ success: false, error: 'Facultad no encontrada' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error al obtener facultad:", err);
    res.status(500).json({ success: false, error: 'Error al obtener la facultad' });
  }
});

// Crear facultad
router.post('/', async (req, res) => {
  try {
    const { nombre } = req.body;
    const [rows] = await sequelize.query(
      'INSERT INTO facultades (nombre) VALUES ($1) RETURNING id_facultad, nombre',
      { bind: [nombre] }
    );
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error al crear facultad:", err);
    res.status(500).json({ success: false, error: 'Error al crear la facultad' });
  }
});

// Actualizar facultad
router.put('/:id', async (req, res) => {
  try {
    const { nombre } = req.body;
    const [rows] = await sequelize.query(
      'UPDATE facultades SET nombre=$1 WHERE id_facultad=$2 RETURNING id_facultad, nombre',
      { bind: [nombre, req.params.id] }
    );
    if (!rows.length) return res.status(404).json({ success: false, error: 'Facultad no encontrada' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error al actualizar facultad:", err);
    res.status(500).json({ success: false, error: 'Error al actualizar la facultad' });
  }
});

// Eliminar facultad
router.delete('/:id', async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      'DELETE FROM facultades WHERE id_facultad=$1 RETURNING id_facultad',
      { bind: [req.params.id] }
    );
    if (!rows.length) return res.status(404).json({ success: false, error: 'Facultad no encontrada' });
    res.json({ success: true, message: 'Facultad eliminada correctamente' });
  } catch (err) {
    console.error("Error al eliminar facultad:", err);
    res.status(500).json({ success: false, error: 'Error al eliminar la facultad' });
  }
});

module.exports = router;
