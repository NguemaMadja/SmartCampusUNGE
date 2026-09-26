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
app.use('/api/transporte', require('./routes/transporte'));   // transporte escolar

// 🔹 Servir frontend estático
app.use(express.static(path.join(__dirname, '../frontend')));

// 🔹 Puerto
const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});
