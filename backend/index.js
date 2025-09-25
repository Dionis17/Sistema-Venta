const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const sequelize = require("./config/database");

const Producto = require("./models/Producto");
const Cliente = require("./models/Cliente");
const Usuario = require("./models/gesUsuario");
const Credito = require("./models/mcreditos"); // Ajusta nombre archivo si es necesario
const Venta = require("./models/ventas");
const DetalleVenta = require("./models/detallesDeVentas");
const proveedorRoutes = require("./routes/proveedor");
const Cuadres = require ("./models/cuadres");
const VentasPendientes = require ("./models/ventasPendiente");

// Importa rutas
const authRoutes = require("./routes/auth");
const productosRoutes = require("./routes/productos");
const clientesRoutes = require("./routes/clientes");
const ventasRoutes = require("./routes/venta");
const usuariosRoutes = require("./routes/usuarios");
const creditosRoutes = require("./routes/creditos");
const cuentaRoutes = require("./routes/cuenta");
const prodAgrupadosRoutes = require("./routes/prodAgrupados");
const cuadreRoutes = require ("./routes/cuadre");
// Define relaciones (ajusta según tus modelos)
Cliente.hasMany(Credito, { foreignKey: "cliente_id", as: "creditos" });

Venta.hasMany(DetalleVenta, { foreignKey: "ventaId" });
DetalleVenta.belongsTo(Venta, { foreignKey: "ventaId" });

// Crear carpeta uploads si no existe
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

// Rutas API
app.use("/api/auth", authRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/ventas", ventasRoutes); // <-- CORRECTO: ventasRoutes
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/creditos", creditosRoutes);
app.use("/api/cuentas", cuentaRoutes);
app.use("/api/proveedores", proveedorRoutes);
app.use("/api/productos", prodAgrupadosRoutes);
app.use("/api/cuadres",cuadreRoutes)

// Ruta para eliminar tabla productos (opcional, solo para pruebas)
app.delete("/api/delete-tabla-productos", async (req, res) => {
  try {
    await sequelize.query("DROP TABLE IF EXISTS productos;");
    res.status(200).send("✅ Tabla productos eliminada correctamente");
  } catch (err) {
    console.error("❌ Error al eliminar tabla:", err);
    res.status(500).send("Error al ejecutar DROP TABLE");
  }
});

// Sincronizar la base de datos y levantar servidor
sequelize
  .sync({ alter: true }) // usa alter: true para migraciones automáticas, o force: true para borrar todo
  .then(() => {
    console.log("✔️ Base de datos sincronizada");
    app.listen(PORT, "127.0.0.1", () => {
      console.log(`🌐 Servidor corriendo localmente en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Error al sincronizar la base de datos:", err);
  });

