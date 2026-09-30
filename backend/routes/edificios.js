// backend/routes/edificios.js
const express = require('express');
const router = express.Router();
const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // conexión Sequelize

// 🔹 Definición del modelo Edificio
const Edificio = sequelize.define('Edificio', {
  id_edificio: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre_lugar: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  latitud: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  longitud: {
    type: DataTypes.DOUBLE,
    allowNull: false
  }
}, {
  tableName: 'edificios',
  timestamps: false
});

// 🔹 Sincronizar modelo (opcional, solo si quieres que Sequelize cree la tabla)
Edificio.sync()
  .then(() => console.log('Tabla edificios lista'))
  .catch(err => console.error('Error al sincronizar tabla edificios:', err));

// =======================
// 📌 RUTAS CRUD
// =======================

// GET todos los edificios
router.get('/', async (req, res) => {
  try {
    const edificios = await Edificio.findAll();
    res.json({ data: edificios });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener edificios', details: err });
  }
});

// GET un edificio por ID
router.get('/:id', async (req, res) => {
  try {
    const edificio = await Edificio.findByPk(req.params.id);
    if (!edificio) return res.status(404).json({ error: 'Edificio no encontrado' });
    res.json({ data: edificio });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener edificio', details: err });
  }
});

// POST crear edificio
router.post('/', async (req, res) => {
  try {
    const { nombre_lugar, latitud, longitud } = req.body;
    const nuevo = await Edificio.create({ nombre_lugar, latitud, longitud });
    res.json({ data: nuevo });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear edificio', details: err });
  }
});

// PUT actualizar edificio
router.put('/:id', async (req, res) => {
  try {
    const { nombre_lugar, latitud, longitud } = req.body;
    const edificio = await Edificio.findByPk(req.params.id);
    if (!edificio) return res.status(404).json({ error: 'Edificio no encontrado' });

    await edificio.update({ nombre_lugar, latitud, longitud });
    res.json({ data: edificio });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar edificio', details: err });
  }
});

// DELETE eliminar edificio
router.delete('/:id', async (req, res) => {
  try {
    const edificio = await Edificio.findByPk(req.params.id);
    if (!edificio) return res.status(404).json({ error: 'Edificio no encontrado' });

    await edificio.destroy();
    res.json({ message: 'Edificio eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar edificio', details: err });
  }
});

module.exports = router;
