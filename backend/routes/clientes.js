const express = require('express');
const router = express.Router();
const Cliente = require('../models/Cliente');
const authenticateToken = require('../middleware/authMiddleware');

// GET todos los clientes
router.get('/', authenticateToken, async (req, res) => {
  try {
    const clientes = await Cliente.findAll();
    res.json(clientes);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener clientes' });
  }
});

// POST crear cliente
router.post('/', authenticateToken, async (req, res) => {
  const { nombre, telefono, direccion } = req.body;
  if (!nombre) return res.status(400).json({ message: 'Nombre es requerido' });

  try {
    const nuevo = await Cliente.create({ nombre, telefono, direccion });
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear cliente' });
  }
});

// PUT editar cliente
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { nombre, telefono, direccion } = req.body;

  try {
    const cliente = await Cliente.findByPk(id);
    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });

    cliente.nombre = nombre ?? cliente.nombre;
    cliente.telefono = telefono ?? cliente.telefono;
    cliente.direccion = direccion ?? cliente.direccion;

    await cliente.save();
    res.json(cliente);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar cliente' });
  }
});

// DELETE eliminar cliente
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const cliente = await Cliente.findByPk(id);
    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });

    await cliente.destroy();
    res.json({ message: 'Cliente eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar cliente' });
  }
});

module.exports = router;
