// backend/routes/lecturas_sensores.js
const express = require('express');
const router = express.Router();
const sequelize = require('../db');

// 🔹 Obtener lecturas (Mantiene tu lógica original con binds dinámicos)
router.get('/', async (req, res) => {
  try {
    const { id_sensor } = req.query;
    let query = `
      SELECT l.*, s.tipo_sensor AS sensor_tipo, a.nombre_aula
      FROM lecturas_sensores l
      LEFT JOIN sensores s ON l.id_sensor = s.id_sensor
      LEFT JOIN aulas_sensores a ON s.aula_sensor_id = a.id_aula_sensor
      WHERE 1=1
    `;
    const params = [];
    if (id_sensor) {
      params.push(id_sensor);
      query += ` AND l.id_sensor = $${params.length}`;
    }

    const [rows] = await sequelize.query(query, { bind: params });
    res.json({ data: rows });
  } catch (err) {
    console.error("Error al obtener lecturas:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Insertar nueva lectura con MÁQUINA DE ESTADOS Y AUTOMATIZACIÓN DE ILUMINACIÓN
router.post('/', async (req, res) => {
  try {
    const { id_sensor, temperatura, humedad, co2, ruido, luz_detectada } = req.body;

    // 1. Validar que la petición contenga los datos necesarios
    if (!id_sensor || co2 === undefined || ruido === undefined || luz_detectada === undefined) {
      return res.status(400).json({ error: "Faltan parámetros críticos para el cálculo IoT (id_sensor, co2, ruido, luz_detectada)." });
    }

    // 2. Buscar a qué aula pertenece este sensor (Fase de mapeo de infraestructura)
    const [sensorInfo] = await sequelize.query(
      `SELECT aula_sensor_id FROM sensores WHERE id_sensor = $1 LIMIT 1`,
      { bind: [id_sensor] }
    );

    if (sensorInfo.length === 0) {
      return res.status(404).json({ error: `El sensor con ID ${id_sensor} no está registrado en ninguna sala.` });
    }

    const id_aula = sensorInfo[0].aula_sensor_id;

    // 3. ALGORITMO DE FUSIÓN DE SENSORES (Cálculo matemático de presencia humana)
    const UMBRAL_CO2_PRESENCIA = 650;  // Partes por millón (línea base habitación vacía)
    const UMBRAL_RUIDO_PRESENCIA = 45; // Decibelios base de actividad en el aula

    const hayPresenciaPorCO2 = co2 > UMBRAL_CO2_PRESENCIA;
    const hayPresenciaPorRuido = ruido > UMBRAL_RUIDO_PRESENCIA;
    const tienePresenciaGlobal = hayPresenciaPorCO2 || hayPresenciaPorRuido;

    const cruce_global = tienePresenciaGlobal ? "Presencia Detectada" : "Ausencia";

    // 4. MÁQUINA DE ESTADOS (Determinación estricta de la acción de control)
    let accion_automatica = "NINGUNA";
    const estado_luz_actual = !!luz_detectada; // Forzar a booleano puro (true/false)

    if (tienePresenciaGlobal && !estado_luz_actual) {
      accion_automatica = "ENCENDER_LUCES";
    } else if (!tienePresenciaGlobal && estado_luz_actual) {
      accion_automatica = "APAGAR_LUCES";
    }

    // 5. Inserción de la lectura cruda en el historial general
    const [nuevaLectura] = await sequelize.query(
      `INSERT INTO lecturas_sensores
       (id_sensor, temperatura, humedad, co2, ruido, luz_detectada, fecha_hora)
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *`,
      { bind: [id_sensor, temperatura, humedad, co2, ruido, estado_luz_actual] }
    );

    // 6. FLUJO DE PERSISTENCIA CRUZADA (Si hay una acción de control, la guardamos)
    if (accion_automatica !== "NINGUNA") {
      // Registrar de manera atómica el evento en la bitácora histórica
      await sequelize.query(
        `INSERT INTO eventos_energia_sensores (aula_sensor_id, tipo_evento, descripcion, fecha_hora)
         VALUES ($1, $2, $3, NOW())`,
        { bind: [id_aula, accion_automatica, `Acción automatizada por el motor IoT debido a ${cruce_global.toLowerCase()}.`] }
      );
      
      console.log(`[SmartCampus IoT] Comando generado para Aula ${id_aula}: ${accion_automatica}`);
    }

    // 7. Retornar la respuesta al hardware/cliente enriquecida con los cálculos pertinentes
    res.json({
      success: true,
      lectura_guardada: nuevaLectura[0],
      calculos: {
        aula_afectada_id: id_aula,
        cruce_global: cruce_global,
        decision_sistema: accion_automatica
      }
    });

  } catch (err) {
    console.error("Error crítico en el procesador de lecturas IoT:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Eliminar lectura (Mantiene tu lógica original)
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await sequelize.query(
      `DELETE FROM lecturas_sensores WHERE id_lectura = $1 RETURNING *`,
      { bind: [req.params.id] }
    );
    if (result.length === 0) return res.status(404).json({ error: 'Lectura no encontrada' });
    res.json({ message: 'Lectura eliminada correctamente' });
  } catch (err) {
    console.error("Error al eliminar lectura:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
