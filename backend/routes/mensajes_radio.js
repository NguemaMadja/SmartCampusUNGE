// backend/routes/mensajes_radio.js
const express = require('express');
const router = express.Router();
const sequelize = require('../db'); // conexión directa con Sequelize

// 🔹 Guardar un nuevo mensaje (público o privado)
router.post('/', async (req, res) => {
  const { id_usuario, rol, contenido, destinatario } = req.body;

  if (!contenido || contenido.trim() === "") {
    return res.status(400).json({ error: "El mensaje no puede estar vacío" });
  }

  try {
    const [result] = await sequelize.query(
      `INSERT INTO mensajes_radio (id_usuario, rol, contenido, destinatario, fecha_hora)
       VALUES (:id_usuario, :rol, :contenido, :destinatario, NOW())
       RETURNING *`,
      {
        replacements: {
          id_usuario,
          rol,
          contenido,
          destinatario: destinatario || null
        }
      }
    );

    res.json(result[0]);
  } catch (err) {
    console.error('Error al guardar mensaje:', err);
    res.status(500).json({ error: 'Error al guardar mensaje' });
  }
});

// 🔹 Listar todos los mensajes (admin)
router.get('/', async (req, res) => {
  try {
    const [result] = await sequelize.query(
      `SELECT * FROM mensajes_radio ORDER BY fecha_hora DESC`
    );
    res.json(result);
  } catch (err) {
    console.error('Error al obtener mensajes:', err);
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
});

// 🔹 Listar mensajes de un usuario específico
router.get('/usuario/:id', async (req, res) => {
  try {
    const [result] = await sequelize.query(
      `SELECT * FROM mensajes_radio WHERE id_usuario = :id ORDER BY fecha_hora DESC`,
      { replacements: { id: req.params.id } }
    );
    res.json(result);
  } catch (err) {
    console.error('Error al obtener mensajes de usuario:', err);
    res.status(500).json({ error: 'Error al obtener mensajes de usuario' });
  }
});

// 🔹 Listar mensajes privados entre dos usuarios
router.get('/privados/:id1/:id2', async (req, res) => {
  const { id1, id2 } = req.params;
  try {
    const [result] = await sequelize.query(
      `SELECT * FROM mensajes_radio 
       WHERE destinatario IS NOT NULL
         AND ((id_usuario = :id1 AND destinatario = :id2) 
           OR (id_usuario = :id2 AND destinatario = :id1))
       ORDER BY fecha_hora DESC`,
      { replacements: { id1, id2 } }
    );
    res.json(result);
  } catch (err) {
    console.error('Error al obtener mensajes privados:', err);
    res.status(500).json({ error: 'Error al obtener mensajes privados' });
  }
});

module.exports = router;
