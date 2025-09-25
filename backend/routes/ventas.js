const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const { Producto, Venta, DetalleVenta, Cliente } = require("../models"); // Asumiendo que Cliente se necesita para includes
const sequelize = require("../config/database");

// ====================================================================
// POST / - Crear nueva venta
// ====================================================================
router.post("/", async (req, res) => {
  const { productos, clienteId, tipoPago, montoEfectivo, cuentaAbiertaId } = req.body;

  if (!productos || productos.length === 0) {
    return res.status(400).json({ error: 'No hay productos para procesar la venta.' });
  }

  // Iniciar transacción para asegurar atomicidad
  const transaction = await sequelize.transaction();

  try {
    // 1. Verificar y actualizar stock (solo si no es cuenta abierta)
    if (!cuentaAbiertaId) {
      for (const item of productos) {
        const producto = await Producto.findByPk(item.id, { transaction });

        if (!producto) {
          throw new Error(`Producto con ID ${item.id} no encontrado.`);
        }

        if (producto.stock < item.cantidad) {
          throw new Error(`Stock insuficiente para el producto: ${producto.nombre}. Cantidad solicitada: ${item.cantidad}, Stock actual: ${producto.stock}.`);
        }

        // Actualizar stock
        producto.stock -= item.cantidad;
        await producto.save({ transaction });
      }
    }

    // 2. Crear venta
    const venta = await Venta.create({
      clienteId: clienteId || null,
      tipoPago,
      montoEfectivo: tipoPago === "Efectivo" ? montoEfectivo : null,
      cuentaAbiertaId: cuentaAbiertaId || null,
      estadoVenta: cuentaAbiertaId
        ? (montoEfectivo < totalCuenta ? "Parcial" : "Pagada")
        : "Pagada",
      estadoCuadre: "pendiente",
    }, { transaction });


    // 3. Crear detalles de venta
    const detallesVenta = productos.map(item => ({
      ventaId: venta.id,
      productoId: item.id,
      cantidad: item.cantidad,
      precioUnitario: item.precio
    }));

    await DetalleVenta.bulkCreate(detallesVenta, { transaction });

    // 4. Confirmar transacción
    await transaction.commit();

    res.status(201).json({
      message: 'Venta procesada correctamente.',
      ventaId: venta.id
    });

  } catch (error) {
    // Revertir transacción en caso de error
    await transaction.rollback();
    console.error('Error procesando venta:', error);

    // Devolver un error 400 si el error es de negocio (stock/producto no encontrado), sino 500
    const isClientError = error.message.includes("Stock insuficiente") || error.message.includes("no encontrado");
    res.status(isClientError ? 400 : 500).json({
      error: isClientError ? error.message : 'Error interno al procesar la venta.'
    });
  }
});

// ====================================================================
// GET /pendientes - Listar ventas pendientes de cuadre
// ====================================================================
router.get("/pendientes", async (req, res) => {
  try {
    const ventas = await Venta.findAll({
      where: { estadoCuadre: "pendiente" },
      include: [
        {
          model: DetalleVenta,
          as: 'detallesVenta',  // ⬅ cambiar a detallesVenta para coincidir con React
          include: [{ model: Producto, as: 'producto' }]
        }
      ],
      order: [['id', 'DESC']]
    });

    res.status(200).json(ventas);
  } catch (error) {
    console.error("Error al obtener ventas pendientes de cuadre:", error);
    res.status(500).json({ error: 'Error interno al obtener ventas pendientes de cuadre.' });
  }
});

// ====================================================================
// POST /marcar-cuadradas - Marcar todas las ventas pendientes como cuadradas
// ====================================================================
router.post("/marcar-cuadradas", async (req, res) => {
  try {
    const [actualizadas] = await Venta.update(
      { estadoCuadre: "cerrado" },
      { where: { estadoCuadre: "pendiente" } }
    );

    res.status(200).json({
      mensaje: `${actualizadas} ventas han sido marcadas como cerradas.`
    });
  } catch (error) {
    console.error("Error al marcar ventas cuadradas:", error);
    res.status(500).json({ error: "Error interno al actualizar el estado de las ventas." });
  }
});

// ====================================================================
// POST /anular/:id - Anular una venta y restaurar stock
// ====================================================================
router.post("/anular/:id", async (req, res) => {
  const { id } = req.params;
  const transaction = await sequelize.transaction();

  try {
    const venta = await Venta.findByPk(id, {
      include: [{ model: DetalleVenta, as: 'detalles' }]
    });

    if (!venta) {
      await transaction.rollback();
      return res.status(404).json({ error: `Factura con ID ${id} no encontrada.` });
    }

    if (venta.estadoVenta === 'Anulada') {
      await transaction.rollback();
      return res.status(400).json({ error: `La factura #${id} ya se encuentra anulada.` });
    }

    // 1. Restaurar stock
    for (const item of venta.detalles) {
      const producto = await Producto.findByPk(item.productoId, { transaction });

      if (producto) {
        producto.stock += item.cantidad;
        await producto.save({ transaction });
      } else {
        // Opcional: registrar que un producto del detalle no existe (debería ser raro)
        console.warn(`Producto con ID ${item.productoId} del detalle de la venta ${id} no encontrado para restaurar stock.`);
      }
    }

    // 2. Anular venta
    venta.estadoVenta = 'Anulada';
    await venta.save({ transaction });

    // 3. Confirmar transacción
    await transaction.commit();

    res.status(200).json({
      message: `Factura #${id} anulada y stock restaurado correctamente.`
    });

  } catch (error) {
    await transaction.rollback();
    console.error(`Error anulando factura #${id}:`, error);
    res.status(500).json({ error: 'Error interno al intentar anular la factura.' });
  }
});

module.exports = router;