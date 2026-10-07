// backend/routes/aulas_sensores.js
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
    const { nombre, id_edificio } = req.body;
    const [result] = await sequelize.query(
      `INSERT INTO aulas_sensores (nombre, id_edificio) 
       VALUES ($1,$2) RETURNING *`,
      { bind: [nombre, id_edificio] }
    );
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Actualizar aula con sensor
router.put('/:id', async (req, res) => {
  try {
    const { nombre, id_edificio } = req.body;
    const [result] = await sequelize.query(
      `UPDATE aulas_sensores 
       SET nombre=$1, id_edificio=$2
       WHERE id_aula_sensor=$3 RETURNING *`,
      { bind: [nombre, id_edificio, req.params.id] }
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
