// backend/routes/edificios.js
const express = require('express');
const router = express.Router();
const sequelize = require('../db'); // conexión Sequelize

// =======================
// 📌 RUTAS CRUD con consultas directas
// =======================

// GET todos los edificios
router.get('/', async (req, res) => {
  try {
    const [rows] = await sequelize.query('SELECT * FROM edificios ORDER BY id_edificio');
    res.json({ data: rows });
  } catch (err) {
    console.error("Error al obtener edificios:", err);
    res.status(500).json({ error: 'Error al obtener edificios' });
  }
});

// GET un edificio por ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      'SELECT * FROM edificios WHERE id_edificio = $1',
      { bind: [req.params.id] }
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Edificio no encontrado' });
    res.json({ data: rows[0] });
  } catch (err) {
    console.error("Error al obtener edificio:", err);
    res.status(500).json({ error: 'Error al obtener edificio' });
  }
});

// POST crear edificio
router.post('/', async (req, res) => {
  try {
    const { nombre_lugar, latitud, longitud } = req.body;
    const [rows] = await sequelize.query(
      'INSERT INTO edificios (nombre_lugar, latitud, longitud) VALUES ($1, $2, $3) RETURNING *',
      { bind: [nombre_lugar, latitud, longitud] }
    );
    res.json({ data: rows[0] });
  } catch (err) {
    console.error("Error al crear edificio:", err);
    res.status(500).json({ error: 'Error al crear edificio' });
  }
});

// PUT actualizar edificio
router.put('/:id', async (req, res) => {
  try {
    const { nombre_lugar, latitud, longitud } = req.body;
    const [rows] = await sequelize.query(
      'UPDATE edificios SET nombre_lugar = $1, latitud = $2, longitud = $3 WHERE id_edificio = $4 RETURNING *',
      { bind: [nombre_lugar, latitud, longitud, req.params.id] }
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Edificio no encontrado' });
    res.json({ data: rows[0] });
  } catch (err) {
    console.error("Error al actualizar edificio:", err);
    res.status(500).json({ error: 'Error al actualizar edificio' });
  }
});

// DELETE eliminar edificio
router.delete('/:id', async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      'DELETE FROM edificios WHERE id_edificio = $1 RETURNING *',
      { bind: [req.params.id] }
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Edificio no encontrado' });
    res.json({ message: 'Edificio eliminado correctamente' });
  } catch (err) {
    console.error("Error al eliminar edificio:", err);
    res.status(500).json({ error: 'Error al eliminar edificio' });
  }
});

// 🔹 Endpoint de métricas
router.get('/metricas', async (req, res) => {
  try {
    const [rows] = await sequelize.query(`
      SELECT 
        COUNT(*)::int AS total_edificios,
        COALESCE(AVG(latitud),0) AS lat_promedio,
        COALESCE(AVG(longitud),0) AS lng_promedio
      FROM edificios
    `);
    res.json({ data: rows[0] });
  } catch (err) {
    console.error("Error al obtener métricas:", err);
    res.status(500).json({ error: 'Error al obtener métricas' });
  }
});

module.exports = router;
