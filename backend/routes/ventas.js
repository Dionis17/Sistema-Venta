const express = require('express');
const router = express.Router();
const Producto = require('../models/Producto');

router.post('/', async (req, res) => {
  const { productos } = req.body; // [{ id, cantidad }, ...]

  if (!productos || !Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ error: 'No se recibieron productos válidos.' });
  }

  const transaction = await Producto.sequelize.transaction();

  try {
    for (const item of productos) {
      const producto = await Producto.findByPk(item.id, { transaction });

      if (!producto) {
        throw new Error(`Producto con ID ${item.id} no encontrado.`);
      }

      if (producto.stock < item.cantidad) {
        throw new Error(`Stock insuficiente para ${producto.nombre}.`);
      }

      producto.stock -= item.cantidad;
      await producto.save({ transaction });
    }

    await transaction.commit();
    res.json({ message: 'Venta realizada y stock actualizado correctamente.' });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al procesar venta:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
