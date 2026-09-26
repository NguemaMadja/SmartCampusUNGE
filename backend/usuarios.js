// backend/routes/usuarios.js
const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const { verificarToken, autorizarRoles } = require('../middleware/auth');

// 🔹 Registro (público)
router.post('/register', usuariosController.register);

// 🔹 Login (público, con bcrypt + JWT)
router.post('/login', usuariosController.login);

// 🔹 Listar usuarios (solo superadmin)
router.get('/', verificarToken, autorizarRoles('superadmin'), async (req, res) => {
  try {
    const usuarios = await usuariosController.listarUsuarios();
    res.json(usuarios);
  } catch (err) {
    console.error('Error en listar usuarios:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Perfil (cualquier usuario autenticado)
router.get('/perfil', verificarToken, (req, res) => {
  res.json({ message: `Bienvenido ${req.user.rol}`, usuario: req.user });
});

module.exports = router;
