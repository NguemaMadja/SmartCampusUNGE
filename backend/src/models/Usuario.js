// src/models/Usuario.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../db');  // Importa la conexión correcta

const Usuario = sequelize.define('Usuario', {
  id_usuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  correo: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  rol: {
    type: DataTypes.ENUM('superadmin', 'profesor', 'estudiante', 'radio'),
    allowNull: false,
  }
}, {
  tableName: 'usuarios',
  timestamps: false   // 🔹 evita que Sequelize busque createdAt/updatedAt
});

module.exports = Usuario;
