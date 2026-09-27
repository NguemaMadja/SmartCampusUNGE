const express = require('express');
const router = express.Router();
const pool = require('../db'); // conexión a PostgreSQL

// 🔹 Obtener todos los vehículos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vehiculos ORDER BY id_vehiculo');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Error al obtener vehículos:", err);
    res.status(500).json({ success: false, error: 'Error al obtener los vehículos' });
  }
});

// 🔹 Obtener un vehículo específico por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM vehiculos WHERE id_vehiculo = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Vehículo no encontrado' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Error al obtener vehículo:", err);
    res.status(500).json({ success: false, error: 'Error al obtener el vehículo' });
  }
});

// 🔹 Crear nuevo vehículo
router.post('/', async (req, res) => {
  try {
    const { placa, conductor, capacidad, estado, id_linea } = req.body;

    if (!placa || !conductor || !capacidad || !estado) {
      return res.status(400).json({ success: false, error: 'Todos los campos son obligatorios' });
    }

    const result = await pool.query(
      `INSERT INTO vehiculos (placa, conductor, capacidad, estado, id_linea)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [placa, conductor, capacidad, estado, id_linea || null]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Error al crear vehículo:", err);
    res.status(500).json({ success: false, error: 'Error al crear el vehículo' });
  }
});

// 🔹 Actualizar un vehículo existente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { placa, conductor, capacidad, estado, id_linea } = req.body;

    const result = await pool.query(
      `UPDATE vehiculos 
       SET placa=$1, conductor=$2, capacidad=$3, estado=$4, id_linea=$5
       WHERE id_vehiculo=$6 RETURNING *`,
      [placa, conductor, capacidad, estado, id_linea || null, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Vehículo no encontrado' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Error al actualizar vehículo:", err);
    res.status(500).json({ success: false, error: 'Error al actualizar el vehículo' });
  }
});

// 🔹 Eliminar un vehículo
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM vehiculos WHERE id_vehiculo=$1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Vehículo no encontrado' });
    }
    res.json({ success: true, message: 'Vehículo eliminado correctamente' });
  } catch (err) {
    console.error("Error al eliminar vehículo:", err);
    res.status(500).json({ success: false, error: 'Error al eliminar el vehículo' });
  }
});

module.exports = router;
