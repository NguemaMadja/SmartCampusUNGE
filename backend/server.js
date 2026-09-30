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

// 🔹 Rutas API (prefijo /api para evitar conflicto con frontend)
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/sensores', require('./routes/sensores'));       // métricas IoT
app.use('/api/asistencia', require('./routes/asistencia'));   // asistencia académica
app.use('/api/qr', require('./routes/qr'));                   // módulo QR
app.use('/api/configuracion', require('./routes/configuracion'));
app.use('/api/transporte', require('./routes/transporte'));   // transporte escolar (líneas)
app.use('/api/vehiculos', require('./routes/vehiculos'));     // gestión de buses
app.use('/api/paradas', require('./routes/paradas'));         // gestión de paradas
app.use('/api/rutas', require('./routes/rutas'));
app.use('/api/posiciones', require('./routes/posiciones'));   // posiciones dinámicas de buses
app.use('/api/edificios', require('./routes/edificios'));     // 🔹 NUEVO: gestión de edificios

// 🔹 Servir frontend estático
app.use(express.static(path.join(__dirname, '../frontend')));

// 🔹 Rutas explícitas para páginas HTML
app.get('/transporte', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/transporte.html'));
});

app.get('/smarttransit', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/smarttransit.html'));
});

app.get('/edificios', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/edificios.html')); // 🔹 NUEVO
});

// 🔹 Puerto
const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});
