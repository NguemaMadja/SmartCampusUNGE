const express = require('express');
const router = express.Router();
const sequelize = require('../db');

// 🔹 Obtener consumo energético
router.get('/', async (req, res) => {
  try {
    const { aula_sensor_id, fecha_inicio, fecha_fin } = req.query;
    let query = `
      SELECT c.*, a.nombre_aula
      FROM consumo_energia_sensores c
      LEFT JOIN aulas_sensores a ON c.aula_sensor_id = a.id_aula_sensor
      WHERE 1=1
    `;
    const params = [];
    if (aula_sensor_id) { params.push(aula_sensor_id); query += ` AND c.aula_sensor_id = $${params.length}`; }
    if (fecha_inicio) { params.push(fecha_inicio); query += ` AND c.fecha_hora >= $${params.length}`; }
    if (fecha_fin) { params.push(fecha_fin); query += ` AND c.fecha_hora <= $${params.length}`; }

    const [rows] = await sequelize.query(query, { bind: params });
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Insertar consumo
router.post('/', async (req, res) => {
  try {
    const { aula_sensor_id, energia_kwh } = req.body;
    const [result] = await sequelize.query(
      `INSERT INTO consumo_energia_sensores (aula_sensor_id, energia_kwh, fecha_hora)
       VALUES ($1,$2,NOW()) RETURNING *`,
      { bind: [aula_sensor_id, energia_kwh] }
    );
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
