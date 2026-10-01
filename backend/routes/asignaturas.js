const express = require('express');
const router = express.Router();
const sequelize = require('../db');

// Obtener todas las asignaturas
router.get('/', async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      'SELECT id_asignatura, nombre, id_carrera FROM asignaturas ORDER BY id_asignatura'
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error al obtener asignaturas:", err);
    res.status(500).json({ success: false, error: 'Error al obtener las asignaturas' });
  }
});

// Obtener asignatura por ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      'SELECT id_asignatura, nombre, id_carrera FROM asignaturas WHERE id_asignatura=$1',
      { bind: [req.params.id] }
    );
    if (!rows.length) return res.status(404).json({ success: false, error: 'Asignatura no encontrada' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error al obtener asignatura:", err);
    res.status(500).json({ success: false, error: 'Error al obtener la asignatura' });
  }
});

// Crear asignatura
router.post('/', async (req, res) => {
  try {
    const { nombre, id_carrera } = req.body;

    if (!nombre || !id_carrera) {
      return res.status(400).json({ success: false, error: 'Todos los campos deben completarse' });
    }

    const [rows] = await sequelize.query(
      'INSERT INTO asignaturas (nombre, id_carrera) VALUES ($1,$2) RETURNING id_asignatura, nombre, id_carrera',
      { bind: [nombre, id_carrera] }
    );
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error al crear asignatura:", err);
    res.status(500).json({ success: false, error: 'Error al crear la asignatura' });
  }
});

// Actualizar asignatura
router.put('/:id', async (req, res) => {
  try {
    const { nombre, id_carrera } = req.body;

    const [rows] = await sequelize.query(
      'UPDATE asignaturas SET nombre=$1, id_carrera=$2 WHERE id_asignatura=$3 RETURNING id_asignatura, nombre, id_carrera',
      { bind: [nombre, id_carrera, req.params.id] }
    );
    if (!rows.length) return res.status(404).json({ success: false, error: 'Asignatura no encontrada' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error al actualizar asignatura:", err);
    res.status(500).json({ success: false, error: 'Error al actualizar la asignatura' });
  }
});

// Eliminar asignatura
router.delete('/:id', async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      'DELETE FROM asignaturas WHERE id_asignatura=$1 RETURNING id_asignatura',
      { bind: [req.params.id] }
    );
    if (!rows.length) return res.status(404).json({ success: false, error: 'Asignatura no encontrada' });
    res.json({ success: true, message: 'Asignatura eliminada correctamente' });
  } catch (err) {
    console.error("Error al eliminar asignatura:", err);
    res.status(500).json({ success: false, error: 'Error al eliminar la asignatura' });
  }
});

module.exports = router;
