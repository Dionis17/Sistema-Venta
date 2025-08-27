// POST /api/creditos/:id/abono
router.post('/:id/abono', async (req, res) => {
  const { monto } = req.body;
  const creditoId = req.params.id;

  if (!monto || monto <= 0) {
    return res.status(400).json({ message: 'Monto inválido' });
  }

  try {
    const credito = await Credito.findByPk(creditoId);
    if (!credito) return res.status(404).json({ message: 'Crédito no encontrado' });

    const nuevoMontoPagado = credito.monto_pagado + monto;
    const nuevoMontoRestante = Math.max(credito.monto_inicial - nuevoMontoPagado, 0);
    const nuevoEstado = nuevoMontoRestante <= 0 ? 'pagado' : 'pendiente';

    await credito.update({
      monto_pagado: nuevoMontoPagado,
      monto_restante: nuevoMontoRestante,
      estado: nuevoEstado,
    });

    const AbonoCredito = require('../models/AbonoCredito'); // importa el modelo
    await AbonoCredito.create({
      credito_id: credito.id,
      monto,
    });

    res.json({ message: 'Abono registrado', nuevoMontoRestante });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al registrar abono' });
  }
});
