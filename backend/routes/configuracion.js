const express = require("express");
const router = express.Router();
const pool = require("../db"); // conexión a PostgreSQL
const { verificarToken, autorizarRoles } = require("../middleware/auth");

// 🔹 Obtener toda la configuración
router.get("/", verificarToken, autorizarRoles("superadmin"), async (req, res) => {
  try {
    const result = await pool.query("SELECT clave, valor FROM configuracionsistema");
    const config = {};
    result.rows.forEach(row => {
      config[row.clave] = row.valor;
    });
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener configuración" });
  }
});

// 🔹 Guardar/actualizar configuración (SuperAdmin)
router.post("/", verificarToken, autorizarRoles("superadmin"), async (req, res) => {
  const datos = req.body; 
  try {
    for (const clave in datos) {
      await pool.query(
        `INSERT INTO configuracionsistema (clave, valor)
         VALUES ($1, $2)
         ON CONFLICT (clave) DO UPDATE 
         SET valor = EXCLUDED.valor, fecha = CURRENT_TIMESTAMP`,
        [clave, datos[clave]]
      );
    }
    res.json({ mensaje: "Configuración actualizada correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al guardar configuración" });
  }
});

module.exports = router;
