module.exports = (sequelize, DataTypes) => {
  const AbonoCredito = sequelize.define("AbonoCredito", {
    credito_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    monto: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    fecha: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });

  AbonoCredito.associate = (models) => {
    AbonoCredito.belongsTo(models.Credito, { foreignKey: "credito_id" });
  };

  return AbonoCredito;
};
