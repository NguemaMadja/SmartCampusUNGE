const jwt = require('jsonwebtoken');

// Verifica que el token JWT sea válido
function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(403).json({ error: 'Token requerido' });

  const token = authHeader.split(' ')[1]; // formato: "Bearer <token>"
  try {
    // 🔹 Usa la misma clave que en usuariosController.js
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'clave_secreta');
    req.user = decoded; // guarda rol y demás datos en req.user
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

// Autoriza solo a ciertos roles
function autorizarRoles(...rolesPermitidos) {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    next();
  };
}

module.exports = { verificarToken, autorizarRoles };
