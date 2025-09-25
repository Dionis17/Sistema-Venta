const { DataTypes } = require('sequelize');
const db = require('../config/database');

const VentasPendientes = db.define('VentasPendientes', {
  ventaId: { type: DataTypes.INTEGER, allowNull: false },
  cliente: { type: DataTypes.STRING },
  fecha: { type: DataTypes.DATE, allowNull: false },
  montoPagado: { type: DataTypes.FLOAT, allowNull: false },
  estadoVenta: { type: DataTypes.STRING, defaultValue: 'Pagada' },
  tipoPago: { type: DataTypes.STRING },
});

module.exports = VentasPendientes;
