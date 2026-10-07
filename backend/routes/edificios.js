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
  nombre: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  ubicacion: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  lat: {
    type: DataTypes.DOUBLE,
    allowNull: true
  },
  lng: {
    type: DataTypes.DOUBLE,
    allowNull: true
  }
}, {
  tableName: 'edificios',
  timestamps: false
});

// =======================
// 📌 RUTAS CRUD
// =======================

// GET todos los edificios
router.get('/', async (req, res) => {
  try {
    const edificios = await Edificio.findAll();
    res.json({ data: edificios });
  } catch (err) {
    console.error("Error al obtener edificios:", err);
    res.status(500).json({ error: 'Error al obtener edificios' });
  }
});

// GET un edificio por ID
router.get('/:id', async (req, res) => {
  try {
    const edificio = await Edificio.findByPk(req.params.id);
    if (!edificio) return res.status(404).json({ error: 'Edificio no encontrado' });
    res.json({ data: edificio });
  } catch (err) {
    console.error("Error al obtener edificio:", err);
    res.status(500).json({ error: 'Error al obtener edificio' });
  }
});

// POST crear edificio
router.post('/', async (req, res) => {
  try {
    const { nombre, ubicacion, lat, lng } = req.body;
    const nuevo = await Edificio.create({ nombre, ubicacion, lat, lng });
    res.json({ data: nuevo });
  } catch (err) {
    console.error("Error al crear edificio:", err);
    res.status(500).json({ error: 'Error al crear edificio' });
  }
});

// PUT actualizar edificio
router.put('/:id', async (req, res) => {
  try {
    const { nombre, ubicacion, lat, lng } = req.body;
    const edificio = await Edificio.findByPk(req.params.id);
    if (!edificio) return res.status(404).json({ error: 'Edificio no encontrado' });

    await edificio.update({ nombre, ubicacion, lat, lng });
    res.json({ data: edificio });
  } catch (err) {
    console.error("Error al actualizar edificio:", err);
    res.status(500).json({ error: 'Error al actualizar edificio' });
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
    console.error("Error al eliminar edificio:", err);
    res.status(500).json({ error: 'Error al eliminar edificio' });
  }
});

// 🔹 Endpoint de métricas
router.get('/metricas', async (req, res) => {
  try {
    const [rows] = await sequelize.query(`
      SELECT 
        COUNT(*)::int AS total_edificios,
        COALESCE(AVG(lat),0) AS lat_promedio,
        COALESCE(AVG(lng),0) AS lng_promedio
      FROM edificios
    `);
    res.json({ data: rows[0] });
  } catch (err) {
    console.error("Error al obtener métricas:", err);
    res.status(500).json({ error: 'Error al obtener métricas' });
  }
});

module.exports = router;
