const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Producto = require("./Producto"); // importa Producto

const DetalleVenta = sequelize.define("DetalleVenta", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ventaId: {
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
  precioUnitario: {
    type: DataTypes.FLOAT,
    allowNull: false,
    field: "precio_unitario", // <-- aquí mapeas a la columna real en la BD
  },
});


module.exports = DetalleVenta;
