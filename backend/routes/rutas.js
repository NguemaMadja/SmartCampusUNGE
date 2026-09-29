// backend/routes/rutas.js
const express = require('express');
const router = express.Router();
const sequelize = require('../db'); // conexión Sequelize

// 🔹 Obtener todas las rutas
router.get('/', async (req, res) => {
  try {
    const [rows] = await sequelize.query('SELECT * FROM rutas ORDER BY id_ruta');
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error al obtener rutas:", err);
    res.status(500).json({ success: false, error: 'Error al obtener las rutas' });
  }
});

// 🔹 Obtener una ruta por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await sequelize.query(
      'SELECT * FROM rutas WHERE id_ruta=$1',
      { bind: [id] }
    );
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Ruta no encontrada' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error al obtener ruta:", err);
    res.status(500).json({ success: false, error: 'Error al obtener la ruta' });
  }
});

// 🔹 Crear nueva ruta
router.post('/', async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) {
      return res.status(400).json({ success: false, error: 'El nombre de la ruta es obligatorio' });
    }
    const [rows] = await sequelize.query(
      'INSERT INTO rutas (nombre) VALUES ($1) RETURNING *',
      { bind: [nombre] }
    );
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error al crear ruta:", err);
    res.status(500).json({ success: false, error: 'Error al crear la ruta' });
  }
});

// 🔹 Actualizar ruta
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;
    const [rows] = await sequelize.query(
      'UPDATE rutas SET nombre=$1 WHERE id_ruta=$2 RETURNING *',
      { bind: [nombre, id] }
    );
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Ruta no encontrada' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error al actualizar ruta:", err);
    res.status(500).json({ success: false, error: 'Error al actualizar la ruta' });
  }
});

// 🔹 Eliminar ruta
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await sequelize.query(
      'DELETE FROM rutas WHERE id_ruta=$1 RETURNING *',
      { bind: [id] }
    );
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Ruta no encontrada' });
    }
    res.json({ success: true, message: 'Ruta eliminada correctamente' });
  } catch (err) {
    console.error("Error al eliminar ruta:", err);
    res.status(500).json({ success: false, error: 'Error al eliminar la ruta' });
  }
});

module.exports = router;
