// src/models/associations.js
const Usuario = require('./Usuario');
const Asignatura = require('./Asignatura');
const Departamento = require('./Departamento');
const Facultad = require('./Facultad');

// Relación Usuario ↔ Departamento (muchos-a-muchos)
Usuario.belongsToMany(Departamento, {
  through: 'UsuarioDepartamento',
  foreignKey: 'id_usuario',
});
Departamento.belongsToMany(Usuario, {
  through: 'UsuarioDepartamento',
  foreignKey: 'id_departamento',
});

// Relación Usuario ↔ Asignatura (muchos-a-muchos)
Usuario.belongsToMany(Asignatura, {
  through: 'UsuarioAsignatura',
  foreignKey: 'id_usuario',
});
Asignatura.belongsToMany(Usuario, {
  through: 'UsuarioAsignatura',
  foreignKey: 'id_asignatura',
});

// Relación Departamento ↔ Asignatura (uno-a-muchos)
Departamento.hasMany(Asignatura, {
  foreignKey: 'id_departamento',
});
Asignatura.belongsTo(Departamento, {
  foreignKey: 'id_departamento',
});

// Relación Facultad ↔ Departamento (uno-a-muchos)
Facultad.hasMany(Departamento, {
  foreignKey: 'id_facultad',
});
Departamento.belongsTo(Facultad, {
  foreignKey: 'id_facultad',
});

module.exports = { Usuario, Asignatura, Departamento, Facultad };
