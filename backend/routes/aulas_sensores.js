const express = require('express');
const router = express.Router();
const sequelize = require('../db');

// 🔹 Obtener aulas con sensores
router.get('/', async (req, res) => {
  try {
    const [rows] = await sequelize.query(`
      SELECT a.*, e.nombre AS edificio_nombre
      FROM aulas_sensores a
      LEFT JOIN edificios e ON a.id_edificio = e.id_edificio
      ORDER BY a.id_aula_sensor
    `);
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Insertar nueva aula con sensor
router.post('/', async (req, res) => {
  try {
    const { nombre_aula, id_edificio, capacidad, ubicacion } = req.body;
    const [result] = await sequelize.query(
      `INSERT INTO aulas_sensores (nombre_aula, id_edificio, capacidad, ubicacion)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      { bind: [nombre_aula, id_edificio, capacidad, ubicacion] }
    );
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Actualizar aula con sensor
router.put('/:id', async (req, res) => {
  try {
    const { nombre_aula, id_edificio, capacidad, ubicacion } = req.body;
    const [result] = await sequelize.query(
      `UPDATE aulas_sensores
       SET nombre_aula=$1, id_edificio=$2, capacidad=$3, ubicacion=$4
       WHERE id_aula_sensor=$5 RETURNING *`,
      { bind: [nombre_aula, id_edificio, capacidad, ubicacion, req.params.id] }
    );
    if (result.length === 0) return res.status(404).json({ error: 'Aula no encontrada' });
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Eliminar aula con sensor
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await sequelize.query(
      `DELETE FROM aulas_sensores WHERE id_aula_sensor=$1 RETURNING *`,
      { bind: [req.params.id] }
    );
    if (result.length === 0) return res.status(404).json({ error: 'Aula no encontrada' });
    res.json({ message: 'Aula eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
