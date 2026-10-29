// backend/routes/radio.js
const express = require('express');
const router = express.Router();

// Estado inicial de la radio
let estadoRadio = "Apagada";
let programaActual = "Ninguno";
let oyentesActuales = 0;

// 🔹 Control de radio
router.post('/', async (req, res) => {
  const { accion } = req.body;

  try {
    switch (accion) {
      case "encender":
        estadoRadio = "Encendida";
        break;
      case "apagar":
        estadoRadio = "Apagada";
        programaActual = "Ninguno";
        oyentesActuales = 0;
        break;
      case "musica":
        programaActual = "Música";
        break;
      case "programa":
        programaActual = "Programa en vivo";
        break;
      default:
        return res.status(400).json({ error: "Acción no válida" });
    }

    res.json({
      estado: estadoRadio,
      programa_actual: programaActual,
      oyentes_actuales: oyentesActuales
    });
  } catch (err) {
    console.error("Error en POST /api/control_radio:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
