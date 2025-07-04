const express = require('express');
const router = express.Router();
const Producto = require('../models/Producto');
const authenticateToken = require('../middleware/authMiddleware');

// GET todos los productos
router.get('/', authenticateToken, async (req, res) => {
  try {
    const productos = await Producto.findAll();
    res.json(productos);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener productos' });
  }
});

// POST crear producto
router.post('/', authenticateToken, async (req, res) => {
  const { nombre, precio } = req.body;
  if (!nombre || !precio) return res.status(400).json({ message: 'Nombre y precio son requeridos' });

  try {
    const nuevo = await Producto.create({ nombre, precio });
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear producto' });
  }
});

// PUT editar producto
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { nombre, precio } = req.body;

  try {
    const producto = await Producto.findByPk(id);
    if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });

    producto.nombre = nombre ?? producto.nombre;
    producto.precio = precio ?? producto.precio;

    await producto.save();
    res.json(producto);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar producto' });
  }
});

// DELETE eliminar producto
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const producto = await Producto.findByPk(id);
    if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });

    await producto.destroy();
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar producto' });
  }
});

module.exports = router;
