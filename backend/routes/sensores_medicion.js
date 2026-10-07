// backend/routes/sensores_medicion.js
const express = require('express');

module.exports = (sequelize) => {
  const router = express.Router();

  // Obtener todos los sensores de medición
  router.get('/', async (req, res) => {
    try {
      const [rows] = await sequelize.query(`
        SELECT s.*, a.nombre_aula 
        FROM sensores_medicion s
        LEFT JOIN aulas_medicion a ON s.aula_medicion_id = a.id_aula_medicion
        ORDER BY s.id_sensor
      `);
      res.json({ data: rows });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Insertar sensor
  router.post('/', async (req, res) => {
    const { tipo_sensor, parametro, aula_medicion_id, ubicacion } = req.body;
    try {
      const [result] = await sequelize.query(
        'INSERT INTO sensores_medicion (tipo_sensor, parametro, aula_medicion_id, ubicacion) VALUES ($1,$2,$3,$4) RETURNING *',
        { bind: [tipo_sensor, parametro, aula_medicion_id, ubicacion] }
      );
      res.json(result[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Actualizar sensor
  router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { tipo_sensor, parametro, aula_medicion_id, ubicacion } = req.body;
    try {
      const [result] = await sequelize.query(
        'UPDATE sensores_medicion SET tipo_sensor=$1, parametro=$2, aula_medicion_id=$3, ubicacion=$4 WHERE id_sensor=$5 RETURNING *',
        { bind: [tipo_sensor, parametro, aula_medicion_id, ubicacion, id] }
      );
      res.json(result[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Eliminar sensor
  router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
      await sequelize.query('DELETE FROM sensores_medicion WHERE id_sensor=$1', { bind: [id] });
      res.json({ message: 'Sensor eliminado' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
