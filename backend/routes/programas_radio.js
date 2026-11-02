// backend/routes/programas_radio.js
const express = require('express');
const router = express.Router();
const sequelize = require('../db'); // conexión directa

// 🔹 Listar programas
router.get('/', async (req, res) => {
  try {
    const [rows] = await sequelize.query('SELECT * FROM radioprogramas ORDER BY id_programa');
    res.json({ data: rows });
  } catch (err) {
    console.error("Error en GET /api/programas_radio:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Crear programa
router.post('/', async (req, res) => {
  const { titulo, descripcion, tipo, fecha, hora_inicio, hora_fin, locutor, estado } = req.body;
  try {
    const [result] = await sequelize.query(
      `INSERT INTO radioprogramas (titulo, descripcion, tipo, fecha, hora_inicio, hora_fin, locutor, estado)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      { bind: [titulo, descripcion, tipo, fecha || new Date(), hora_inicio, hora_fin, locutor, estado || 'Programado'] }
    );
    res.json(result[0]);
  } catch (err) {
    console.error("Error en POST /api/programas_radio:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Actualizar programa
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, tipo, fecha, hora_inicio, hora_fin, locutor, estado } = req.body;
  try {
    const [result] = await sequelize.query(
      `UPDATE radioprogramas
       SET titulo=$1, descripcion=$2, tipo=$3, fecha=$4, hora_inicio=$5, hora_fin=$6, locutor=$7, estado=$8
       WHERE id_programa=$9 RETURNING *`,
      { bind: [titulo, descripcion, tipo, fecha, hora_inicio, hora_fin, locutor, estado, id] }
    );
    res.json(result[0]);
  } catch (err) {
    console.error("Error en PUT /api/programas_radio:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Eliminar programa
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await sequelize.query('DELETE FROM radioprogramas WHERE id_programa=$1', { bind: [id] });
    res.json({ message: 'Programa eliminado' });
  } catch (err) {
    console.error("Error en DELETE /api/programas_radio:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
