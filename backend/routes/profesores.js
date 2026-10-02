const express = require('express');
const router = express.Router();
const sequelize = require('../db');

// Obtener todos los profesores
router.get('/', async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      'SELECT id_profesor, nombre, email, telefono FROM profesores ORDER BY id_profesor'
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error al obtener profesores:", err);
    res.status(500).json({ success: false, error: 'Error al obtener los profesores' });
  }
});

// Obtener profesor por ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      'SELECT id_profesor, nombre, email, telefono FROM profesores WHERE id_profesor=$1',
      { bind: [req.params.id] }
    );
    if (!rows.length) return res.status(404).json({ success: false, error: 'Profesor no encontrado' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error al obtener profesor:", err);
    res.status(500).json({ success: false, error: 'Error al obtener el profesor' });
  }
});

// Crear profesor
router.post('/', async (req, res) => {
  try {
    const { nombre, email, telefono } = req.body;
    const [rows] = await sequelize.query(
      'INSERT INTO profesores (nombre, email, telefono) VALUES ($1,$2,$3) RETURNING id_profesor, nombre, email, telefono',
      { bind: [nombre, email, telefono] }
    );
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error al crear profesor:", err);
    res.status(500).json({ success: false, error: 'Error al crear el profesor' });
  }
});

// Actualizar profesor
router.put('/:id', async (req, res) => {
  try {
    const { nombre, email, telefono } = req.body;
    const [rows] = await sequelize.query(
      'UPDATE profesores SET nombre=$1, email=$2, telefono=$3 WHERE id_profesor=$4 RETURNING id_profesor, nombre, email, telefono',
      { bind: [nombre, email, telefono, req.params.id] }
    );
    if (!rows.length) return res.status(404).json({ success: false, error: 'Profesor no encontrado' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error al actualizar profesor:", err);
    res.status(500).json({ success: false, error: 'Error al actualizar el profesor' });
  }
});

// Eliminar profesor
router.delete('/:id', async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      'DELETE FROM profesores WHERE id_profesor=$1 RETURNING id_profesor',
      { bind: [req.params.id] }
    );
    if (!rows.length) return res.status(404).json({ success: false, error: 'Profesor no encontrado' });
    res.json({ success: true, message: 'Profesor eliminado correctamente' });
  } catch (err) {
    console.error("Error al eliminar profesor:", err);
    res.status(500).json({ success: false, error: 'Error al eliminar el profesor' });
  }
});

module.exports = router;
