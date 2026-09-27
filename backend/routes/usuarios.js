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

// 🔹 Editar usuario (PUT)
router.put('/:id', verificarToken, autorizarRoles('superadmin'), async (req, res) => {
  const { id } = req.params;
  const { nombre, correo, password, rol } = req.body;

  try {
    const [result] = await sequelize.query(
      'UPDATE usuarios SET nombre=$1, correo=$2, password=$3, rol=$4 WHERE id_usuario=$5 RETURNING id_usuario, nombre, correo, rol',
      {
        bind: [nombre, correo, password, rol, id],
        type: QueryTypes.UPDATE
      }
    );

    if (!result || result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Usuario actualizado correctamente',
      data: result[0]
    });
  } catch (err) {
    console.error('Error al actualizar usuario:', err.message);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar usuario',
      error: err.message
    });
  }
});

// 🔹 Eliminar usuario
router.delete('/:id', verificarToken, autorizarRoles('superadmin'), async (req, res) => {
  const { id } = req.params;
  try {
    const result = await sequelize.query(
      'DELETE FROM usuarios WHERE id_usuario=$1 RETURNING id_usuario',
      { bind: [id], type: QueryTypes.DELETE }
    );

    if (!result || result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Usuario eliminado correctamente'
    });
  } catch (err) {
    console.error('Error al eliminar usuario:', err.message);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar usuario',
      error: err.message
    });
  }
});

module.exports = router;
