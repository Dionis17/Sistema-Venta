const express = require('express');
const Usuario = require('../models/gesUsuario');
const multer = require('multer');
const path = require('path');
const authenticateToken = require('../middleware/authenticateToken'); // Importar middleware JWT
const router = express.Router();

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Ruta protegida para obtener datos del usuario logueado
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.user.id, {
      attributes: ['id', 'nombre_usuario', 'rol', 'foto']
    });
    if (!usuario) return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });

    res.json({
      ok: true,
      nombre: usuario.nombre_usuario,
      rol: usuario.rol,
      foto: usuario.foto ? `http://localhost:5000/uploads/${usuario.foto}` : null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Error del servidor' });
  }
});

// Listar todos los usuarios (sin protección, ajusta si quieres proteger)
router.get('/', async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: ['id', 'nombre_usuario', 'rol', 'estado', 'foto']
    });
    res.json({ ok: true, usuarios });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Error del servidor' });
  }
});

// Crear usuario con posible foto subida
router.post('/', upload.single('foto'), async (req, res) => {
  const { nombre_usuario, contraseña, rol, estado } = req.body;
  const foto = req.file ? req.file.filename : null;
  try {
    const existe = await Usuario.findOne({ where: { nombre_usuario } });
    if (existe) return res.status(400).json({ ok: false, error: 'Usuario ya existe' });

    const nuevoUsuario = await Usuario.create({ nombre_usuario, contraseña, rol, estado, foto });
    res.status(201).json({ ok: true, usuario: nuevoUsuario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Error del servidor' });
  }
});

// Actualizar usuario (con foto opcional)
router.put('/:id', upload.single('foto'), async (req, res) => {
  const { nombre_usuario, contraseña, rol, estado } = req.body;
  const foto = req.file ? req.file.filename : null;

  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });

    if (nombre_usuario) usuario.nombre_usuario = nombre_usuario;
    if (contraseña) usuario.contraseña = contraseña;
    if (rol) usuario.rol = rol;
    if (estado) usuario.estado = estado;
    if (foto) usuario.foto = foto;

    await usuario.save();
    res.json({ ok: true, usuario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Error del servidor' });
  }
});

// Eliminar usuario
router.delete('/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });

    await usuario.destroy();
    res.json({ ok: true, message: 'Usuario eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Error del servidor' });
  }
});

module.exports = router;
