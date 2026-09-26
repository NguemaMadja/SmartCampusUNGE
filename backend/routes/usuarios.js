// backend/routes/usuarios.js
const { verificarToken, autorizarRoles } = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const { QueryTypes } = require('sequelize');
const sequelize = require('../db');

// Registro (público)
router.post('/register', usuariosController.register);

// Login (público)
router.post('/login', usuariosController.login);

// Listar usuarios (solo superadmin)
router.get('/', verificarToken, autorizarRoles('superadmin'), async (req, res) => {
  try {
    const result = await sequelize.query(
      'SELECT id_usuario, nombre, correo, rol FROM usuarios',
      { type: QueryTypes.SELECT }
    );
    res.json({
      success: true,
      message: 'Usuarios listados correctamente',
      data: result
    });
  } catch (err) {
    console.error('Error en listar usuarios:', err.message);
    res.status(500).json({
      success: false,
      message: 'Error al listar usuarios',
      error: err.message
    });
  }
});

// Perfil (cualquier usuario autenticado)
router.get('/perfil', verificarToken, (req, res) => {
  res.json({
    success: true,
    message: `Bienvenido ${req.user.rol}`,
    usuario: req.user
  });
});

module.exports = router;
