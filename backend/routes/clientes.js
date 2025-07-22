// routes/clientes.js
const express = require('express');
const router = express.Router();
const Cliente = require('../models/Cliente');

// Listar todos los clientes
router.get('/', async (req, res) => {
  try {
    const clientes = await Cliente.findAll();
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
});

// Crear cliente nuevo
router.post('/', async (req, res) => {
  try {
    const { nombre, telefono, direccion } = req.body;
    if (!nombre) return res.status(400).json({ error: 'Nombre es obligatorio' });
    const nuevoCliente = await Cliente.create({ nombre, telefono, direccion });
    res.status(201).json(nuevoCliente);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear cliente' });
  }
});

// Actualizar cliente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, telefono, direccion } = req.body;
    const cliente = await Cliente.findByPk(id);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
    await cliente.update({ nombre, telefono, direccion });
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
});

// Eliminar cliente
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Cliente.findByPk(id);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
    await cliente.destroy();
    res.json({ message: 'Cliente eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
});

module.exports = router;
