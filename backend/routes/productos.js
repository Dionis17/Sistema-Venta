const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload'); // Multer configurado
const Producto = require('../models/Producto'); // Importación simple, no destructuring

const {
  getProductos,
  createProducto,
  updateProducto,
  deleteProducto
} = require('../controllers/ProductosController');

// Obtener todos los productos
router.get('/', getProductos);

// Crear producto con imagen
router.post('/', upload.single('imagen'), createProducto);

// Actualizar producto con posible nueva imagen
router.put('/:id', upload.single('imagen'), updateProducto);

// Eliminar producto
router.delete('/:id', deleteProducto);

// Descontar stock de un producto
router.put('/:id/descontar-stock', async (req, res) => {
  const { cantidad } = req.body;
  const id = req.params.id;

  if (!cantidad || isNaN(cantidad) || cantidad <= 0) {
    return res.status(400).json({ error: 'Cantidad inválida.' });
  }

  try {
    const producto = await Producto.findByPk(id);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    if (producto.stock < cantidad) {
      return res.status(400).json({ error: `Stock insuficiente: solo ${producto.stock} disponibles.` });
    }

    producto.stock -= cantidad;
    await producto.save();

    res.json({ success: true, productoActualizado: producto });
  } catch (error) {
    console.error('Error al descontar stock:', error);
    res.status(500).json({ error: 'Error al descontar stock.' });
  }
});

module.exports = router;
