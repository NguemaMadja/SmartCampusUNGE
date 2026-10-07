// backend/routes/consumo_energia_sensores.js
const express = require('express');
const router = express.Router();
const sequelize = require('../db'); // conexión directa

// 🔹 Obtener consumo energético (con filtros opcionales)
router.get('/', async (req, res) => {
  try {
    const { aula_sensor_id, fecha_inicio, fecha_fin } = req.query;
    let query = `
      SELECT c.*, a.nombre AS aula_nombre
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

// 🔹 Insertar nuevo registro de consumo
router.post('/', async (req, res) => {
  try {
    const { aula_sensor_id, consumo_kwh } = req.body;
    const [result] = await sequelize.query(
      `INSERT INTO consumo_energia_sensores 
       (aula_sensor_id, consumo_kwh, fecha_hora) 
       VALUES ($1,$2,NOW()) RETURNING *`,
      { bind: [aula_sensor_id, consumo_kwh] }
    );
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Actualizar registro de consumo
router.put('/:id', async (req, res) => {
  try {
    const { consumo_kwh } = req.body;
    const [result] = await sequelize.query(
      `UPDATE consumo_energia_sensores 
       SET consumo_kwh=$1, fecha_hora=NOW()
       WHERE id_consumo = $2 RETURNING *`,
      { bind: [consumo_kwh, req.params.id] }
    );
    if (result.length === 0) return res.status(404).json({ error: 'Registro no encontrado' });
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Eliminar registro de consumo
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await sequelize.query(
      `DELETE FROM consumo_energia_sensores WHERE id_consumo = $1 RETURNING *`,
      { bind: [req.params.id] }
    );
    if (result.length === 0) return res.status(404).json({ error: 'Registro no encontrado' });
    res.json({ message: 'Registro eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
