const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Producto = sequelize.define('Producto', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  precio_compra: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  precio_venta: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: { min: 0 }
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 }
  },
  stock_minimo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5,
    validate: { min: 0 }
  },
  proveedor: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Desconocido',
    validate: { notEmpty: true }
  },
  imagen_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  fecha_entrada: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  ganancia_unitaria: {
    type: DataTypes.VIRTUAL,
    get() {
      const venta = parseFloat(this.precio_venta || 0);
      const compra = parseFloat(this.precio_compra || 0);
      return venta - compra;
    }
  }
}, {
  tableName: 'productos',
  timestamps: true
});

// Normalizar nombre en minúscula
Producto.beforeCreate((producto) => {
  producto.nombre = producto.nombre.trim().toLowerCase();
});

Producto.beforeUpdate((producto) => {
  producto.nombre = producto.nombre.trim().toLowerCase();
});

module.exports = Producto;
