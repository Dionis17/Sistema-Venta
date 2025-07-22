// routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/gesUsuario'); // ajusta si tu modelo tiene otro nombre
const bcrypt = require('bcrypt');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { nombre_usuario, contraseña } = req.body;

  if (!nombre_usuario || !contraseña) {
    return res.status(400).json({ ok: false, error: 'Faltan datos' });
  }

  try {
    const usuario = await Usuario.findOne({ where: { nombre_usuario } });

    if (!usuario) {
      return res.status(401).json({ ok: false, error: 'Credenciales inválidas' });
    }

    const esValida = await bcrypt.compare(contraseña, usuario.contraseña);

    if (!esValida) {
      return res.status(401).json({ ok: false, error: 'Credenciales inválidas' });
    }

    // Crear token JWT
    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET || 'secreto123',
      { expiresIn: '1d' }
    );

    res.json({
      ok: true,
      usuario: {
        id: usuario.id,
        nombre_usuario: usuario.nombre_usuario,
        rol: usuario.rol
      },
      token
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ ok: false, error: 'Error del servidor' });
  }
});

module.exports = router;
