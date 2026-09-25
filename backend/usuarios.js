// backend/routes/usuarios.js
const express = require('express');
const router = express.Router();
const { QueryTypes } = require('sequelize');
const sequelize = require('../db'); // conexión Sequelize

// 🔹 Login de usuario con Sequelize
router.post('/login', async (req, res) => {
  try {
    const { correo, password } = req.body;

    const result = await sequelize.query(
      'SELECT id_usuario, nombre, correo, rol FROM usuarios WHERE correo = :correo AND password = :password',
      {
        replacements: { correo, password },
        type: QueryTypes.SELECT
      }
    );

    if (result.length === 0) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    const usuario = result[0];

    res.json({
      success: true,
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol
    });
  } catch (err) {
  console.error('Error en login:', err.message, err.stack);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

module.exports = router;
