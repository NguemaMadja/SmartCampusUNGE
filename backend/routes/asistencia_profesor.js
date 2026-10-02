const express = require('express');
const router = express.Router();
const sequelize = require('../db');

// Obtener todas las asistencias de profesores
router.get('/', async (req, res) => {
  try {
    const [rows] = await sequelize.query(`
      SELECT ap.id_asistencia,
             p.nombre AS profesor,
             s.nombre AS asignatura,
             u.nombre AS aula,
             ap.fecha,
             ap.hora_entrada,
             ap.estado,
             ap.codigo_qr
      FROM asistencia_profesor ap
      JOIN profesores p ON ap.id_profesor = p.id_profesor
      JOIN asignaturas s ON ap.id_asignatura = s.id_asignatura
      JOIN aulas u ON ap.id_aula = u.id_aula
      ORDER BY ap.fecha DESC, ap.hora_entrada DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error al obtener asistencia_profesor:", err);
    res.status(500).json({ success: false, error: 'Error al obtener asistencia_profesor' });
  }
});

// Registrar asistencia de profesor
router.post('/', async (req, res) => {
  try {
    const { id_profesor, id_asignatura, id_aula, fecha, hora_entrada, estado, codigo_qr } = req.body;
    const [rows] = await sequelize.query(
      `INSERT INTO asistencia_profesor 
       (id_profesor, id_asignatura, id_aula, fecha, hora_entrada, estado, codigo_qr) 
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      { bind: [id_profesor, id_asignatura, id_aula, fecha, hora_entrada, estado, codigo_qr] }
    );
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error al registrar asistencia_profesor:", err);
    res.status(500).json({ success: false, error: 'Error al registrar asistencia_profesor' });
  }
});

module.exports = router;
