// controllers/ventaController.js
const { sequelize } = require("../models");
const Venta = require("../models/ventas");
const DetalleVenta = require("../models/detallesDeVentas");
const Producto = require("../models/Producto");
const CuentaAbierta = require("../models/mcreditos");
const DetalleCuenta = require("../models/DetalleCuenta");

// Crear venta o pago de cuenta
async function crearVenta(req, res) {
  const { clienteId, tipoPago, montoEfectivo, productos, cuentaAbiertaId } = req.body;

  if (!productos || !Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ error: "Debe incluir al menos un producto." });
  }

  if (tipoPago !== "Efectivo" && !clienteId) {
    return res.status(400).json({ error: "Debe seleccionar un cliente para este tipo de pago." });
  }

  const t = await sequelize.transaction();

  try {
    const venta = await Venta.create(
      {
        clienteId: clienteId || null,
        tipoPago,
        montoEfectivo: tipoPago === "Efectivo" ? montoEfectivo : null,
        fecha: new Date(),
        cuentaAbiertaId: cuentaAbiertaId || null,
        estadoVenta: "Pagada",
      },
      { transaction: t }
    );

    const productosParaActualizar = [];

    for (const prod of productos) {
      const productoBD = await Producto.findByPk(prod.id, { transaction: t });
      if (!productoBD) {
        await t.rollback();
        return res.status(400).json({ error: `Producto con id ${prod.id} no existe.` });
      }

      if (!cuentaAbiertaId && productoBD.stock < prod.cantidad) {
        await t.rollback();
        return res.status(400).json({ error: `Stock insuficiente para ${productoBD.nombre}.` });
      }

      await DetalleVenta.create(
        {
          ventaId: venta.id,
          productoId: prod.id,
          cantidad: prod.cantidad,
          precioUnitario: productoBD.precio_venta,
        },
        { transaction: t }
      );

      if (!cuentaAbiertaId) {
        productosParaActualizar.push({ productoBD, cantidad: prod.cantidad });
      }
    }

    // Actualizar stock si no es cuenta abierta
    for (const item of productosParaActualizar) {
      item.productoBD.stock -= item.cantidad;
      if (item.productoBD.stock < 0) item.productoBD.stock = 0;
      await item.productoBD.save({ transaction: t });
    }

    // Actualizar cuenta abierta si aplica
    if (cuentaAbiertaId) {
      const cuenta = await CuentaAbierta.findByPk(cuentaAbiertaId, { transaction: t });
      if (!cuenta) {
        await t.rollback();
        return res.status(400).json({ error: "Cuenta abierta no encontrada." });
      }

      const montoPagadoActual = parseFloat(cuenta.monto_pagado || 0);
      const pagoRecibido = parseFloat(montoEfectivo || 0);
      const montoInicial = parseFloat(cuenta.monto_inicial || 0);

      const nuevoMontoPagado = montoPagadoActual + pagoRecibido;
      const nuevoMontoRestante = Math.max(0, montoInicial - nuevoMontoPagado);

      cuenta.monto_pagado = nuevoMontoPagado;
      cuenta.monto_restante = nuevoMontoRestante;
      cuenta.estado = nuevoMontoRestante === 0 ? "pagado" : "pendiente";

      await cuenta.save({ transaction: t });

      // Si se completó el pago, eliminar registro de cuenta abierta
      if (cuenta.estado === "pagado") {
        await DetalleCuenta.destroy({ where: { cuentaId: cuentaAbiertaId }, transaction: t });
        await CuentaAbierta.destroy({ where: { id: cuentaAbiertaId }, transaction: t });
      }
    }

    await t.commit();
    res.json({ message: "Venta registrada correctamente.", ventaId: venta.id });
  } catch (error) {
    await t.rollback();
    console.error("Error al registrar la venta:", error);
    res.status(500).json({ error: "Error al registrar la venta." });
  }
}

// Obtener todas las ventas con detalles, productos y pagos parciales
async function obtenerVentas(req, res) {
  try {
    const ventas = await Venta.findAll({
      include: [
        {
          model: DetalleVenta,
          as: "detalles",
          include: [{ model: Producto, as: "producto" }],
        },
        {
          model: CuentaAbierta,
          as: "credito", // alias correcto según asociación
        },
      ],
      order: [["fecha", "DESC"]],
    });

    const ventasMapeadas = ventas.map((v) => {
      const cuenta = v.credito || null;

      const montoPagado = cuenta ? parseFloat(cuenta.monto_pagado || 0) : parseFloat(v.montoEfectivo || 0);
      const montoRestante = cuenta ? parseFloat(cuenta.monto_restante || 0) : 0;
      const estado = cuenta ? cuenta.estado : "pagado";

      const montoTotal = (v.detalles || []).reduce((acc, d) => acc + d.cantidad * d.precioUnitario, 0);

      return {
        id: v.id,
        fecha: v.fecha,
        clienteId: v.clienteId,
        tipoPago: v.tipoPago,
        montoTotal,
        montoPagado,
        montoRestante,
        estado,
        detalles: v.detalles || [],
      };
    });

    res.json(ventasMapeadas);
  } catch (error) {
    console.error("Error al obtener ventas:", error);
    res.status(500).json({ error: "Error al obtener ventas" });
  }
}

// Anular venta y devolver stock
async function anularVenta(req, res) {
  const { id } = req.params;

  try {
    const venta = await Venta.findByPk(id, { include: [{ model: DetalleVenta, as: "detalles" }] });
    if (!venta) return res.status(404).json({ error: "Factura no encontrada." });

    const t = await Producto.sequelize.transaction();

    try {
      for (const item of venta.detalles) {
        const producto = await Producto.findByPk(item.productoId, { transaction: t });
        if (producto) {
          producto.stock += item.cantidad;
          await producto.save({ transaction: t });
        }
      }

      await DetalleVenta.destroy({ where: { ventaId: id }, transaction: t });
      await Venta.destroy({ where: { id }, transaction: t });

      await t.commit();
      res.json({ message: `Factura #${id} eliminada y stock restaurado.` });
    } catch (err) {
      await t.rollback();
      throw err;
    }
  } catch (error) {
    console.error("Error al eliminar la venta:", error);
    res.status(500).json({ error: "Error al eliminar la factura." });
  }
}

async function obtenerVentasPendientes(req, res) {
  try {
    const ventas = await Venta.findAll({
      where: { estadoCuadre: "pendiente" },
      include: [
        {
          model: DetalleVenta,
          as: "detallesVenta", // coincide con tu frontend
          include: [
            { model: Producto, as: "producto" }
          ]
        }
      ],
      order: [["id", "DESC"]],
    });

    // Formatear para frontend: asegura que montoPagado siempre exista
    const ventasFormateadas = ventas.map(v => {
      const totalFactura = v.detallesVenta?.reduce(
        (acc, d) => acc + d.cantidad * d.precioUnitario, 0
      ) || 0;

      return {
        id: v.id,
        fecha: v.fecha,
        clienteId: v.clienteId || null,
        estadoVenta: v.estadoVenta || "Pendiente",
        estadoCuadre: v.estadoCuadre || "pendiente",
        tipoPago: v.tipoPago || "N/A",
        montoPagado: v.montoPagado != null ? v.montoPagado : totalFactura,
        detallesVenta: v.detallesVenta || [],
      };
    });

    res.status(200).json(ventasFormateadas);
  } catch (error) {
    console.error("Error al obtener ventas pendientes de cuadre:", error);
    res.status(500).json({ error: "Error interno al obtener ventas pendientes de cuadre." });
  }
}

module.exports = {
  crearVenta,
  obtenerVentas,
  obtenerVentasPendientes,
  anularVenta,
};
