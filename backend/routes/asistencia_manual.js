const express = require('express');
const router = express.Router();
const sequelize = require('../db');

// Registrar asistencia manual
router.post('/', async (req, res) => {
  try {
    const { id_profesor, codigo_qr } = req.body;

    if (!id_profesor || !codigo_qr) {
      return res.status(400).json({ success: false, error: 'Todos los campos deben completarse' });
    }

    // Validar que el código QR existe y está vigente
    const [qrRows] = await sequelize.query(
      'SELECT id_qr, id_aula, id_asignatura FROM qr_aulas qa JOIN asignaturas a ON qa.id_aula=a.id_aula WHERE codigo_qr=$1 AND valido_hasta > NOW()',
      { bind: [codigo_qr] }
    );

    if (!qrRows.length) {
      return res.status(404).json({ success: false, error: 'Código inválido o expirado' });
    }

    const { id_aula, id_asignatura } = qrRows[0];

    // Insertar asistencia en la tabla real
    const [rows] = await sequelize.query(
      `INSERT INTO asistencia_profesor 
       (id_profesor, id_aula, id_asignatura, fecha, hora_entrada, estado, codigo_qr) 
       VALUES ($1, $2, $3, CURRENT_DATE, CURRENT_TIME, 'Presente', $4) 
       RETURNING id_asistencia, id_profesor, id_aula, id_asignatura, fecha, hora_entrada, estado, codigo_qr`,
      { bind: [id_profesor, id_aula, id_asignatura, codigo_qr] }
    );

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error al registrar asistencia manual:", err);
    res.status(500).json({ success: false, error: 'Error al registrar la asistencia manual' });
  }
});

module.exports = router;
