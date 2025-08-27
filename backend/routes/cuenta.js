const express = require('express');
const router = express.Router();

const cuentaController = require('../controllers/CuentaController');

console.log(typeof cuentaController.agregarProductoACuenta); // debe ser 'function'
console.log(typeof cuentaController.obtenerProductosDeCuenta); // debe ser 'function'
console.log(typeof cuentaController.cobrarCuenta); // debe ser 'function' para la función que elimina la cuenta

router.post('/agregar-producto', cuentaController.agregarProductoACuenta);
router.get('/productos/:cuentaId', cuentaController.obtenerProductosDeCuenta);
router.delete('/cobrar/:cuentaId', cuentaController.cobrarCuenta);  // <-- ruta para cobrar y eliminar cuenta

module.exports = router;
