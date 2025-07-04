const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const registrar = async (req, res) => {
  const { username, password, nombre } = req.body;

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  try {
    const nuevoUsuario = await Usuario.create({ username, passwordHash, nombre });
    res.status(201).json({ message: 'Usuario creado', usuario: nuevoUsuario.username });
  } catch (error) {
    res.status(400).json({ message: 'Error al crear usuario', error: error.message });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  const usuario = await Usuario.findOne({ where: { username } });
  if (!usuario) return res.status(400).json({ message: 'Usuario no encontrado' });

  const passwordCorrecta = await bcrypt.compare(password, usuario.passwordHash);
  if (!passwordCorrecta) return res.status(400).json({ message: 'Contraseña incorrecta' });

  const token = jwt.sign(
    { id: usuario.id, username: usuario.username },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({ token });
};

module.exports = { registrar, login };
