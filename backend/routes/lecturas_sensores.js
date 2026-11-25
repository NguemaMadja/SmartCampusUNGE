// backend/routes/lecturas_sensores.js
const express = require('express');
const router = express.Router();
const sequelize = require('../db');

// 🔹 POST: Recibe los datos directamente del ESP32-S3
router.post('/', async (req, res) => {
  try {
    const {
      id_sensor,
      temperatura,
      humedad,
      co2,
      ruido,
      luz_detectada,
      pir_detectado
    } = req.body;

    // Validar parámetros del ESP32
    if (
      !id_sensor ||
      co2 === undefined ||
      temperatura === undefined ||
      humedad === undefined
    ) {
      return res.status(400).json({
        error: "Faltan parámetros del ESP32-S3 (id_sensor, co2, temperatura, humedad)."
      });
    }

    // 1. Buscar a qué aula pertenece este sensor
    const [sensorInfo] = await sequelize.query(
      `SELECT aula_sensor_id
       FROM sensores
       WHERE id_sensor = $1
       LIMIT 1`,
      { bind: [id_sensor] }
    );

    if (sensorInfo.length === 0) {
      return res.status(404).json({
        error: `El sensor ID ${id_sensor} no está vinculado a ningún aula en la BD.`
      });
    }

    const id_aula = sensorInfo[0].aula_sensor_id;

    // 2. Algoritmo de Presencia (Fusión por umbrales + PIR)
    const UMBRAL_CO2 = 650;
    const UMBRAL_RUIDO = 45;

    const ruidoDetectado = (ruido || 0) > UMBRAL_RUIDO;
    const pirDetectado = !!pir_detectado;

    const tienePresencia =
      (co2 > UMBRAL_CO2) ||
      ruidoDetectado ||
      pirDetectado;

    const cruce_global = tienePresencia
      ? "Presencia Detectada"
      : "Ausencia";

    // Máquina de estados para las luces
    let accion_automatica = "NINGUNA";
    const estado_luz = !!luz_detectada;

    if (tienePresencia && !estado_luz) {
      accion_automatica = "ENCENDER_LUCES";
    } else if (!tienePresencia && estado_luz) {
      accion_automatica = "APAGAR_LUCES";
    }

    // 3. Insertar en el historial (Dataset completo para futura IA)
    const [nuevaLectura] = await sequelize.query(
      `INSERT INTO lecturas_sensores
       (
         id_sensor,
         temperatura,
         humedad,
         co2,
         ruido,
         luz_detectada,
         pir_detectado,
         cruce_global,
         fecha_hora
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING *`,
      {
        bind: [
          id_sensor,
          temperatura,
          humedad,
          co2,
          ruido || 0,
          estado_luz,
          pirDetectado,
          cruce_global
        ]
      }
    );

    // 4. UPSERT AUTOMÁTICO EN EL ESTADO EN TIEMPO REAL
    const [existeEstado] = await sequelize.query(
      `SELECT id_estado
       FROM estado_aulas_sensores
       WHERE aula_sensor_id = $1
       LIMIT 1`,
      { bind: [id_aula] }
    );

    if (existeEstado.length > 0) {
      await sequelize.query(
        `UPDATE estado_aulas_sensores
         SET
           temperatura = $1,
           humedad = $2,
           co2 = $3,
           ruido_detectado = $4,
           luz_detectada = $5,
           pir_detectado = $6,
           cruce_global = $7,
           accion = $8,
           fecha_hora = NOW()
         WHERE aula_sensor_id = $9`,
        {
          bind: [
            temperatura,
            humedad,
            co2,
            ruidoDetectado,
            estado_luz,
            pirDetectado,
            cruce_global,
            accion_automatica,
            id_aula
          ]
        }
      );
    } else {
      await sequelize.query(
        `INSERT INTO estado_aulas_sensores
        (
          aula_sensor_id,
          temperatura,
          humedad,
          co2,
          ruido_detectado,
          luz_detectada,
          pir_detectado,
          cruce_global,
          accion,
          mensaje,
          fecha_hora
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          'Sincronizado vía ESP32',
          NOW()
        )`,
        {
          bind: [
            id_aula,
            temperatura,
            humedad,
            co2,
            ruidoDetectado,
            estado_luz,
            pirDetectado,
            cruce_global,
            accion_automatica
          ]
        }
      );
    }

    // 5. Si hay cambio de estado eléctrico, guardar evento
    if (accion_automatica !== "NINGUNA") {
      await sequelize.query(
        `INSERT INTO eventos_energia_sensores
         (
           aula_sensor_id,
           accion,
           motivo,
           fecha_hora
         )
         VALUES
         (
           $1,
           $2,
           $3,
           NOW()
         )`,
        {
          bind: [
            id_aula,
            accion_automatica,
            `Cambio automático por motor IoT [${cruce_global}].`
          ]
        }
      );
    }

    // Responder al ESP32
    res.json({
      success: true,
      comando_luces: accion_automatica,
      cruce_global
    });

  } catch (err) {
    console.error("Error en procesador IoT:", err);
    res.status(500).json({
      error: err.message
    });
  }
});

module.exports = router;
