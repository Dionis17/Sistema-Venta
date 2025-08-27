const express = require("express");
const router = express.Router();
const { Producto, Venta, DetalleVenta } = require("../models"); // Ajusta según tu estructura
const sequelize = require("../config/database");

// Crear venta
router.post("/", async (req, res) => {
  const { productos, clienteId, tipoPago, montoEfectivo, cuentaAbiertaId } = req.body;

  if (!productos || productos.length === 0) {
    return res.status(400).json({ error: 'No hay productos para facturar.' });
  }

  const transaction = await sequelize.transaction();

  try {
    if (!cuentaAbiertaId) {
      for (const item of productos) {
        const producto = await Producto.findByPk(item.id, { transaction });
        if (!producto) throw new Error(`Producto con ID ${item.id} no encontrado.`);
        if (producto.stock < item.cantidad) throw new Error(`Stock insuficiente para ${producto.nombre}.`);
        producto.stock -= item.cantidad;
        await producto.save({ transaction });
      }
    }

    const venta = await Venta.create({
      clienteId: clienteId || null,
      tipoPago,
      montoEfectivo: tipoPago === "Efectivo" ? montoEfectivo : null,
      cuentaAbiertaId: cuentaAbiertaId || null,
      estadoVenta: 'Pagada',
    }, { transaction });

    for (const item of productos) {
      await DetalleVenta.create({
        ventaId: venta.id,
        productoId: item.id,
        cantidad: item.cantidad,
        precioUnitario: item.precio
      }, { transaction });
    }

    await transaction.commit();
    res.json({ message: 'Venta procesada correctamente', venta });
  } catch (error) {
    await transaction.rollback();
    console.error('Error procesando venta:', error);
    res.status(500).json({ error: error.message });
  }
});

// Listar ventas
router.get("/", async (req, res) => {
  try {
    const ventas = await Venta.findAll({
      include: [
        {
          model: DetalleVenta,
          as: 'detalles',
          include: [{ model: Producto, as: 'producto' }]
        },
        { model: Producto, as: 'cliente' } // si usas cliente, ajusta alias
      ],
      order: [['id', 'DESC']]
    });
    res.json(ventas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener ventas' });
  }
});

// Anular venta
router.post("/anular/:id", async (req, res) => {
  const { id } = req.params;

  const transaction = await sequelize.transaction();

  try {
    const venta = await Venta.findByPk(id, { include: [{ model: DetalleVenta, as: 'detalles' }] });
    if (!venta) return res.status(404).json({ error: 'Factura no encontrada.' });
    if (venta.estadoVenta === 'Anulada') return res.status(400).json({ error: 'La factura ya está anulada.' });

    for (const item of venta.detalles) {
      const producto = await Producto.findByPk(item.productoId, { transaction });
      if (producto) {
        producto.stock += item.cantidad;
        await producto.save({ transaction });
      }
    }

    venta.estadoVenta = 'Anulada';
    await venta.save({ transaction });

    await transaction.commit();
    res.json({ message: `Factura #${id} anulada y stock restaurado.` });
  } catch (error) {
    await transaction.rollback();
    console.error('Error anulando factura:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
