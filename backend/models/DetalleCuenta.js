const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Producto = require('./Producto'); // importa el modelo relacionado

const DetalleCuenta = sequelize.define('DetalleCuenta', {
  cuentaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  productoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
});

DetalleCuenta.belongsTo(Producto, {
  foreignKey: 'productoId',
  as: 'Producto',
});

module.exports = DetalleCuenta;
