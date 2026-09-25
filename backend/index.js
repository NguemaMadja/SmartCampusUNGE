const express = require('express');
const { Sequelize } = require('sequelize');
require('dotenv').config();

const app = express();
app.use(express.json());

// Configuración de la BD con Sequelize usando .env
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
  }
);

// Probar conexión
sequelize.authenticate()
  .then(() => console.log('✅ Conectado a PostgreSQL'))
  .catch(err => console.error('❌ Error de conexión:', err));

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('SmartCampusUNGE API funcionando 🚀');
});

// Puerto
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en puerto ${PORT}`);
});
