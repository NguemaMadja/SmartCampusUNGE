// backend/controllers/usuariosController.js
const Usuario = require('../src/models/Usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Registrar usuario
exports.register = async (req, res) => {
  const { nombre, correo, password, rol } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const nuevoUsuario = await Usuario.create({
      nombre,
      correo,
      password: hashedPassword,
      rol
    });

    res.json({
      success: true,
      message: 'Usuario registrado correctamente',
      data: {
        id_usuario: nuevoUsuario.id_usuario,
        nombre: nuevoUsuario.nombre,
        correo: nuevoUsuario.correo,
        rol: nuevoUsuario.rol
      }
    });
  } catch (err) {
    console.error('Error en registro:', err.message);
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: err.message
    });
  }
};

// Login usuario
exports.login = async (req, res) => {
  const { correo, password } = req.body;
  try {
    const user = await Usuario.findOne({ where: { correo } });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({
        success: false,
        message: 'Contraseña incorrecta'
      });
    }

    const token = jwt.sign(
      { id: user.id_usuario, rol: user.rol },
      process.env.JWT_SECRET || 'clave_secreta',
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        usuario: {
          id_usuario: user.id_usuario,
          nombre: user.nombre,
          correo: user.correo,
          rol: user.rol
        }
      }
    });
  } catch (err) {
    console.error('Error en login:', err.message);
    res.status(500).json({
      success: false,
      message: 'Error interno en login',
      error: err.message
    });
  }
};

// Listar usuarios (solo superadmin)
exports.listarUsuarios = async () => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: ['id_usuario', 'nombre', 'correo', 'rol']
    });
    return {
      success: true,
      message: 'Usuarios listados correctamente',
      data: usuarios
    };
  } catch (err) {
    console.error('Error en listar usuarios:', err.message);
    return {
      success: false,
      message: 'Error al listar usuarios',
      error: err.message
    };
  }
};
