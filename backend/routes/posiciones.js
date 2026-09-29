// backend/routes/posiciones.js
const express = require('express');
const router = express.Router();
const sequelize = require('../db');

// 🔹 Obtener todas las posiciones
router.get('/', async (req, res) => {
  try {
    const [rows] = await sequelize.query(`
      SELECT p.*, v.ruta 
      FROM posiciones_bus p
      JOIN vehiculos v ON p.id_vehiculo = v.id_vehiculo
      ORDER BY p.timestamp DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error al obtener posiciones:", err);
    res.status(500).json({ success: false, error: 'Error al obtener posiciones' });
  }
});

// 🔹 Insertar nueva posición (desde kit ESP + SIM900)
router.post('/', async (req, res) => {
  try {
    const { id_vehiculo, latitud, longitud, velocidad, direccion, proxima_parada, eta_minutos } = req.body;

    if (!id_vehiculo || !latitud || !longitud) {
      return res.status(400).json({ success: false, error: 'Campos obligatorios faltantes' });
    }

    const [rows] = await sequelize.query(
      `INSERT INTO posiciones_bus (id_vehiculo, latitud, longitud, velocidad, direccion, proxima_parada, eta_minutos)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      { bind: [id_vehiculo, latitud, longitud, velocidad, direccion, proxima_parada, eta_minutos] }
    );

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error al insertar posición:", err);
    res.status(500).json({ success: false, error: 'Error al insertar posición' });
  }
});

module.exports = router;
