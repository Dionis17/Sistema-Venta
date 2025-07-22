const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Conexión con la base de datos
const sequelize = require('./config/database');

// Modelos (importarlos para registrar en Sequelize)
const Producto = require('./models/Producto');
const Cliente = require('./models/Cliente');
const Usuario = require('./models/gesUsuario'); // ✅ NUEVO MODELO

// Rutas
const authRoutes = require('./routes/auth');
const productosRoutes = require('./routes/productos');
const clientesRoutes = require('./routes/clientes');
const ventasRoutes = require('./routes/ventas');
const usuariosRoutes = require('./routes/usuarios');

// Inicializar app
const app = express();
const PORT = process.env.PORT || 5000;

// Asegurarse que la carpeta uploads exista
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Middlewares
app.use(cors());
app.use(express.json());

// Servir archivos estáticos para imágenes subidas
app.use('/uploads', express.static(uploadsDir));

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/usuarios', usuariosRoutes);
// Ruta opcional para eliminar tabla productos (solo para pruebas o desarrollo)
app.delete('/api/delete-tabla-productos', async (req, res) => {
  try {
    await sequelize.query('DROP TABLE IF EXISTS productos;');
    res.status(200).send('✅ Tabla productos eliminada correctamente');
  } catch (err) {
    console.error('❌ Error al eliminar tabla:', err);
    res.status(500).send('Error al ejecutar DROP TABLE');
  }
});

// Sincronizar la base de datos y levantar el servidor
sequelize.sync({ alter: true })
  .then(() => {
    console.log('✔️ Base de datos sincronizada');
    app.listen(PORT, () => {
      console.log(`🌐 Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Error al sincronizar la base de datos:', err);
  });
