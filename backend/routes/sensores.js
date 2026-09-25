// routes/sensores.js
const express = require('express');
const router = express.Router();
const Sensor = require('../src/models/Sensor');

// Obtener lecturas y determinar presencia
router.get('/', async (req, res) => {
  try {
    const lecturas = await Sensor.findAll({ order: [['fecha', 'DESC']] });

    // Lógica simple de presencia
    const ultima = lecturas[0];
    let presencia = false;
    if (ultima && ultima.tipo === 'co2' && ultima.valor > 400) {
      presencia = true;
    }

    res.json({
      lecturas,
      presencia,
      alerta: presencia ? null : '⚠️ Aula vacía, cortar electricidad para ahorrar energía'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
