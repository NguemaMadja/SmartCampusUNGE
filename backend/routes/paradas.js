// backend/routes/paradas.js
const express = require('express');
const router = express.Router();
const { Parada } = require('../models'); // Modelo Sequelize de Parada

// 🔹 Obtener todas las paradas
router.get('/', async (req, res) => {
  try {
    const paradas = await Parada.findAll({ order: [['id_parada', 'ASC']] });
    res.json(paradas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener paradas' });
  }
});

// 🔹 Obtener paradas de una ruta específica
router.get('/ruta/:id_ruta', async (req, res) => {
  try {
    const { id_ruta } = req.params;
    const paradas = await Parada.findAll({
      where: { id_ruta },
      order: [['orden', 'ASC']]
    });
    res.json(paradas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener paradas de la ruta' });
  }
});

// 🔹 Crear una nueva parada
router.post('/', async (req, res) => {
  try {
    const { id_ruta, nombre, latitud, longitud, orden } = req.body;
    const nuevaParada = await Parada.create({ id_ruta, nombre, latitud, longitud, orden });
    res.json(nuevaParada);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear parada' });
  }
});

// 🔹 Actualizar una parada
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { id_ruta, nombre, latitud, longitud, orden } = req.body;
    const parada = await Parada.findByPk(id);
    if (!parada) return res.status(404).json({ error: 'Parada no encontrada' });

    await parada.update({ id_ruta, nombre, latitud, longitud, orden });
    res.json(parada);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar parada' });
  }
});

// 🔹 Eliminar una parada
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const parada = await Parada.findByPk(id);
    if (!parada) return res.status(404).json({ error: 'Parada no encontrada' });

    await parada.destroy();
    res.json({ message: 'Parada eliminada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar parada' });
  }
});

module.exports = router;
