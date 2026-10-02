const express = require('express');
const router = express.Router();
const sequelize = require('../db');

// Obtener asistencia con filtros
router.get('/', async (req, res) => {
  try {
    const { facultad, departamento, carrera, asignatura, fecha } = req.query;
    let query = `
      SELECT ap.id_asistencia,
             ap.fecha,
             ap.hora_entrada,
             ap.estado,
             ap.codigo_qr,
             p.nombre AS profesor,
             f.nombre AS facultad,
             d.nombre AS departamento,
             c.nombre AS carrera,
             a.nombre AS asignatura,
             u.nombre AS aula
      FROM asistencia_profesor ap
      JOIN profesores p ON ap.id_profesor = p.id_profesor
      JOIN asignaturas a ON ap.id_asignatura = a.id_asignatura
      JOIN aulas u ON ap.id_aula = u.id_aula
      JOIN departamentos d ON ap.id_departamento = d.id_departamento
      JOIN facultades f ON ap.id_facultad = f.id_facultad
      JOIN carreras c ON ap.id_carrera = c.id_carrera
      WHERE 1=1
    `;
    const params = [];
    if (facultad) { params.push(facultad); query += ` AND ap.id_facultad = $${params.length}`; }
    if (departamento) { params.push(departamento); query += ` AND ap.id_departamento = $${params.length}`; }
    if (carrera) { params.push(carrera); query += ` AND ap.id_carrera = $${params.length}`; }
    if (asignatura) { params.push(asignatura); query += ` AND ap.id_asignatura = $${params.length}`; }
    if (fecha) { params.push(fecha); query += ` AND DATE(ap.fecha) = $${params.length}`; }

    const [rows] = await sequelize.query(query, { bind: params });
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error al obtener asistencia_profesor:", err);
    res.status(500).json({ success: false, error: 'Error al obtener asistencia_profesor' });
  }
});

// Registrar asistencia
router.post('/', async (req, res) => {
  try {
    const { id_profesor, id_facultad, id_departamento, id_carrera, id_asignatura, id_aula, fecha, hora_entrada, estado, codigo_qr } = req.body;
    const [rows] = await sequelize.query(
      `INSERT INTO asistencia_profesor 
       (id_profesor, id_facultad, id_departamento, id_carrera, id_asignatura, id_aula, fecha, hora_entrada, estado, codigo_qr) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      { bind: [id_profesor, id_facultad, id_departamento, id_carrera, id_asignatura, id_aula, fecha, hora_entrada, estado, codigo_qr] }
    );
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error al registrar asistencia_profesor:", err);
    res.status(500).json({ success: false, error: 'Error al registrar asistencia_profesor' });
  }
});

module.exports = router;
