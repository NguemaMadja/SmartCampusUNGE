// backend/routes/control_radio.js
const express = require('express');
const router = express.Router();

// 🔹 Estado de la radio en memoria (puedes luego enlazarlo con Icecast/Darkice)
let estadoRadio = {
  estado: "Apagada",
  programa_actual: "Ninguno",
  oyentes_actuales: 0
};

// 🔹 Endpoint para controlar la radio
router.post('/', (req, res) => {
  const { accion } = req.body;

  switch (accion) {
    case "encender":
      estadoRadio.estado = "Encendida";
      break;
    case "apagar":
      estadoRadio.estado = "Apagada";
      estadoRadio.programa_actual = "Ninguno";
      break;
    case "musica":
      estadoRadio.programa_actual = "Música";
      break;
    case "programa":
      estadoRadio.programa_actual = "Programa en vivo";
      break;
    default:
      return res.status(400).json({ error: "Acción no reconocida" });
  }

  res.json(estadoRadio);
});

// 🔹 Endpoint opcional para consultar estado actual
router.get('/', (req, res) => {
  res.json(estadoRadio);
});

module.exports = router;
