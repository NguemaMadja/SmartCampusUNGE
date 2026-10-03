const express = require('express');
const router = express.Router();
const pool = require('../db'); // Ajusta según tu configuración de conexión

// =======================
// GET: Listar todas las relaciones
// =======================
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
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
    res.json({ success: true, data: result.rows });
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
    const { id_profesor, facultades, departamentos, carreras, asignaturas } = req.body;

    // Insertar múltiples vínculos según arrays recibidos
    let inserted = [];
    for (const f of facultades) {
      for (const d of departamentos) {
        for (const c of carreras) {
          for (const a of asignaturas) {
            const result = await pool.query(
              `INSERT INTO relaciones (id_profesor, id_facultad, id_departamento, id_carrera, id_asignatura)
               VALUES ($1, $2, $3, $4, $5) RETURNING *`,
              [id_profesor, f, d, c, a]
            );
            inserted.push(result.rows[0]);
          }
        }
      }
    }

    res.json({ success: true, data: inserted });
  } catch (err) {
    console.error("Error creando relación:", err);
    res.status(500).json({ success: false, error: "Error creando relación" });
  }
});

// =======================
// PUT: Actualizar relación existente
// =======================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { facultades, departamentos, carreras, asignaturas } = req.body;

    // Actualizar la relación principal (ejemplo: tomar el primer valor de cada array)
    const result = await pool.query(
      `UPDATE relaciones
       SET id_facultad = $1,
           id_departamento = $2,
           id_carrera = $3,
           id_asignatura = $4
       WHERE id_relacion = $5 RETURNING *`,
      [facultades[0], departamentos[0], carreras[0], asignaturas[0], id]
    );

    res.json({ success: true, data: result.rows[0] });
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
    await pool.query(`DELETE FROM relaciones WHERE id_relacion = $1`, [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Error eliminando relación:", err);
    res.status(500).json({ success: false, error: "Error eliminando relación" });
  }
});

module.exports = router;
