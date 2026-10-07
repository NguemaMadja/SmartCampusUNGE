// backend/routes/estado_aulas_sensores.js
const express = require('express');
const router = express.Router();
const sequelize = require('../db'); // conexión directa

// 🔹 Obtener estado de aulas (con filtros opcionales)
router.get('/', async (req, res) => {
  try {
    const { aula_sensor_id, estado, accion } = req.query;
    let query = `
      SELECT e.*, a.nombre AS aula_nombre
      FROM estado_aulas_sensores e
      LEFT JOIN aulas_sensores a ON e.aula_sensor_id = a.id_aula_sensor
      WHERE 1=1
    `;
    const params = [];

    if (aula_sensor_id) { params.push(aula_sensor_id); query += ` AND e.aula_sensor_id = $${params.length}`; }
    if (estado) { params.push(estado); query += ` AND e.cruce_global = $${params.length}`; }
    if (accion) { params.push(accion); query += ` AND e.accion = $${params.length}`; }

    const [rows] = await sequelize.query(query, { bind: params });
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Insertar nuevo estado de aula
router.post('/', async (req, res) => {
  try {
    const { aula_sensor_id, temperatura, humedad, co2, ruido, luz_detectada, cruce_global, accion } = req.body;
    const [result] = await sequelize.query(
      `INSERT INTO estado_aulas_sensores 
       (aula_sensor_id, temperatura, humedad, co2, ruido, luz_detectada, cruce_global, accion, fecha_hora) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW()) RETURNING *`,
      { bind: [aula_sensor_id, temperatura, humedad, co2, ruido, luz_detectada, cruce_global, accion] }
    );
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Actualizar estado de aula
router.put('/:id', async (req, res) => {
  try {
    const { temperatura, humedad, co2, ruido, luz_detectada, cruce_global, accion } = req.body;
    const [result] = await sequelize.query(
      `UPDATE estado_aulas_sensores 
       SET temperatura=$1, humedad=$2, co2=$3, ruido=$4, luz_detectada=$5, cruce_global=$6, accion=$7, fecha_hora=NOW()
       WHERE id_estado = $8 RETURNING *`,
      { bind: [temperatura, humedad, co2, ruido, luz_detectada, cruce_global, accion, req.params.id] }
    );
    if (result.length === 0) return res.status(404).json({ error: 'Estado no encontrado' });
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Eliminar estado de aula
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await sequelize.query(
      `DELETE FROM estado_aulas_sensores WHERE id_estado = $1 RETURNING *`,
      { bind: [req.params.id] }
    );
    if (result.length === 0) return res.status(404).json({ error: 'Estado no encontrado' });
    res.json({ message: 'Estado eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
