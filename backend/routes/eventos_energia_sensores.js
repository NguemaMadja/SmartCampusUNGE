// backend/routes/eventos_energia_sensores.js
const express = require('express');
const router = express.Router();
const sequelize = require('../db'); // conexión directa

// 🔹 Obtener eventos energéticos (con filtros opcionales)
router.get('/', async (req, res) => {
  try {
    const { aula_sensor_id, accion, fecha_inicio, fecha_fin } = req.query;
    let query = `
      SELECT e.*, a.nombre AS aula_nombre
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

// 🔹 Insertar nuevo evento energético
router.post('/', async (req, res) => {
  try {
    const { aula_sensor_id, accion, motivo } = req.body;
    const [result] = await sequelize.query(
      `INSERT INTO eventos_energia_sensores 
       (aula_sensor_id, accion, motivo, fecha_hora) 
       VALUES ($1,$2,$3,NOW()) RETURNING *`,
      { bind: [aula_sensor_id, accion, motivo] }
    );
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Actualizar evento energético
router.put('/:id', async (req, res) => {
  try {
    const { accion, motivo } = req.body;
    const [result] = await sequelize.query(
      `UPDATE eventos_energia_sensores 
       SET accion=$1, motivo=$2, fecha_hora=NOW()
       WHERE id_evento = $3 RETURNING *`,
      { bind: [accion, motivo, req.params.id] }
    );
    if (result.length === 0) return res.status(404).json({ error: 'Evento no encontrado' });
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Eliminar evento energético
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await sequelize.query(
      `DELETE FROM eventos_energia_sensores WHERE id_evento = $1 RETURNING *`,
      { bind: [req.params.id] }
    );
    if (result.length === 0) return res.status(404).json({ error: 'Evento no encontrado' });
    res.json({ message: 'Evento eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
