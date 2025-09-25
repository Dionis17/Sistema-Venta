const express = require("express");
const router = express.Router(); // ⬅️ Esto faltaba
const ventaController = require("../controllers/ventaController");

// Rutas
router.post("/", ventaController.crearVenta);
router.get("/", ventaController.obtenerVentas);
router.post("/anular/:id", ventaController.anularVenta);
router.get("/pendientes", ventaController.obtenerVentasPendientes);

module.exports = router;
