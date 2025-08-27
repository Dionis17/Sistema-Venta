const Proveedor = require("../models/proveedor");

exports.getAll = async (req, res) => {
  const proveedores = await Proveedor.findAll();
  res.json(proveedores);
};

exports.create = async (req, res) => {
  const nuevo = await Proveedor.create(req.body);
  res.json(nuevo);
};

exports.update = async (req, res) => {
  const { id } = req.params;
  await Proveedor.update(req.body, { where: { id } });
  res.json({ mensaje: "Proveedor actualizado" });
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  await Proveedor.destroy({ where: { id } });
  res.json({ mensaje: "Proveedor eliminado" });
};
