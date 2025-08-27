const express = require('express');
const router = express.Router();
const Credito = require('../models/mcreditos');
const Cliente = require('../models/Cliente');

// Obtener todos los créditos con info del cliente
router.get('/', async (req, res) => {
  try {
    const creditos = await Credito.findAll({
      include: [{
        model: Cliente,
        as: 'cliente',
        attributes: ['id', 'nombre', 'telefono', 'email'],
      }],
      order: [['fecha', 'DESC']],
    });
    res.json(creditos);
  } catch (error) {
    console.error('Error al obtener créditos:', error);
    res.status(500).json({ message: 'Error al obtener créditos' });
  }
});

// Crear crédito solo si no existe otro pendiente
router.post('/', async (req, res) => {
  try {
    const { cliente_id } = req.body;

    if (!cliente_id) {
      return res.status(400).json({ message: 'cliente_id es requerido' });
    }

    // Verificar si el cliente ya tiene un crédito pendiente
    const creditoExistente = await Credito.findOne({
      where: {
        cliente_id,
        estado: 'pendiente',
      },
    });

    if (creditoExistente) {
      return res.status(400).json({
        message: 'Este cliente ya tiene un crédito abierto pendiente.',
      });
    }

    // Crear crédito con montos en 0
    const nuevoCredito = await Credito.create({
      cliente_id,
      monto_inicial: 0,
      monto_pagado: 0,
      monto_restante: 0,
      estado: 'pendiente',
      fecha: new Date(),
    });

    res.status(201).json(nuevoCredito);
  } catch (error) {
    console.error('Error al crear crédito:', error);
    res.status(500).json({ message: 'Error al crear el crédito.' });
  }
});

module.exports = router;
