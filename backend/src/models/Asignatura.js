// src/models/Asignatura.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

const Asignatura = sequelize.define('Asignatura', {
  id_asignatura: {
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
  id_departamento: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'departamentos',
      key: 'id_departamento',
    }
  }
}, {
  tableName: 'asignaturas',
  timestamps: true,
});

module.exports = Asignatura;
