const { sequelize } = require('../models'); // Asegúrate de exportar sequelize en tu index.js
const DetalleCuenta = require('../models/DetalleCuenta');
const Producto = require('../models/Producto');
const Credito = require('../models/mcreditos'); // Ajusta si tu modelo tiene otro nombre

// Agregar un producto a una cuenta existente y actualizar montos del crédito
exports.agregarProductoACuenta = async (req, res) => {
  const { cuentaId, productoId, cantidad, precio } = req.body;

  // Validaciones básicas
  if (!cuentaId || !productoId || !cantidad || cantidad <= 0 || !precio || precio < 0) {
    return res.status(400).json({ error: 'Datos inválidos' });
  }

  const t = await sequelize.transaction();

  try {
    const producto = await Producto.findByPk(productoId, { transaction: t });
    if (!producto) {
      await t.rollback();
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    if (producto.stock < cantidad) {
      await t.rollback();
      return res.status(400).json({ error: 'Stock insuficiente para el producto seleccionado' });
    }

    // Restar stock
    producto.stock -= cantidad;
    await producto.save({ transaction: t });

    // Crear detalle de cuenta
    const detalle = await DetalleCuenta.create({
      cuentaId,
      productoId,
      cantidad,
      precio,
    }, { transaction: t });

    // Actualizar montos del crédito
    const credito = await Credito.findByPk(cuentaId, { transaction: t });
    if (credito) {
      const subtotal = parseFloat(cantidad) * parseFloat(precio);
      credito.monto_inicial = parseFloat(credito.monto_inicial) + subtotal;
      credito.monto_restante = parseFloat(credito.monto_restante) + subtotal;
      await credito.save({ transaction: t });
    }

    await t.commit();
    res.status(201).json({ message: 'Producto agregado a la cuenta correctamente', detalle });
  } catch (error) {
    await t.rollback();
    console.error('Error al agregar producto a la cuenta:', error);
    res.status(500).json({ error: 'Error interno al agregar producto a la cuenta' });
  }
};

// Obtener todos los productos y detalles asociados a una cuenta
exports.obtenerProductosDeCuenta = async (req, res) => {
  const { cuentaId } = req.params;

  if (!cuentaId) return res.status(400).json({ error: 'ID de cuenta requerido' });

  try {
    const detalles = await DetalleCuenta.findAll({
      where: { cuentaId },
      include: [{ model: Producto, as: 'Producto' }],
    });

    const productosCuenta = detalles.map(detalle => ({
      id: detalle.Producto.id,
      nombre: detalle.Producto.nombre,
      precio_venta: parseFloat(detalle.precio),
      cantidad: parseInt(detalle.cantidad),
      subtotal: (parseFloat(detalle.precio) * parseInt(detalle.cantidad)).toFixed(2),
    }));

    res.json({ productos: productosCuenta });
  } catch (error) {
    console.error('Error al obtener productos de la cuenta:', error);
    res.status(500).json({ error: 'Error interno al obtener productos de la cuenta' });
  }
};

// Cobrar (eliminar) una cuenta y sus detalles
exports.cobrarCuenta = async (req, res) => {
  const { cuentaId } = req.params;

  if (!cuentaId) return res.status(400).json({ error: 'ID de cuenta requerido' });

  const t = await sequelize.transaction();

  try {
    const cuenta = await Credito.findByPk(cuentaId, { transaction: t });
    if (!cuenta) {
      await t.rollback();
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }

    // Eliminar detalles relacionados
    await DetalleCuenta.destroy({ where: { cuentaId }, transaction: t });

    // Eliminar la cuenta (crédito)
    await cuenta.destroy({ transaction: t });

    await t.commit();
    res.json({ message: 'Cuenta cobrada y eliminada correctamente' });
  } catch (error) {
    await t.rollback();
    console.error('Error al cobrar la cuenta:', error);
    res.status(500).json({ error: 'Error interno al cobrar la cuenta' });
  }
};
