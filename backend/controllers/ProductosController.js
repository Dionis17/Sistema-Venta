const Producto = require('../models/Producto');
const path = require('path');
const fs = require('fs');

// Validación de campos
const validarProducto = ({ nombre, precio_compra, precio_venta, stock, stock_minimo }) => {
  return (
    typeof nombre === 'string' && nombre.trim() !== '' &&
    !isNaN(precio_compra) && Number(precio_compra) >= 0 &&
    !isNaN(precio_venta) && Number(precio_venta) >= 0 &&
    !isNaN(stock) && Number(stock) >= 0 &&
    !isNaN(stock_minimo) && Number(stock_minimo) >= 0
  );
};

// Obtener todos los productos
const getProductos = async (req, res) => {
  try {
    const productos = await Producto.findAll({ order: [['id', 'ASC']] });
    res.status(200).json(productos);
  } catch (err) {
    console.error('Error al obtener productos:', err);
    res.status(500).json({ error: 'Error interno al obtener productos' });
  }
};

// Crear un producto
const createProducto = async (req, res) => {
  const { nombre, precio_compra, precio_venta, stock, stock_minimo } = req.body;

  if (!validarProducto({ nombre, precio_compra, precio_venta, stock, stock_minimo })) {
    return res.status(400).json({ error: 'Datos inválidos. Asegúrese de completar todos los campos correctamente.' });
  }

  try {
    let imagen_url = null;
    if (req.file) {
      imagen_url = `/uploads/${req.file.filename}`;
    }

    const nuevoProducto = await Producto.create({
      nombre,
      precio_compra: Number(precio_compra),
      precio_venta: Number(precio_venta),
      stock: Number(stock),
      stock_minimo: Number(stock_minimo),
      imagen_url
    });

    res.status(201).json({ message: 'Producto creado exitosamente', producto: nuevoProducto });
  } catch (err) {
    console.error('Error al crear producto:', err);
    res.status(500).json({ error: 'Error interno al crear producto' });
  }
};

// Actualizar un producto
const updateProducto = async (req, res) => {
  const { id } = req.params;
  const { nombre, precio_compra, precio_venta, stock, stock_minimo } = req.body;

  if (!validarProducto({ nombre, precio_compra, precio_venta, stock, stock_minimo })) {
    return res.status(400).json({ error: 'Datos inválidos. Verifique los campos.' });
  }

  try {
    const producto = await Producto.findByPk(id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

    // Si hay nueva imagen, eliminar la antigua
    if (req.file) {
      if (producto.imagen_url) {
        const rutaAntigua = path.join(__dirname, '..', producto.imagen_url);
        if (fs.existsSync(rutaAntigua)) fs.unlinkSync(rutaAntigua);
      }
      producto.imagen_url = `/uploads/${req.file.filename}`;
    }

    await producto.update({
      nombre,
      precio_compra: Number(precio_compra),
      precio_venta: Number(precio_venta),
      stock: Number(stock),
      stock_minimo: Number(stock_minimo),
      imagen_url: producto.imagen_url
    });

    res.status(200).json({ message: 'Producto actualizado correctamente', producto });
  } catch (err) {
    console.error('Error al actualizar producto:', err);
    res.status(500).json({ error: 'Error interno al actualizar producto' });
  }
};

// Eliminar un producto
const deleteProducto = async (req, res) => {
  const { id } = req.params;

  try {
    const producto = await Producto.findByPk(id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

    // Eliminar la imagen asociada si existe
    if (producto.imagen_url) {
      const ruta = path.join(__dirname, '..', producto.imagen_url);
      if (fs.existsSync(ruta)) fs.unlinkSync(ruta);
    }

    await producto.destroy();
    res.status(200).json({ message: 'Producto eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar producto:', err);
    res.status(500).json({ error: 'Error interno al eliminar producto' });
  }
};

module.exports = {
  getProductos,
  createProducto,
  updateProducto,
  deleteProducto
};
