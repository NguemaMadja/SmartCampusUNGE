// routes/qr.js
const express = require('express');
const QRCode = require('qrcode');
const router = express.Router();

// Generar QR para asistencia
router.get('/:id_usuario/:id_asignatura', async (req, res) => {
  try {
    const { id_usuario, id_asignatura } = req.params;

    // Datos que se codifican en el QR
    const data = JSON.stringify({ id_usuario, id_asignatura });

    // Generar QR en base64
    const qr = await QRCode.toDataURL(data);

    res.json({ qr });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
