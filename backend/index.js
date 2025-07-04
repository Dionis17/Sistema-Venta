const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productosRoutes = require('./routes/productos');
const clientesRoutes = require('./routes/clientes'); // ✅

const sequelize = require('./config/database');

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/clientes', clientesRoutes); // ✅

// Conectar a la base de datos y arrancar el servidor
sequelize.sync()
  .then(() => {
    console.log('Base de datos sincronizada');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error al sincronizar la base de datos:', err);
  });
