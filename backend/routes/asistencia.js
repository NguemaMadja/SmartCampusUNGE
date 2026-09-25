// routes/asistencia.js
const express = require('express');
const router = express.Router();
const Asistencia = require('../src/models/Asistencia');

// Registrar asistencia vía QR
router.post('/', async (req, res) => {
  try {
    const { id_usuario, id_asignatura } = req.body;

    if (!id_usuario || !id_asignatura) {
      return res.status(400).json({ error: 'Faltan datos: usuario o asignatura' });
    }

    const registro = await Asistencia.create({
      id_usuario,
      id_asignatura,
      fecha: new Date()
    });

    res.json({ mensaje: 'Asistencia registrada', registro });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Consultar asistencias
router.get('/', async (req, res) => {
  try {
    const registros = await Asistencia.findAll({ order: [['fecha', 'DESC']] });
    res.json(registros);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
