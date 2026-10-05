// backend/routes/relaciones.js
const express = require('express');
const router = express.Router();
const sequelize = require('../db'); // conexión Sequelize

// =======================
// GET: Listar todas las relaciones
// =======================
router.get('/', async (req, res) => {
  try {
    const [rows] = await sequelize.query(`
      SELECT r.id_relacion,
             p.nombre AS profesor,
             f.nombre AS facultad,
             d.nombre AS departamento,
             c.nombre AS carrera,
             a.nombre AS asignatura
      FROM relaciones r
      JOIN profesores p ON r.id_profesor = p.id_profesor
      LEFT JOIN facultades f ON r.id_facultad = f.id_facultad
      LEFT JOIN departamentos d ON r.id_departamento = d.id_departamento
      LEFT JOIN carreras c ON r.id_carrera = c.id_carrera
      LEFT JOIN asignaturas a ON r.id_asignatura = a.id_asignatura
      ORDER BY r.id_relacion ASC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error obteniendo relaciones:", err);
    res.status(500).json({ success: false, error: "Error obteniendo relaciones" });
  }
});

// =======================
// POST: Crear nueva relación
// =======================
router.post('/', async (req, res) => {
  try {
    console.log("Datos recibidos en POST /relaciones:", req.body);
    const { id_profesor, id_facultad, id_departamento, id_carrera, id_asignatura } = req.body;

    const [result] = await sequelize.query(
      `INSERT INTO relaciones (id_profesor, id_facultad, id_departamento, id_carrera, id_asignatura)
       VALUES (?, ?, ?, ?, ?) RETURNING *`,
      {
        replacements: [id_profesor, id_facultad, id_departamento, id_carrera, id_asignatura],
        type: sequelize.QueryTypes.INSERT
      }
    );

    res.json({ success: true, data: result[0] });
  } catch (err) {
    console.error("Error creando relación:", err);
    res.status(500).json({ success: false, error: "Error creando relación" });
  }
});

// =======================
// PUT: Actualizar relación
// =======================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { id_facultad, id_departamento, id_carrera, id_asignatura } = req.body;

    const [result] = await sequelize.query(
      `UPDATE relaciones
       SET id_facultad = ?, id_departamento = ?, id_carrera = ?, id_asignatura = ?
       WHERE id_relacion = ? RETURNING *`,
      {
        replacements: [id_facultad, id_departamento, id_carrera, id_asignatura, id],
        type: sequelize.QueryTypes.UPDATE
      }
    );

    res.json({ success: true, data: result[0] });
  } catch (err) {
    console.error("Error actualizando relación:", err);
    res.status(500).json({ success: false, error: "Error actualizando relación" });
  }
});

// =======================
// DELETE: Eliminar relación
// =======================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await sequelize.query(`DELETE FROM relaciones WHERE id_relacion = ?`, {
      replacements: [id],
      type: sequelize.QueryTypes.DELETE
    });
    res.json({ success: true });
  } catch (err) {
    console.error("Error eliminando relación:", err);
    res.status(500).json({ success: false, error: "Error eliminando relación" });
  }
});

module.exports = router;
