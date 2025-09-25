const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const DetalleVenta = require("./DetallesDeVentas");

const Venta = sequelize.define("Venta", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  clienteId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  tipoPago: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  montoEfectivo: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  fecha: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  estadoCuadre: {
    type: DataTypes.ENUM("pendiente", "cuadrado"), // 👈 estados posibles
    allowNull: false,
    defaultValue: "pendiente", // 👈 por defecto estará pendiente
  },
});

// 👇 Asociación con DetalleVenta
Venta.hasMany(DetalleVenta, { foreignKey: "ventaId", as: "detalles" });

module.exports = Venta;
