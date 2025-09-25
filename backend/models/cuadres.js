const { DataTypes } = require('sequelize');
const db = require('../config/database');

const CuadreCaja = db.define('CuadreCaja', {
  usuarioCuadre: { type: DataTypes.STRING, allowNull: false },
  usuarioVenta: { type: DataTypes.STRING },
  efectivoSistema: { type: DataTypes.FLOAT, allowNull: false },
  efectivoFisico: { type: DataTypes.FLOAT, allowNull: false },
  fijo: { type: DataTypes.FLOAT, allowNull: false },
  diferencia: { type: DataTypes.FLOAT, allowNull: false },
  observaciones: { type: DataTypes.STRING },
  fechaHora: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  procesado: { type: DataTypes.BOOLEAN, defaultValue: false }, // ← este campo
  estado: {
  type: DataTypes.STRING,
  defaultValue: "pendiente", // al guardar será pendiente
},
});

module.exports = CuadreCaja;
