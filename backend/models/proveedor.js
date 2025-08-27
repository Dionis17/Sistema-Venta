const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Proveedor = sequelize.define("Proveedor", {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  telefono: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "activo",
  },
}, {
  tableName: 'proveedores',  // <-- importante para que la tabla se llame así en la DB
  timestamps: true,
});

module.exports = Proveedor;
