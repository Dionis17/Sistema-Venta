const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuarios', {
    foto: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  nombre_usuario: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  contraseña: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rol: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'vendedor', // puedes cambiar según el caso
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'activo', // o inactivo
  },
}, {
  tableName: 'usuarios',
  hooks: {
    beforeCreate: async (usuario) => {
      if (usuario.contraseña) {
        const salt = await bcrypt.genSalt(10);
        usuario.contraseña = await bcrypt.hash(usuario.contraseña, salt);
      }
    },
    beforeUpdate: async (usuario) => {
      if (usuario.changed('contraseña')) {
        const salt = await bcrypt.genSalt(10);
        usuario.contraseña = await bcrypt.hash(usuario.contraseña, salt);
      }
    }
  },
});

module.exports = Usuario;
