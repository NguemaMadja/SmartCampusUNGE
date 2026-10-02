const express = require('express');
const router = express.Router();
const sequelize = require('../db');

// Obtener todas las aulas
router.get('/', async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      'SELECT id_aula, nombre, capacidad FROM aulas ORDER BY id_aula'
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error al obtener aulas:", err);
    res.status(500).json({ success: false, error: 'Error al obtener las aulas' });
  }
});

// Obtener aula por ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      'SELECT id_aula, nombre, capacidad FROM aulas WHERE id_aula=$1',
      { bind: [req.params.id] }
    );
    if (!rows.length) return res.status(404).json({ success: false, error: 'Aula no encontrada' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error al obtener aula:", err);
    res.status(500).json({ success: false, error: 'Error al obtener el aula' });
  }
});

// Crear aula
router.post('/', async (req, res) => {
  try {
    const { nombre, capacidad } = req.body;
    const [rows] = await sequelize.query(
      'INSERT INTO aulas (nombre, capacidad) VALUES ($1,$2) RETURNING id_aula, nombre, capacidad',
      { bind: [nombre, capacidad] }
    );
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error al crear aula:", err);
    res.status(500).json({ success: false, error: 'Error al crear el aula' });
  }
});

// Actualizar aula
router.put('/:id', async (req, res) => {
  try {
    const { nombre, capacidad } = req.body;
    const [rows] = await sequelize.query(
      'UPDATE aulas SET nombre=$1, capacidad=$2 WHERE id_aula=$3 RETURNING id_aula, nombre, capacidad',
      { bind: [nombre, capacidad, req.params.id] }
    );
    if (!rows.length) return res.status(404).json({ success: false, error: 'Aula no encontrada' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error al actualizar aula:", err);
    res.status(500).json({ success: false, error: 'Error al actualizar el aula' });
  }
});

// Eliminar aula
router.delete('/:id', async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      'DELETE FROM aulas WHERE id_aula=$1 RETURNING id_aula',
      { bind: [req.params.id] }
    );
    if (!rows.length) return res.status(404).json({ success: false, error: 'Aula no encontrada' });
    res.json({ success: true, message: 'Aula eliminada correctamente' });
  } catch (err) {
    console.error("Error al eliminar aula:", err);
    res.status(500).json({ success: false, error: 'Error al eliminar el aula' });
  }
});

module.exports = router;
