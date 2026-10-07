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
app.use('/api/lecturas_sensores', require('./routes/lecturas_sensores')); // 🔹 NUEVO
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
app.use('/api/aulas_sensores', require('./routes/aulas_sensores'));              // 🔹 NUEVO
app.use('/api/estado_aulas_sensores', require('./routes/estado_aulas_sensores')); // 🔹 NUEVO
app.use('/api/consumo_energia_sensores', require('./routes/consumo_energia_sensores')); // 🔹 NUEVO
app.use('/api/eventos_energia_sensores', require('./routes/eventos_energia_sensores')); // 🔹 NUEVO

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
  res.sendFile(path.join(__dirname, '../frontend/edificios.html'));
});

// 🔹 Páginas académicas
app.get('/facultades', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/facultades.html'));
});

app.get('/departamentos', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/departamentos.html'));
});

app.get('/carreras', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/carreras.html'));
});

app.get('/asignaturas', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/asignaturas.html'));
});

app.get('/asistencia_profesor', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/asistencia_profesor.html'));
});

app.get('/aulas', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/aulas.html'));
});

app.get('/profesores', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/profesores.html'));
});

app.get('/relaciones', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/relaciones.html'));     
});

// 🔹 Página Gestión Energética
app.get('/gestion_energetica', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/gestion_energetica.html')); // 🔹 NUEVO
});

// 🔹 Puerto
const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});
