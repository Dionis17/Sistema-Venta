const DetalleCuenta = require('../models/DetalleCuenta');
const Producto = require('../models/Producto');
const Credito = require('../models/mcreditos'); // Ajusta el nombre si es diferente

// Agregar un producto a una cuenta existente y actualizar montos del crédito
exports.agregarProductoACuenta = async (req, res) => {
  const { cuentaId, productoId, cantidad, precio } = req.body;

  try {
    // Validar si el producto existe
    const producto = await Producto.findByPk(productoId);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Verificar stock suficiente
    if (producto.stock < cantidad) {
      return res.status(400).json({ error: 'Stock insuficiente para el producto seleccionado' });
    }

    // Restar stock
    producto.stock -= cantidad;
    await producto.save();

    // Crear detalle de cuenta
    const detalle = await DetalleCuenta.create({
      cuentaId,
      productoId,
      cantidad,
      precio,
    });

    // Actualizar montos del crédito
    const credito = await Credito.findByPk(cuentaId);
    if (credito) {
      const subtotal = parseFloat(cantidad) * parseFloat(precio);
      credito.monto_inicial = parseFloat(credito.monto_inicial) + subtotal;
      credito.monto_restante = parseFloat(credito.monto_restante) + subtotal;
      await credito.save();
    }

    res.status(201).json({ message: 'Producto agregado a la cuenta correctamente', detalle });
  } catch (error) {
    console.error('Error al agregar producto a la cuenta:', error);
    res.status(500).json({ error: 'Error interno al agregar producto a la cuenta' });
  }
};

// Obtener todos los productos y detalles asociados a una cuenta
exports.obtenerProductosDeCuenta = async (req, res) => {
  const { cuentaId } = req.params;

  try {
    const detalles = await DetalleCuenta.findAll({
      where: { cuentaId },
      include: [{ model: Producto, as: 'Producto' }],
    });

    const productosCuenta = detalles.map(detalle => ({
      id: detalle.Producto.id,
      nombre: detalle.Producto.nombre,
      precio_venta: detalle.precio,
      cantidad: detalle.cantidad,
      subtotal: (parseFloat(detalle.precio) * parseFloat(detalle.cantidad)).toFixed(2),
    }));

    res.json(productosCuenta);
  } catch (error) {
    console.error('Error al obtener productos de la cuenta:', error);
    res.status(500).json({ error: 'Error interno al obtener productos de la cuenta' });
  }
};

// Cobrar (eliminar) una cuenta y sus detalles
exports.cobrarCuenta = async (req, res) => {
  const { cuentaId } = req.params;

  try {
    const cuenta = await Credito.findByPk(cuentaId);
    if (!cuenta) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }

    // Eliminar detalles relacionados
    await DetalleCuenta.destroy({ where: { cuentaId } });

    // Eliminar la cuenta (crédito)
    await cuenta.destroy();

    res.json({ message: 'Cuenta cobrada y eliminada correctamente' });
  } catch (error) {
    console.error('Error al cobrar la cuenta:', error);
    res.status(500).json({ error: 'Error interno al cobrar la cuenta' });
  }
};
