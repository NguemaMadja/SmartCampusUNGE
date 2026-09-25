// src/models/Sensor.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

const Sensor = sequelize.define('Sensor', {
  id_sensor: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tipo: {
    type: DataTypes.ENUM('temperatura', 'humedad', 'co2'),
    allowNull: false,
  },
  valor: {
    type: DataTypes.NUMERIC,
    allowNull: false,
  },
  id_aula: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'edificios', // relación con aulas/edificios
      key: 'id_edificio',
    }
  },
  fecha: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'sensores',
  timestamps: false,
});

module.exports = Sensor;
