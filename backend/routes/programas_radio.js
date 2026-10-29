// backend/routes/programas_radio.js
const express = require('express');
const router = express.Router();
const sequelize = require('../db'); // conexión directa

// 🔹 Listar programas
router.get('/', async (req, res) => {
  try {
    const [rows] = await sequelize.query('SELECT * FROM programas_radio ORDER BY id_programa');
    res.json({ data: rows });
  } catch (err) {
    console.error("Error en GET /api/programas_radio:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Crear programa
router.post('/', async (req, res) => {
  const { nombre, tipo, dia, hora_inicio, hora_fin, locutor, estado } = req.body;
  try {
    const [result] = await sequelize.query(
      `INSERT INTO programas_radio (nombre, tipo, dia, hora_inicio, hora_fin, locutor, estado)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      { bind: [nombre, tipo, dia, hora_inicio, hora_fin, locutor, estado] }
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
  const { nombre, tipo, dia, hora_inicio, hora_fin, locutor, estado } = req.body;
  try {
    const [result] = await sequelize.query(
      `UPDATE programas_radio
       SET nombre=$1, tipo=$2, dia=$3, hora_inicio=$4, hora_fin=$5, locutor=$6, estado=$7
       WHERE id_programa=$8 RETURNING *`,
      { bind: [nombre, tipo, dia, hora_inicio, hora_fin, locutor, estado, id] }
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
    await sequelize.query('DELETE FROM programas_radio WHERE id_programa=$1', { bind: [id] });
    res.json({ message: 'Programa eliminado' });
  } catch (err) {
    console.error("Error en DELETE /api/programas_radio:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
