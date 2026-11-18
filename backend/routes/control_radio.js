// backend/routes/control_radio.js

const express = require('express');

const router = express.Router();



// =====================================
// ESTADO TEMPORAL DE RADIO
// =====================================

let estadoRadio = {

  estado: "Apagada",

  modo: "ninguno",

  programa_actual: "Ninguno",

  oyentes_actuales: 0,

  ultima_accion: null,

  fecha_actualizacion: null

};



// =====================================
// CONSULTAR ESTADO
// =====================================

router.get('/', (req, res) => {

  res.json(estadoRadio);

});



// =====================================
// CONTROL DE RADIO
// =====================================

router.post('/', async (req, res) => {

  try {

    const { accion } = req.body;

    if (!accion) {

      return res.status(400).json({
        error: "Debe indicar una acción"
      });

    }



    switch (accion) {

      case "encender":

        estadoRadio.estado =
          "Encendida";

        estadoRadio.ultima_accion =
          "Encender Radio";

        break;



      case "apagar":

        estadoRadio.estado =
          "Apagada";

        estadoRadio.modo =
          "ninguno";

        estadoRadio.programa_actual =
          "Ninguno";

        estadoRadio.ultima_accion =
          "Apagar Radio";

        break;



      case "musica":

        estadoRadio.estado =
          "Encendida";

        estadoRadio.modo =
          "musica";

        estadoRadio.programa_actual =
          "Música";

        estadoRadio.ultima_accion =
          "Pasar a Música";

        break;



      case "programa":

        estadoRadio.estado =
          "Encendida";

        estadoRadio.modo =
          "programa";

        estadoRadio.programa_actual =
          "Programa en vivo";

        estadoRadio.ultima_accion =
          "Pasar a Programa";

        break;



      default:

        return res.status(400).json({

          error:
            "Acción no reconocida"

        });

    }



    estadoRadio.fecha_actualizacion =
      new Date();



    console.log(
      `[RADIO] ${estadoRadio.ultima_accion}`
    );



    res.json({

      success: true,

      mensaje:
        `${estadoRadio.ultima_accion} ejecutado correctamente`,

      estadoRadio

    });

  }

  catch (error) {

    console.error(
      "Error control radio:",
      error
    );

    res.status(500).json({

      error:
        "Error interno del servidor"

    });

  }

});



module.exports = router;
