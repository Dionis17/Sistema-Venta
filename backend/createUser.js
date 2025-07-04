const bcrypt = require('bcryptjs');
const sequelize = require('./config/database');
const Usuario = require('./models/Usuario');

async function crearUsuario() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    const username = 'admin';
    const password = '123456';
    const nombre = 'Administrador';

    const passwordHash = await bcrypt.hash(password, 10);

    let usuario = await Usuario.findOne({ where: { username } });
    if (usuario) {
      console.log('El usuario ya existe:', username);
      process.exit();
    }

    usuario = await Usuario.create({ username, passwordHash, nombre });
    console.log('Usuario creado:', usuario.username);
    process.exit();
  } catch (error) {
    console.error('Error creando usuario:', error);
    process.exit(1);
  }
}

crearUsuario();
