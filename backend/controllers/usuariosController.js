// backend/controllers/usuariosController.js
const Usuario = require('../src/models/Usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Registrar usuario
exports.register = async (req, res) => {
  const { nombre, correo, password, rol } = req.body;
  try {
    // Generar hash seguro de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario en la BD
    await Usuario.create({
      nombre,
      correo,
      password: hashedPassword,
      rol
    });

    res.json({ success: true, message: 'Usuario registrado correctamente' });
  } catch (err) {
    console.error('Error en registro:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Login usuario
exports.login = async (req, res) => {
  const { correo, password } = req.body;
  try {
    // Buscar usuario por correo
    const user = await Usuario.findOne({ where: { correo } });
    if (!user) {
      return res.status(400).json({ success: false, error: 'Usuario no encontrado' });
    }

    // Comparar contraseña ingresada con el hash almacenado
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ success: false, error: 'Contraseña incorrecta' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id_usuario, rol: user.rol },
      process.env.JWT_SECRET || 'clave_secreta',
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      usuario: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol
      }
    });
  } catch (err) {
    console.error('Error en login:', err.message);
    res.status(500).json({ error: err.message });
  }
};
