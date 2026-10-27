// backend/routes/aulas_medicion.js
const express = require('express');
const router = express.Router();
const sequelize = require('../db'); // Conexión directa importada desde la raíz

// 🔹 Obtener todas las aulas de medición
router.get('/', async (req, res) => {
  try {
    const [rows] = await sequelize.query('SELECT * FROM aulas_medicion ORDER BY id_aula_medicion');
    res.json({ data: rows });
  } catch (err) {
    console.error("Error en GET /api/aulas_medicion:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Insertar aula
router.post('/', async (req, res) => {
  const { nombre_aula, capacidad, ubicacion } = req.body;
  
  if (!nombre_aula) {
    return res.status(400).json({ error: "El nombre_aula es obligatorio." });
  }

  try {
    const [result] = await sequelize.query(
      'INSERT INTO aulas_medicion (nombre_aula, capacidad, ubicacion) VALUES ($1,$2,$3) RETURNING *',
      { bind: [nombre_aula, capacidad || 0, ubicacion || ''] }
    );
    res.json(result[0]);
  } catch (err) {
    console.error("Error en POST /api/aulas_medicion:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Actualizar aula
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
    console.error("Error en PUT /api/aulas_medicion:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Eliminar aula
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await sequelize.query('DELETE FROM aulas_medicion WHERE id_aula_medicion=$1', { bind: [id] });
    res.json({ message: 'Aula eliminada' });
  } catch (err) {
    console.error("Error en DELETE /api/aulas_medicion:", err);
    res.status(500).json({ error: err.message });
  }
});

// Exportación directa del router compatible con server.js
module.exports = router;
