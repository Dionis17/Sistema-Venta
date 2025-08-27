const sequelize = require("../config/database");
const Producto = require("./Producto");
const Venta = require("./ventas");
const DetalleVenta = require("./detallesDeVentas");
const MCreditos = require("./mcreditos");

// Relaciones

// Una Venta tiene muchos DetalleVenta (detallesVenta)
Venta.hasMany(DetalleVenta, { foreignKey: "ventaId", as: "detallesVenta" });
DetalleVenta.belongsTo(Venta, { foreignKey: "ventaId", as: "venta" });

// Un DetalleVenta pertenece a un Producto
DetalleVenta.belongsTo(Producto, { foreignKey: "productoId", as: "producto" });
// Un Producto tiene muchos DetalleVenta, con un alias distinto para evitar conflicto
Producto.hasMany(DetalleVenta, { foreignKey: "productoId", as: "detallesProducto" });

// Una Venta puede tener un crédito (MCreditos)
Venta.hasOne(MCreditos, { foreignKey: "venta_id", as: "credito" });
MCreditos.belongsTo(Venta, { foreignKey: "venta_id", as: "venta" });

module.exports = {
  sequelize,
  Producto,
  Venta,
  DetalleVenta,
  MCreditos,
};
