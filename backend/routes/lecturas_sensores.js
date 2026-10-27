// backend/routes/lecturas_sensores.js
const express = require('express');
const router = express.Router();
const sequelize = require('../db');

// 🔹 POST: Recibe los datos directamente del ESP32-S3
router.post('/', async (req, res) => {
  try {
    const { id_sensor, temperatura, humedad, co2, ruido, luz_detectada } = req.body;

    // Validar parámetros del ESP32
    if (!id_sensor || co2 === undefined || temperatura === undefined || humedad === undefined) {
      return res.status(400).json({ error: "Faltan parámetros del ESP32-S3 (id_sensor, co2, temperatura, humedad)." });
    }

    // 1. Buscar a qué aula pertenece este sensor
    const [sensorInfo] = await sequelize.query(
      `SELECT aula_sensor_id FROM sensores WHERE id_sensor = $1 LIMIT 1`,
      { bind: [id_sensor] }
    );

    if (sensorInfo.length === 0) {
      return res.status(404).json({ error: `El sensor ID ${id_sensor} no está vinculado a ningún aula en la BD.` });
    }

    const id_aula = sensorInfo[0].aula_sensor_id;

    // 2. Algoritmo de Presencia (Fusión por umbrales)
    // Usamos el CO2 del SCD40 como indicador primario de metabolismo humano en el aula de la UNGE
    const UMBRAL_CO2 = 650; 
    const UMBRAL_RUIDO = 45;
    const tienePresencia = (co2 > UMBRAL_CO2) || ((ruido || 0) > UMBRAL_RUIDO);
    const cruce_global = tienePresencia ? "Presencia Detectada" : "Ausencia";

    // Máquina de estados para las luces
    let accion_automatica = "NINGUNA";
    const estado_luz = !!luz_detectada;

    if (tienePresencia && !estado_luz) {
      accion_automatica = "ENCENDER_LUCES";
    } else if (!tienePresencia && estado_luz) {
      accion_automatica = "APAGAR_LUCES";
    }

    // 3. Insertar en el historial (lecturas_sensores)
    const [nuevaLectura] = await sequelize.query(
      `INSERT INTO lecturas_sensores (id_sensor, temperatura, humedad, co2, ruido, luz_detectada, fecha_hora)
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *`,
      { bind: [id_sensor, temperatura, humedad, co2, ruido || 0, estado_luz] }
    );

    // 4. UPSERT AUTOMÁTICO EN EL ESTADO EN TIEMPO REAL (Para refrescar el DataTable de inmediato)
    const [existeEstado] = await sequelize.query(
      `SELECT id_estado FROM estado_aulas_sensores WHERE aula_sensor_id = $1 LIMIT 1`,
      { bind: [id_aula] }
    );

    if (existeEstado.length > 0) {
      await sequelize.query(
        `UPDATE estado_aulas_sensores
         SET temperatura = $1, humedad = $2, co2 = $3, ruido_detectado = $4, luz_detectada = $5,
             cruce_global = $6, accion = $7, fecha_hora = NOW()
         WHERE aula_sensor_id = $8`,
        { bind: [temperatura, humedad, co2, ruido || 0, estado_luz, cruce_global, accion_automatica, id_aula] }
      );
    } else {
      await sequelize.query(
        `INSERT INTO estado_aulas_sensores (aula_sensor_id, temperatura, humedad, co2, ruido_detectado, luz_detectada, pir_detectado, cruce_global, accion, mensaje, fecha_hora)
         VALUES ($1, $2, $3, $4, $5, $6, false, $7, $8, 'Sincronizado vía ESP32', NOW())`,
        { bind: [id_aula, temperatura, humedad, co2, ruido || 0, estado_luz, cruce_global, accion_automatica] }
      );
    }

    // 5. Si hay cambio de estado eléctrico, guardar evento
    if (accion_automatica !== "NINGUNA") {
      await sequelize.query(
        `INSERT INTO eventos_energia_sensores (aula_sensor_id, tipo_evento, descripcion, fecha_hora)
         VALUES ($1, $2, $3, NOW())`,
        { bind: [id_aula, accion_automatica, `Cambio automático por motor IoT [${cruce_global}].`] }
      );
    }

    // Responder al ESP32 con las directrices de control
    res.json({
      success: true,
      comando_luces: accion_automatica, // El ESP32 leerá esto para apagar/encender su relé físico
      cruce_global: cruce_global
    });

  } catch (err) {
    console.error("Error en procesador IoT:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
Usa el código con precaución.

💻 Paso 2: El Código para el ESP32-S3 y SCD40/41

Para compilar esto en tu Arduino IDE, asegúrate de tener instalada la librería "Sensirion I2C SCD4x" desde el gestor de librerías.
Aquí tienes el Sketch de producción listo para tu placa. Ajusta las credenciales de tu Wi-Fi y el id_sensor mapeado en tu base de datos:
cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <SensirionI2cScd4x.h>
#include <ArduinoJson.h> // Instala "ArduinoJson" por Benoit Blanchon si no la tienes

// 🔹 Configuración de Red y API
const char* ssid = "TU_SSID_WIFI";
const char* password = "TU_PASSWORD_WIFI";
const char* serverName = "https://onrender.com";

// 🔹 Identificación del Sensor (Debe coincidir con la columna id_sensor de tu BD)
const int ID_SENSOR_NODO = 1; 

SensirionI2cScd4x scd4x;

// Pines I2C por defecto para el ESP32-S3 (Ajusta si usas otros pines en tu placa)
const int SDA_PIN = 4; 
const int SCL_PIN = 5;

// Pin del relé o LED indicador para las luces
const int PIN_RELE_LUCES = 10; 

void setup() {
  Serial.begin(115200);
  pinMode(PIN_RELE_LUCES, OUTPUT);
  digitalWrite(PIN_RELE_LUCES, LOW); // Por defecto apagado

  // Inicializar I2C y Sensor SCD4x
  Wire.begin(SDA_PIN, SCL_PIN);
  scd4x.begin(Wire);

  // Detener mediciones previas si las hay y arrancar medición continua
  uint16_t error;
  error = scd4x.stopPeriodicMeasurement();
  delay(500);
  error = scd4x.startPeriodicMeasurement();
  if (error) {
    Serial.println("Error arrancando el SCD4x. Revisa conexiones.");
  }

  // Conectar a Wi-Fi
  WiFi.begin(ssid, password);
  Serial.print("Conectando a Wi-Fi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n¡Conectado con éxito!");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    uint16_t co2 = 0;
    float temperature = 0.0f;
    float humidity = 0.0f;
    bool ready = false;

    // Verificar si el SCD4x tiene datos listos (tarda aprox 5 seg)
    scd4x.getDataReadyFlag(ready);
    if (ready) {
      uint16_t error = scd4x.readMeasurement(co2, temperature, humidity);
      if (!error && co2 > 0) {
        Serial.printf("CO2: %u ppm, Temp: %.2f °C, Hum: %.2f %%\n", co2, temperature, humidity);
        
        // Leer el estado físico actual de la luz (asumimos el estado del pin del relé como muestra)
        bool luzActual = digitalRead(PIN_RELE_LUCES); 

        // Preparar la conexión cliente HTTP
        HTTPClient http;
        http.begin(serverName);
        http.addHeader("Content-Type", "application/json");

        // Crear el documento JSON de la lectura usando ArduinoJson
        StaticJsonDocument<256> doc;
        doc["id_sensor"] = ID_SENSOR_NODO;
        doc["temperatura"] = temperature;
        doc["humedad"] = humidity;
        doc["co2"] = co2;
        doc["ruido"] = 40; // Hardcoded temporalmente si no tienes micrófono aún
        doc["luz_detectada"] = luzActual;

        String requestBody;
        serializeJson(doc, requestBody);

        // Enviar la información al servidor de SmartCampus
        int httpResponseCode = http.POST(requestBody);

        if (httpResponseCode > 0) {
          String response = http.getString();
          Serial.println("Respuesta del Servidor: " + response);

          // Parsear respuesta del servidor para ejecutar la acción en el relé
          StaticJsonDocument<256> resDoc;
          deserializeJson(resDoc, response);
          String comando = resDoc["comando_luces"];

          if (comando == "ENCENDER_LUCES") {
            digitalWrite(PIN_RELE_LUCES, HIGH);
            Serial.println("-> ACCIÓN: Luces ENCENDIDAS por presencia.");
          } else if (comando == "APAGAR_LUCES") {
            digitalWrite(PIN_RELE_LUCES, LOW);
            Serial.println("-> ACCIÓN: Luces APAGADAS por ausencia.");
          }
        } else {
          Serial.printf("Error enviando POST: %s\n", http.errorToString(httpResponseCode).c_str());
        }
        http.end();
      }
    }
  }
  delay(10000); // Muestrear y transmitir cada 10 segundos
}
