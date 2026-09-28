// backend/models/Parada.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Parada = sequelize.define('Parada', {
  id_parada: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_ruta: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  latitud: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  longitud: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  orden: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'paradas',
  timestamps: false
});

module.exports = Parada;
