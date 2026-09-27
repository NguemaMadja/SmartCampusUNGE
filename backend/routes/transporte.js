const express = require('express');
const router = express.Router();
const pool = require('../db'); // conexión a PostgreSQL

// 🔹 Métricas de transporte (antes que /:id para evitar conflicto)
router.get('/metricas/all', async (req, res) => {
  try {
    const result = await pool.query('SELECT id_linea, nombre_linea, paradas, tiempos FROM transporte');
    const metricas = result.rows.map(linea => {
      const numParadas = linea.paradas ? Object.keys(linea.paradas).length : 0;
      const numTiempos = linea.tiempos ? Object.keys(linea.tiempos).length : 0;
      return {
        id_linea: linea.id_linea,
        nombre_linea: linea.nombre_linea,
        numParadas,
        numTiempos
      };
    });
    res.json({ success: true, data: metricas });
  } catch (err) {
    console.error("Error en métricas:", err);
    res.status(500).json({ success: false, error: 'Error al calcular métricas' });
  }
});

// 🔹 Obtener todas las líneas de transporte
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM transporte ORDER BY id_linea');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Error al obtener líneas:", err);
    res.status(500).json({ success: false, error: 'Error al obtener las líneas de transporte' });
  }
});

// 🔹 Obtener una línea específica por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM transporte WHERE id_linea = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Línea no encontrada' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Error al obtener línea:", err);
    res.status(500).json({ success: false, error: 'Error al obtener la línea' });
  }
});

// 🔹 Crear nueva línea de transporte
router.post('/', async (req, res) => {
  try {
    let { nombre_linea, descripcion, paradas, tiempos } = req.body;

    if (!nombre_linea) {
      return res.status(400).json({ success: false, error: 'El nombre de la línea es obligatorio' });
    }

    // Asegurar que paradas y tiempos sean JSON válidos
    if (typeof paradas === 'string') paradas = JSON.parse(paradas);
    if (typeof tiempos === 'string') tiempos = JSON.parse(tiempos);

    const result = await pool.query(
      'INSERT INTO transporte (nombre_linea, descripcion, paradas, tiempos) VALUES ($1,$2,$3,$4) RETURNING *',
      [nombre_linea, descripcion, paradas, tiempos]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Error al crear línea:", err);
    res.status(500).json({ success: false, error: 'Error al crear la línea de transporte' });
  }
});

// 🔹 Actualizar una línea existente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let { nombre_linea, descripcion, paradas, tiempos } = req.body;

    if (typeof paradas === 'string') paradas = JSON.parse(paradas);
    if (typeof tiempos === 'string') tiempos = JSON.parse(tiempos);

    const result = await pool.query(
      'UPDATE transporte SET nombre_linea=$1, descripcion=$2, paradas=$3, tiempos=$4 WHERE id_linea=$5 RETURNING *',
      [nombre_linea, descripcion, paradas, tiempos, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Línea no encontrada' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Error al actualizar línea:", err);
    res.status(500).json({ success: false, error: 'Error al actualizar la línea' });
  }
});

// 🔹 Eliminar una línea
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM transporte WHERE id_linea=$1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Línea no encontrada' });
    }
    res.json({ success: true, message: 'Línea eliminada correctamente' });
  } catch (err) {
    console.error("Error al eliminar línea:", err);
    res.status(500).json({ success: false, error: 'Error al eliminar la línea' });
  }
});

module.exports = router;
