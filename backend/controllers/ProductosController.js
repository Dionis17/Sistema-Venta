const Producto = require('../models/Producto');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');

// Validación de campos
const validarProducto = ({ nombre, precio_compra, precio_venta, precio_especial, stock, stock_minimo, proveedor_id }) => {
  return (
    typeof nombre === 'string' && nombre.trim() !== '' &&
    !isNaN(precio_compra) && Number(precio_compra) >= 0 &&
    !isNaN(precio_venta) && Number(precio_venta) >= 0 &&
    (precio_especial === undefined || precio_especial === null || (!isNaN(precio_especial) && Number(precio_especial) >= 0)) &&
    !isNaN(stock) && Number(stock) >= 0 &&
    !isNaN(stock_minimo) && Number(stock_minimo) >= 0 &&
    (proveedor_id === null || !isNaN(proveedor_id))
  );
};

// Obtener todos los productos
const getProductos = async (req, res) => {
  try {
    const productos = await Producto.findAll({
      order: [['id', 'ASC']],
      include: [{ association: 'proveedor', attributes: ['id', 'nombre'] }]
    });
    res.status(200).json(productos);
  } catch (err) {
    console.error('Error al obtener productos:', err);
    res.status(500).json({ error: 'Error interno al obtener productos' });
  }
};

// Crear un producto
const createProducto = async (req, res) => {
  let {
    nombre,
    precio_compra,
    precio_venta,
    precio_especial,
    stock,
    stock_minimo,
    proveedor_id
  } = req.body;

  if (!validarProducto({ nombre, precio_compra, precio_venta, precio_especial, stock, stock_minimo, proveedor_id })) {
    return res.status(400).json({ error: 'Datos inválidos. Asegúrese de completar todos los campos correctamente.' });
  }

  nombre = nombre.trim().toLowerCase();

  try {
    // Preparar condición para buscar duplicados
    const whereCondition = { nombre };
    if (proveedor_id !== null && proveedor_id !== undefined) {
      whereCondition.proveedor_id = proveedor_id;
    } else {
      whereCondition.proveedor_id = null;
    }

    // Validar que no se repita dentro del mismo proveedor
    const existe = await Producto.findOne({ where: whereCondition });
    if (existe) {
      return res.status(400).json({ error: 'Este proveedor ya tiene un producto con ese nombre.' });
    }

    let imagen_url = null;
    if (req.file) {
      imagen_url = `/uploads/${req.file.filename}`;
    }

    const nuevoProducto = await Producto.create({
      nombre,
      precio_compra: Number(precio_compra),
      precio_venta: Number(precio_venta),
      precio_especial: precio_especial !== undefined && precio_especial !== null && precio_especial !== '' ? Number(precio_especial) : null,
      stock: Number(stock),
      stock_minimo: Number(stock_minimo),
      proveedor_id: proveedor_id ? Number(proveedor_id) : null,
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
  let {
    nombre,
    precio_compra,
    precio_venta,
    precio_especial,
    stock,
    stock_minimo,
    proveedor_id
  } = req.body;

  if (!validarProducto({ nombre, precio_compra, precio_venta, precio_especial, stock, stock_minimo, proveedor_id })) {
    return res.status(400).json({ error: 'Datos inválidos. Verifique los campos.' });
  }

  nombre = nombre.trim().toLowerCase();

  try {
    const producto = await Producto.findByPk(id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

    // Preparar condición para buscar duplicados (excluyendo el producto actual)
    const whereCondition = { nombre, id: { [Op.ne]: id } };
    if (proveedor_id !== null && proveedor_id !== undefined) {
      whereCondition.proveedor_id = proveedor_id;
    } else {
      whereCondition.proveedor_id = null;
    }

    // Validar que no se repita dentro del mismo proveedor
    const existe = await Producto.findOne({ where: whereCondition });
    if (existe) {
      return res.status(400).json({ error: 'Este proveedor ya tiene un producto con ese nombre.' });
    }

    // Manejo de imagen si se reemplaza
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
      precio_especial: precio_especial !== undefined && precio_especial !== null && precio_especial !== '' ? Number(precio_especial) : null,
      stock: Number(stock),
      stock_minimo: Number(stock_minimo),
      proveedor_id: proveedor_id ? Number(proveedor_id) : null,
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
