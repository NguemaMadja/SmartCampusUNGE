// backend/routes/paradas.js
const express = require('express');
const router = express.Router();
const sequelize = require('../db'); // conexión Sequelize

// 🔹 Obtener todas las paradas
router.get('/', async (req, res) => {
  try {
    const [rows] = await sequelize.query('SELECT * FROM paradas ORDER BY id_parada');
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error al obtener paradas:", err);
    res.status(500).json({ success: false, error: 'Error al obtener las paradas' });
  }
});

// 🔹 Obtener una parada específica por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await sequelize.query(
      'SELECT * FROM paradas WHERE id_parada = $1',
      { bind: [id] }
    );
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Parada no encontrada' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error al obtener parada:", err);
    res.status(500).json({ success: false, error: 'Error al obtener la parada' });
  }
});

// 🔹 Crear nueva parada (usando id_vehiculo)
router.post('/', async (req, res) => {
  try {
    const { id_vehiculo, nombre, latitud, longitud, orden } = req.body;

    if (!id_vehiculo || !nombre || !latitud || !longitud || !orden) {
      return res.status(400).json({ success: false, error: 'Todos los campos deben completarse' });
    }

    const [rows] = await sequelize.query(
      `INSERT INTO paradas (id_vehiculo, nombre, latitud, longitud, orden)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      { bind: [id_vehiculo, nombre, latitud, longitud, orden] }
    );
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error al crear parada:", err);
    res.status(500).json({ success: false, error: 'Error al crear la parada' });
  }
});

// 🔹 Actualizar una parada existente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { id_vehiculo, nombre, latitud, longitud, orden } = req.body;

    const [rows] = await sequelize.query(
      `UPDATE paradas 
       SET id_vehiculo=$1, nombre=$2, latitud=$3, longitud=$4, orden=$5
       WHERE id_parada=$6 RETURNING *`,
      { bind: [id_vehiculo, nombre, latitud, longitud, orden, id] }
    );
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Parada no encontrada' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error al actualizar parada:", err);
    res.status(500).json({ success: false, error: 'Error al actualizar la parada' });
  }
});

// 🔹 Eliminar una parada
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await sequelize.query(
      'DELETE FROM paradas WHERE id_parada=$1 RETURNING *',
      { bind: [id] }
    );
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Parada no encontrada' });
    }
    res.json({ success: true, message: 'Parada eliminada correctamente' });
  } catch (err) {
    console.error("Error al eliminar parada:", err);
    res.status(500).json({ success: false, error: 'Error al eliminar la parada' });
  }
});

module.exports = router;
