const express = require('express');
const router = express.Router();
const sequelize = require('../db');

// 🔹 Obtener lecturas
router.get('/', async (req, res) => {
  try {
    const { id_sensor } = req.query;
    let query = `
      SELECT l.*, s.tipo_sensor AS sensor_tipo, a.nombre_aula
      FROM lecturas_sensores l
      LEFT JOIN sensores s ON l.id_sensor = s.id_sensor
      LEFT JOIN aulas_sensores a ON s.aula_sensor_id = a.id_aula_sensor
      WHERE 1=1
    `;
    const params = [];
    if (id_sensor) {
      params.push(id_sensor);
      query += ` AND l.id_sensor = $${params.length}`;
    }

    const [rows] = await sequelize.query(query, { bind: params });
    res.json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Insertar nueva lectura
router.post('/', async (req, res) => {
  try {
    const { id_sensor, temperatura, humedad, co2, ruido, luz_detectada } = req.body;
    const [result] = await sequelize.query(
      `INSERT INTO lecturas_sensores
       (id_sensor, temperatura, humedad, co2, ruido, luz_detectada, fecha_hora)
       VALUES ($1,$2,$3,$4,$5,$6,NOW()) RETURNING *`,
      { bind: [id_sensor, temperatura, humedad, co2, ruido, luz_detectada] }
    );
    res.json(result[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Eliminar lectura
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await sequelize.query(
      `DELETE FROM lecturas_sensores WHERE id_lectura = $1 RETURNING *`,
      { bind: [req.params.id] }
    );
    if (result.length === 0) return res.status(404).json({ error: 'Lectura no encontrada' });
    res.json({ message: 'Lectura eliminada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
