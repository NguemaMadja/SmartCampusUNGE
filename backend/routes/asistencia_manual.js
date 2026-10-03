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

    // Validar QR
    const [qrRows] = await sequelize.query(
      'SELECT id_aula FROM qr_aulas WHERE codigo_qr=$1 AND valido_hasta > NOW()',
      { bind: [codigo_qr] }
    );
    if (!qrRows.length) {
      return res.status(404).json({ success: false, error: 'Código inválido o expirado' });
    }
    const id_aula = qrRows[0].id_aula;

    // Resolver relaciones académicas del profesor
    const [relRows] = await sequelize.query(
      `SELECT 
         pf.id_facultad, 
         pd.id_departamento, 
         pc.id_carrera, 
         pa.id_asignatura
       FROM profesores p
       LEFT JOIN profesorfacultad pf ON p.id_profesor = pf.id_profesor
       LEFT JOIN profesordepartamento pd ON p.id_profesor = pd.id_profesor
       LEFT JOIN profesorcarrera pc ON p.id_profesor = pc.id_profesor
       LEFT JOIN profesorasignatura pa ON p.id_profesor = pa.id_profesor
       WHERE p.id_profesor=$1`,
      { bind: [id_profesor] }
    );

    if (!relRows.length) {
      return res.status(404).json({ success: false, error: 'Relaciones académicas no encontradas para el profesor' });
    }

    const { id_facultad, id_departamento, id_carrera, id_asignatura } = relRows[0];

    // Insertar asistencia completa
    const [rows] = await sequelize.query(
      `INSERT INTO asistencia_profesor 
       (id_profesor, id_aula, id_asignatura, id_carrera, id_departamento, id_facultad, fecha, hora_entrada, estado, codigo_qr)
       VALUES ($1,$2,$3,$4,$5,$6,CURRENT_DATE,CURRENT_TIME,'Presente',$7)
       RETURNING *`,
      { bind: [id_profesor, id_aula, id_asignatura, id_carrera, id_departamento, id_facultad, codigo_qr] }
    );

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error al registrar asistencia manual:", err);
    res.status(500).json({ success: false, error: 'Error al registrar la asistencia manual' });
  }
});

module.exports = router;
