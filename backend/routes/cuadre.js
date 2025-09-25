const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");

const CuadreCaja = require("../models/cuadres");
const Venta = require("../models/ventas");
const DetalleVenta = require("../models/detallesDeVentas");
const Producto = require("../models/Producto");

// ===============================
// Crear un nuevo cuadre de caja
// ===============================
router.post("/", async (req, res) => {
  try {
    const {
      usuarioCuadre,
      usuarioVenta,
      efectivoSistema,
      efectivoFisico,
      fijo,
      observaciones,
    } = req.body;

    if (
      !usuarioCuadre ||
      efectivoSistema == null ||
      efectivoFisico == null ||
      fijo == null
    ) {
      return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
    }

    // Validar que sean números
    if (isNaN(efectivoSistema) || isNaN(efectivoFisico) || isNaN(fijo)) {
      return res
        .status(400)
        .json({ mensaje: "Valores numéricos inválidos" });
    }

    const diferencia =
      parseFloat(efectivoFisico) + parseFloat(fijo) - parseFloat(efectivoSistema);

    const nuevoCuadre = await CuadreCaja.create({
      usuarioCuadre,
      usuarioVenta,
      efectivoSistema,
      efectivoFisico,
      fijo,
      diferencia,
      observaciones,
      estado: "pendiente",
      fechaHora: new Date(),
    });

    res.status(201).json(nuevoCuadre);
  } catch (error) {
    console.error("Error en POST /api/cuadres:", error);
    res.status(500).json({
      mensaje: "Error al crear el cuadre de caja",
      error: error.message,
    });
  }
});

// ===============================
// Obtener cuadres con filtro por periodo
// ===============================
router.get("/", async (req, res) => {
  try {
    const { periodo, inicio, fin } = req.query;

    let fechaInicio = new Date();
    let fechaFin = new Date();

    if (periodo === "semanal") {
      fechaInicio.setDate(fechaInicio.getDate() - 7);
    } else if (periodo === "mensual") {
      fechaInicio.setMonth(fechaInicio.getMonth() - 1);
    } else if (periodo === "anual") {
      fechaInicio.setFullYear(fechaInicio.getFullYear() - 1);
    } else if (periodo === "personalizado" && inicio && fin) {
      fechaInicio = new Date(inicio);
      fechaFin = new Date(fin);
    }

    // 🔹 Obtener cuadres dentro del periodo
    const registros = await CuadreCaja.findAll({
      where: {
        fechaHora: { [Op.between]: [fechaInicio, fechaFin] },
      },
      order: [["fechaHora", "DESC"]],
    });

    // 🔹 Obtener ventas con detalles y productos
    const ventas = await Venta.findAll({
      where: {
        createdAt: { [Op.between]: [fechaInicio, fechaFin] },
      },
      include: [
        {
          model: DetalleVenta,
          as: "detallesVenta", // <- aquí el alias correcto
          include: [
            {
              model: Producto,
              as: "producto", // <- alias de la relación DetalleVenta -> Producto
            },
          ],
        },
      ],
    });

    // Calcular vendido y beneficio
    let vendido = 0;
    let beneficio = 0;

    ventas.forEach((venta) => {
      venta.detallesVenta.forEach((det) => {
        const costo = det.producto?.precio_compra || 0;
        const pv = det.precioUnitario; // precio de venta en la tabla DetalleVenta
        const cantidad = det.cantidad;

        vendido += pv * cantidad;
        beneficio += (pv - costo) * cantidad;
      });
    });


    const diferencia = registros.reduce(
      (acc, r) => acc + parseFloat(r.diferencia || 0),
      0
    );

    res.json({
      resumen: { vendido, beneficio, diferencia },
      registros,
    });
  } catch (error) {
    console.error("Error en GET /api/cuadres:", error);
    res.status(500).json({
      mensaje: "Error al obtener registros de cuadres",
      error: error.message,
    });
  }
});

// ===============================
// Cerrar un cuadre y actualizar ventas pendientes
// ===============================
router.put("/:id/cerrar", async (req, res) => {
  const transaction = await CuadreCaja.sequelize.transaction();
  try {
    const { id } = req.params;

    const cuadre = await CuadreCaja.findByPk(id, { transaction });
    if (!cuadre) {
      await transaction.rollback();
      return res.status(404).json({ mensaje: "Cuadre no encontrado" });
    }

    cuadre.estado = "cerrado";
    await cuadre.save({ transaction });

    // Actualizar ventas pendientes solo hasta la fecha del cuadre
    const [actualizadas] = await Venta.update(
      { estadoCuadre: "cuadrado" },
      {
        where: {
          estadoCuadre: "pendiente",
          createdAt: { [Op.lte]: cuadre.fechaHora },
        },
        transaction,
      }
    );

    await transaction.commit();

    res.json({
      mensaje: "Cuadre cerrado y ventas pendientes actualizadas correctamente",
      cuadre,
      ventasActualizadas: actualizadas,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error cerrando cuadre:", error);
    res.status(500).json({
      mensaje: "Error al cerrar el cuadre",
      error: error.message,
    });
  }
});

module.exports = router;
