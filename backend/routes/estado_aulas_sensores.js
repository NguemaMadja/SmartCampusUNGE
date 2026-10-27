// backend/routes/estado_aulas_sensores.js
const express = require('express');
const router = express.Router();
const sequelize = require('../db');

// 🔹 Obtener estado actual de las aulas (Sincronizado con tu DataTable de la interfaz)
router.get('/', async (req, res) => {
  try {
    const { aula_sensor_id, cruce_global, accion } = req.query;
    let query = `
      SELECT e.*, a.nombre_aula
      FROM estado_aulas_sensores e
      LEFT JOIN aulas_sensores a ON e.aula_sensor_id = a.id_aula_sensor
      WHERE 1=1
    `;
    const params = [];
    if (aula_sensor_id) { params.push(aula_sensor_id); query += ` AND e.aula_sensor_id = $${params.length}`; }
    if (cruce_global) { params.push(cruce_global); query += ` AND e.cruce_global = $${params.length}`; }
    if (accion) { params.push(accion); query += ` AND e.accion = $${params.length}`; }

    // Ordenamos por fecha_hora para que la interfaz siempre vea lo más reciente primero
    query += " ORDER BY e.fecha_hora DESC";

    const [rows] = await sequelize.query(query, { bind: params });
    res.json({ data: rows });
  } catch (err) {
    console.error("Error al obtener estado de aulas:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Insertar o ACTUALIZAR el estado en tiempo real (Lógica de Upsert IoT)
router.post('/', async (req, res) => {
  try {
    const { 
      aula_sensor_id, 
      temperatura, 
      humedad, 
      co2, 
      ruido_detectado, 
      luz_detectada, 
      pir_detectado, 
      cruce_global, 
      accion, 
      mensaje 
    } = req.body;

    if (!aula_sensor_id) {
      return res.status(400).json({ error: "El parámetro aula_sensor_id es obligatorio para actualizar el estado del aula." });
    }

    // 1. Verificar si el aula ya tiene un registro de estado previo en la tabla
    const [existeEstado] = await sequelize.query(
      `SELECT id_estado FROM estado_aulas_sensores WHERE aula_sensor_id = $1 LIMIT 1`,
      { bind: [aula_sensor_id] }
    );

    let result;

    if (existeEstado.length > 0) {
      // 2. Si ya existe, hacemos un UPDATE atómico para no duplicar filas en la pantalla de monitoreo
      const [updateResult] = await sequelize.query(
        `UPDATE estado_aulas_sensores
         SET temperatura = $1, 
             humedad = $2, 
             co2 = $3, 
             ruido_detectado = $4, 
             luz_detectada = $5, 
             pir_detectado = $6, 
             cruce_global = $7, 
             accion = $8, 
             mensaje = $9, 
             fecha_hora = NOW()
         WHERE aula_sensor_id = $10
         RETURNING *`,
        { 
          bind: [
            temperatura, 
            humedad, 
            co2, 
            ruido_detectado, 
            !!luz_detectada, 
            !!pir_detectado, 
            cruce_global || "Ausencia", 
            accion || "NINGUNA", 
            mensaje || "Estado actualizado", 
            aula_sensor_id
          ] 
        }
      );
      result = updateResult;
    } else {
      // 3. Si es la primera vez que el aula reporta, hacemos el INSERT inicial
      const [insertResult] = await sequelize.query(
        `INSERT INTO estado_aulas_sensores
         (aula_sensor_id, temperatura, humidity/humedad, co2, ruido_detectado, luz_detectada, pir_detectado, cruce_global, accion, mensaje, fecha_hora)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()) RETURNING *`,
        { 
          bind: [
            aula_sensor_id, 
            temperatura, 
            humedad, 
            co2, 
            ruido_detectado, 
            !!luz_detectada, 
            !!pir_detectado, 
            cruce_global || "Ausencia", 
            accion || "NINGUNA", 
            mensaje || "Primer registro de estado", 
          ] 
        }
      );
      result = insertResult;
    }

    res.json({
      success: true,
      message: "Estado de la sala sincronizado correctamente en el ecosistema IoT.",
      data: result[0]
    });

  } catch (err) {
    console.error("Error crítico en el actualizador de estados de sala:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
