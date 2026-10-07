// backend/routes/aulas_medicion.js
const express = require('express');

module.exports = (sequelize) => {
  const router = express.Router();

  // Obtener todas las aulas de medición
  router.get('/', async (req, res) => {
    try {
      const [rows] = await sequelize.query('SELECT * FROM aulas_medicion ORDER BY id_aula_medicion');
      res.json({ data: rows });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Insertar aula
  router.post('/', async (req, res) => {
    const { nombre_aula, capacidad, ubicacion } = req.body;
    try {
      const [result] = await sequelize.query(
        'INSERT INTO aulas_medicion (nombre_aula, capacidad, ubicacion) VALUES ($1,$2,$3) RETURNING *',
        { bind: [nombre_aula, capacidad, ubicacion] }
      );
      res.json(result[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Actualizar aula
  router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre_aula, capacidad, ubicacion } = req.body;
    try {
      const [result] = await sequelize.query(
        'UPDATE aulas_medicion SET nombre_aula=$1, capacidad=$2, ubicacion=$3 WHERE id_aula_medicion=$4 RETURNING *',
        { bind: [nombre_aula, capacidad, ubicacion, id] }
      );
      res.json(result[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Eliminar aula
  router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
      await sequelize.query('DELETE FROM aulas_medicion WHERE id_aula_medicion=$1', { bind: [id] });
      res.json({ message: 'Aula eliminada' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
