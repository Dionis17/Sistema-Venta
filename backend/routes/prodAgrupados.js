const express = require('express');
const router = express.Router();
const Producto = require('../models/Producto'); // Ajusta según tu exportación

router.get('/agrupados', async (req, res) => {
  try {
    const productos = await Producto.findAll();

    const agrupados = {};

    productos.forEach(prod => {
      const nombre = prod.nombre.trim().toLowerCase();

      if (!agrupados[nombre]) {
        agrupados[nombre] = {
          nombre: prod.nombre.trim(),
          precio_venta: prod.precio_venta,
          imagen_url: prod.imagen_url || null, // Solo nombre de archivo o null
          stock_total: 0,
          ids: []
        };
      }

      agrupados[nombre].stock_total += prod.stock;
      agrupados[nombre].ids.push(prod.id);
    });

    res.json(Object.values(agrupados));
  } catch (error) {
    console.error("Error al agrupar productos:", error);
    res.status(500).json({ error: "Error al agrupar productos" });
  }
});

module.exports = router;
