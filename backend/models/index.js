const sequelize = require("../config/database");
const Producto = require("./Producto");
const Venta = require("./ventas");
const DetalleVenta = require("./detallesDeVentas");
const MCreditos = require("./mcreditos");
const CuadreCaja = require("./cuadres");

// Relaciones existentes
Venta.hasMany(DetalleVenta, { foreignKey: "ventaId", as: "detallesVenta" });
DetalleVenta.belongsTo(Venta, { foreignKey: "ventaId", as: "venta" });

DetalleVenta.belongsTo(Producto, { foreignKey: "productoId", as: "producto" });
Producto.hasMany(DetalleVenta, { foreignKey: "productoId", as: "detallesProducto" });

Venta.hasOne(MCreditos, { foreignKey: "venta_id", as: "credito" });
MCreditos.belongsTo(Venta, { foreignKey: "venta_id", as: "venta" });

// ❌ Deja comentado esto por ahora
// CuadreCaja.hasMany(Venta, { foreignKey: "cuadreId", as: "ventasCuadre" });
// Venta.belongsTo(CuadreCaja, { foreignKey: "cuadreId", as: "cuadreDeVenta" });



// Exportar modelos
module.exports = {
  sequelize,
  Producto,
  Venta,
  DetalleVenta,
  MCreditos,
  CuadreCaja,
};
