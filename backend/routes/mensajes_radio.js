// backend/routes/mensajes_radio.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); // conexión directa a BD (PostgreSQL con pg/pool)

// 🔹 Guardar un nuevo mensaje (público o privado)
router.post('/', async (req, res) => {
  const { id_usuario, rol, contenido, destinatario } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO mensajes_radio (id_usuario, rol, contenido, destinatario, fecha_hora)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [id_usuario, rol, contenido, destinatario || null]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al guardar mensaje:', err);
    res.status(500).json({ error: 'Error al guardar mensaje' });
  }
});

// 🔹 Listar todos los mensajes (admin)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM mensajes_radio ORDER BY fecha_hora DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener mensajes:', err);
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
});

// 🔹 Listar mensajes de un usuario específico
router.get('/usuario/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM mensajes_radio WHERE id_usuario = $1 ORDER BY fecha_hora DESC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener mensajes de usuario:', err);
    res.status(500).json({ error: 'Error al obtener mensajes de usuario' });
  }
});

// 🔹 Listar mensajes privados entre dos usuarios
router.get('/privados/:id1/:id2', async (req, res) => {
  const { id1, id2 } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM mensajes_radio 
       WHERE (id_usuario = $1 AND destinatario = $2) 
          OR (id_usuario = $2 AND destinatario = $1)
       ORDER BY fecha_hora DESC`,
      [id1, id2]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener mensajes privados:', err);
    res.status(500).json({ error: 'Error al obtener mensajes privados' });
  }
});

module.exports = router;
