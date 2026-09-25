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

// 🔹 Rutas principales
app.use('/usuarios', require('./routes/usuarios'));
app.use('/sensores', require('./routes/sensores'));       // métricas IoT
app.use('/asistencia', require('./routes/asistencia'));   // asistencia académica
app.use('/qr', require('./routes/qr'));                   // módulo QR
app.use('/configuracion', require('./routes/configuracion'));


// 🔹 Nueva ruta de transporte
const transporteRoutes = require('./routes/transporte');
app.use('/api/transporte', transporteRoutes);

// 🔹 Servir frontend estático
app.use(express.static(path.join(__dirname, '../frontend')));

// 🔹 Puerto
const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});
