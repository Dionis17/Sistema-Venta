const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Proveedor = require("./proveedor");

const Producto = sequelize.define("Producto", {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: true }
    // Ojo: quitamos unique: true aquí para usar índice compuesto abajo
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
  precio_especial: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: null,
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
  imagen_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  fecha_entrada: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  proveedor_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'proveedores',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'NO ACTION',
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
  tableName: "productos",
  timestamps: true,

  indexes: [
    {
      unique: true,
      fields: ['nombre', 'proveedor_id']  // Índice único compuesto
    }
  ]
});

// Asociaciones
Producto.belongsTo(Proveedor, { foreignKey: 'proveedor_id', as: 'proveedor' });
Proveedor.hasMany(Producto, { foreignKey: 'proveedor_id', as: 'productos' });

// Normalizar nombre antes de guardar
Producto.beforeCreate((producto) => {
  producto.nombre = producto.nombre.trim().toLowerCase();
});
Producto.beforeUpdate((producto) => {
  producto.nombre = producto.nombre.trim().toLowerCase();
});

module.exports = Producto;
