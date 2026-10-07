const express = require('express');
const router = express.Router();
const sequelize = require('../db');

// 🔹 Obtener eventos energéticos
router.get('/', async (req, res) => {
  try {
    const { aula_sensor_id, accion, fecha_inicio, fecha_fin } = req.query;
    let query = `
      SELECT e.*, a.nombre_aula
      FROM eventos_energia_sensores e
      LEFT JOIN aulas_sensores a ON e.aula_sensor_id = a.id_aula_sensor
      WHERE 1=1
    `;
    const params = [];
    if (aula_sensor_id) { params.push(aula_sensor_id); query += ` AND e.aula_sensor_id = $${params.length}`; }
    if (accion) { params.push(accion); query += ` AND e.accion = $${params.length}`; }
    if (fecha_inicio) { params.push(fecha_inicio); query += ` AND e.fecha_hora >= $${params.length}`; }
    if (fecha_fin) { params.push(fecha_fin); query += ` AND e.fecha_hora <= $${params.length}`; }

    const [rows] = await sequelize.query(query, { bind: params });
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Insertar evento
router.post('/', async (req, res) => {
  try {
    const { aula_sensor_id, accion, motivo } = req.body;
    const [result] = await sequelize.query(
      `INSERT INTO eventos_energia_sensores (aula_sensor_id, accion, motivo, fecha_hora)
       VALUES ($1,$2,$3,NOW()) RETURNING *`,
      { bind: [aula_sensor_id, accion, motivo] }
    );
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
