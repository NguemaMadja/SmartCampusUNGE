const express = require('express');
const router = express.Router();
const sequelize = require('../db');

// Obtener todos los departamentos
router.get('/', async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      'SELECT id_departamento, nombre, id_facultad FROM departamentos ORDER BY id_departamento'
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error al obtener departamentos:", err);
    res.status(500).json({ success: false, error: 'Error al obtener los departamentos' });
  }
});

// Obtener departamento por ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      'SELECT id_departamento, nombre, id_facultad FROM departamentos WHERE id_departamento=$1',
      { bind: [req.params.id] }
    );
    if (!rows.length) return res.status(404).json({ success: false, error: 'Departamento no encontrado' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error al obtener departamento:", err);
    res.status(500).json({ success: false, error: 'Error al obtener el departamento' });
  }
});

// Crear departamento
router.post('/', async (req, res) => {
  try {
    const { nombre, id_facultad } = req.body;
    const [rows] = await sequelize.query(
      'INSERT INTO departamentos (nombre, id_facultad) VALUES ($1,$2) RETURNING id_departamento, nombre, id_facultad',
      { bind: [nombre, id_facultad] }
    );
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error al crear departamento:", err);
    res.status(500).json({ success: false, error: 'Error al crear el departamento' });
  }
});

// Actualizar departamento
router.put('/:id', async (req, res) => {
  try {
    const { nombre, id_facultad } = req.body;
    const [rows] = await sequelize.query(
      'UPDATE departamentos SET nombre=$1, id_facultad=$2 WHERE id_departamento=$3 RETURNING id_departamento, nombre, id_facultad',
      { bind: [nombre, id_facultad, req.params.id] }
    );
    if (!rows.length) return res.status(404).json({ success: false, error: 'Departamento no encontrado' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error al actualizar departamento:", err);
    res.status(500).json({ success: false, error: 'Error al actualizar el departamento' });
  }
});

// Eliminar departamento
router.delete('/:id', async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      'DELETE FROM departamentos WHERE id_departamento=$1 RETURNING id_departamento',
      { bind: [req.params.id] }
    );
    if (!rows.length) return res.status(404).json({ success: false, error: 'Departamento no encontrado' });
    res.json({ success: true, message: 'Departamento eliminado correctamente' });
  } catch (err) {
    console.error("Error al eliminar departamento:", err);
    res.status(500).json({ success: false, error: 'Error al eliminar el departamento' });
  }
});

module.exports = router;
