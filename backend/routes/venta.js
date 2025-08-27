// routes/venta.js
const express = require("express");
const router = express.Router();
const { crearVenta, obtenerVentas, anularVenta } = require("../controllers/ventaController");

router.post("/", crearVenta);
router.get("/", obtenerVentas);
router.post("/anular/:id", anularVenta); // <--- agregar esta línea

module.exports = router;
