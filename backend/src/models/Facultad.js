// src/models/Facultad.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

const Facultad = sequelize.define('Facultad', {
  id_facultad: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  tableName: 'facultades',
  timestamps: true,
});

module.exports = Facultad;
