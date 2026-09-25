// src/models/Asistencia.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

const Asistencia = sequelize.define('Asistencia', {
  id_asistencia: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id_usuario',
    }
  },
  id_asignatura: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'asignaturas',
      key: 'id_asignatura',
    }
  },
  fecha: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'asistencia',
  timestamps: false,
});

module.exports = Asistencia;
