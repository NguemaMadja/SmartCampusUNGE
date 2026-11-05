// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const sequelize = require('./db'); // conexión Sequelize

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Conexión a BD
sequelize.authenticate()
  .then(() => console.log('Conexión a BD establecida'))
  .catch(err => console.error('Error de conexión:', err));

// 🔹 Rutas API (académicas y generales)
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/sensores', require('./routes/sensores'));
app.use('/api/lecturas_sensores', require('./routes/lecturas_sensores'));
app.use('/api/asistencia', require('./routes/asistencia'));
app.use('/api/asistencia_profesor', require('./routes/asistencia_profesor'));
app.use('/api/asistencia/manual', require('./routes/asistencia_manual'));
app.use('/api/qr', require('./routes/qr'));
app.use('/api/configuracion', require('./routes/configuracion'));
app.use('/api/transporte', require('./routes/transporte'));
app.use('/api/vehiculos', require('./routes/vehiculos'));
app.use('/api/paradas', require('./routes/paradas'));
app.use('/api/rutas', require('./routes/rutas'));
app.use('/api/posiciones', require('./routes/posiciones'));
app.use('/api/edificios', require('./routes/edificios'));
app.use('/api/facultades', require('./routes/facultades'));
app.use('/api/departamentos', require('./routes/departamentos'));
app.use('/api/carreras', require('./routes/carreras'));
app.use('/api/asignaturas', require('./routes/asignaturas'));
app.use('/api/aulas', require('./routes/aulas'));
app.use('/api/profesores', require('./routes/profesores'));
app.use('/api/relaciones', require('./routes/relaciones'));

// 🔹 Rutas API (Gestión Energética)
app.use('/api/aulas_sensores', require('./routes/aulas_sensores'));
app.use('/api/estado_aulas_sensores', require('./routes/estado_aulas_sensores'));
app.use('/api/consumo_energia_sensores', require('./routes/consumo_energia_sensores'));
app.use('/api/eventos_energia_sensores', require('./routes/eventos_energia_sensores'));
app.use('/api/aulas_medicion', require('./routes/aulas_medicion'));
app.use('/api/sensores_medicion', require('./routes/sensores_medicion'));

app.use('/api/control_radio', require('./routes/control_radio'));
app.use('/api/programas_radio', require('./routes/programas_radio'));

// 🔹 Nueva ruta para chat (REST)
app.use('/api/mensajes_radio', require('./routes/mensajes_radio'));

// 🔹 Servir frontend estático
app.use(express.static(path.join(__dirname, '../frontend')));

// 🔹 Rutas explícitas para páginas HTML
app.get('/transporte', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/transporte.html'));
});
app.get('/smarttransit', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/smarttransit.html'));
});
app.get('/edificios.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/edificios.html'));
});
app.get('/facultades', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/facultades.html'));
});
app.get('/gestion_energetica', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/gestion_energetica.html'));
});

// 🔹 Puerto + Socket.io
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});

// 🔹 Configuración de Socket.io para chat en tiempo real
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: { origin: "*" }
});

// 🔹 Chat en tiempo real con políticas de rol
io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado:', socket.id);

  // Mensajes del chat
  socket.on('nuevoMensaje', async (msg) => {
    try {
      // 🔹 Políticas de rol
      if (msg.rol === "profesor" || msg.rol === "estudiante") {
        // Solo pueden enviar al locutor
        msg.destinatario = "radio";
      }

      // Guardar en BD (si tienes modelo Sequelize)
      const MensajesRadio = require('./models/MensajesRadio');
      await MensajesRadio.create(msg);

      // Reenviar a todos los clientes conectados
      io.emit('nuevoMensaje', msg);
    } catch (err) {
      console.error("Error guardando mensaje:", err);
    }
  });

  // Eliminar mensajes (solo superadmin)
  socket.on('eliminarMensaje', async ({ id, rol }) => {
    if (rol === "superadmin") {
      const MensajesRadio = require('./models/MensajesRadio');
      await MensajesRadio.destroy({ where: { id } });
      io.emit('mensajeEliminado', id);
    } else {
      socket.emit('error', "No tienes permisos para eliminar mensajes");
    }
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});
