const express = require('express');
const router = express.Router();
const sequelize = require('../db');

// 🔹 Obtener estado de aulas
router.get('/', async (req, res) => {
  try {
    const { aula_sensor_id, cruce_global, accion } = req.query;
    let query = `
      SELECT e.*, a.nombre_aula
      FROM estado_aulas_sensores e
      LEFT JOIN aulas_sensores a ON e.aula_sensor_id = a.id_aula_sensor
      WHERE 1=1
    `;
    const params = [];
    if (aula_sensor_id) { params.push(aula_sensor_id); query += ` AND e.aula_sensor_id = $${params.length}`; }
    if (cruce_global) { params.push(cruce_global); query += ` AND e.cruce_global = $${params.length}`; }
    if (accion) { params.push(accion); query += ` AND e.accion = $${params.length}`; }

    const [rows] = await sequelize.query(query, { bind: params });
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Insertar nuevo estado
router.post('/', async (req, res) => {
  try {
    const { aula_sensor_id, temperatura, humedad, co2, ruido_detectado, luz_detectada, pir_detectado, cruce_global, accion, mensaje } = req.body;
    const [result] = await sequelize.query(
      `INSERT INTO estado_aulas_sensores
       (aula_sensor_id, temperatura, humedad, co2, ruido_detectado, luz_detectada, pir_detectado, cruce_global, accion, mensaje, fecha_hora)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW()) RETURNING *`,
      { bind: [aula_sensor_id, temperatura, humedad, co2, ruido_detectado, luz_detectada, pir_detectado, cruce_global, accion, mensaje] }
    );
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
