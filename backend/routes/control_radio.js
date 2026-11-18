// backend/routes/control_radio.js

const express = require('express');
const { QueryTypes } = require('sequelize');
const sequelize = require('../db');

const router = express.Router();



// =====================================
// CONSULTAR ESTADO ACTUAL DE LA RADIO
// =====================================

router.get('/', async (req, res) => {

  try {

    const estado = await sequelize.query(

      `
      SELECT *
      FROM radio_estado
      WHERE id_estado = 1
      `,
      {
        type: QueryTypes.SELECT
      }

    );

    if (!estado.length) {

      return res.status(404).json({
        error: "No existe configuración de radio"
      });

    }

    res.json(estado[0]);

  }

  catch (error) {

    console.error(
      "Error consultando radio:",
      error
    );

    res.status(500).json({
      error: "Error interno del servidor"
    });

  }

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

    let estado = "Apagada";
    let modo = "ninguno";
    let programa_actual = "Ninguno";
    let ultima_accion = "";



    switch (accion) {

      case "encender":

        estado = "Encendida";
        modo = "ninguno";
        programa_actual = "Ninguno";
        ultima_accion = "Encender Radio";

        break;



      case "apagar":

        estado = "Apagada";
        modo = "ninguno";
        programa_actual = "Ninguno";
        ultima_accion = "Apagar Radio";

        break;



      case "musica":

        estado = "Encendida";
        modo = "musica";
        programa_actual = "Música";
        ultima_accion = "Pasar a Música";

        break;



      case "programa":

        estado = "Encendida";
        modo = "programa";
        programa_actual = "Programa en vivo";
        ultima_accion = "Pasar a Programa";

        break;



      default:

        return res.status(400).json({

          error:
            "Acción no reconocida"

        });

    }



    // ===============================
    // ACTUALIZAR ESTADO DE RADIO
    // ===============================

    await sequelize.query(

      `
      UPDATE radio_estado
      SET
          estado = :estado,
          modo = :modo,
          programa_actual = :programa_actual,
          ultima_accion = :ultima_accion,
          fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id_estado = 1
      `,
      {
        replacements: {
          estado,
          modo,
          programa_actual,
          ultima_accion
        }
      }

    );



    // ===============================
    // REGISTRAR EVENTO
    // ===============================

    await sequelize.query(

      `
      INSERT INTO radio_eventos (
          accion,
          estado_radio,
          modo_radio,
          programa_actual,
          usuario,
          observacion
      )
      VALUES (
          :accion,
          :estado_radio,
          :modo_radio,
          :programa_actual,
          :usuario,
          :observacion
      )
      `,
      {
        replacements: {

          accion:
            ultima_accion,

          estado_radio:
            estado,

          modo_radio:
            modo,

          programa_actual:
            programa_actual,

          usuario:
            "Sistema",

          observacion:
            `Acción ejecutada desde SmartCampusUNGE`

        }
      }

    );



    // ===============================
    // DEVOLVER ESTADO ACTUALIZADO
    // ===============================

    const estadoActual = await sequelize.query(

      `
      SELECT *
      FROM radio_estado
      WHERE id_estado = 1
      `,
      {
        type: QueryTypes.SELECT
      }

    );



    console.log(
      `[RADIO] ${ultima_accion}`
    );



    res.json({

      success: true,

      mensaje:
        `${ultima_accion} ejecutado correctamente`,

      radio:
        estadoActual[0]

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
