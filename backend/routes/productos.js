const express = require('express');
const router = express.Router();

const {
  getProductos,
  createProducto,
  updateProducto,
  deleteProducto
} = require('../controllers/ProductosController');

const upload = require('../middlewares/upload'); // Asegúrate de que este archivo existe

// Obtener todos los productos
router.get('/', getProductos);

// Crear un nuevo producto con imagen
router.post('/', upload.single('imagen'), createProducto);

// Actualizar producto por ID con posible nueva imagen
router.put('/:id', upload.single('imagen'), updateProducto);

// Eliminar producto por ID
router.delete('/:id', deleteProducto);

module.exports = router;
