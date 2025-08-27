const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Cliente = require('./Cliente');

const Credito = sequelize.define('Credito', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cliente_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Cliente,
      key: 'id',
    },
  },
  monto_inicial: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  monto_pagado: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  monto_restante: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  estado: {
    type: DataTypes.STRING,
    defaultValue: 'pendiente',
  },
  fecha: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'Credito',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_actualizacion',
});

Credito.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });

module.exports = Credito;
