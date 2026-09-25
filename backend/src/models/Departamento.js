// src/models/Departamento.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

const Departamento = sequelize.define('Departamento', {
  id_departamento: {
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
  },
  id_facultad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'facultades',
      key: 'id_facultad',
    }
  }
}, {
  tableName: 'departamentos',
  timestamps: true,
});

module.exports = Departamento;
