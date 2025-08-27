import React, { useEffect, useState } from 'react';

function Creditos() {
  const [creditos, setCreditos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoCreditoCliente, setNuevoCreditoCliente] = useState(null);
  const [montoNuevoCredito, setMontoNuevoCredito] = useState('');
  const [fechaNuevoCredito, setFechaNuevoCredito] = useState('');
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    obtenerCreditos();
    obtenerClientes();
  }, []);

  const obtenerCreditos = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/creditos');
      const data = await response.json();
      setCreditos(data);
    } catch (error) {
      console.error('Error al cargar créditos:', error);
    }
  };

  const obtenerClientes = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/clientes');
      const data = await response.json();
      setClientes(data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    }
  };

  const abrirFormulario = (cliente = null) => {
    setNuevoCreditoCliente(cliente);
    setMontoNuevoCredito('');
    setFechaNuevoCredito(new Date().toISOString().slice(0, 10));
    setMostrarFormulario(true);
    setMensaje(null);
  };

  const guardarNuevoCredito = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/creditos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteId: nuevoCreditoCliente?.id || null,
          fechaInicio: fechaNuevoCredito,
          monto: parseFloat(montoNuevoCredito),
        }),
      });

      if (response.ok) {
        setMensaje('Crédito guardado exitosamente');
        setMostrarFormulario(false);
        obtenerCreditos();
      } else {
        setMensaje('Error al guardar crédito');
      }
    } catch (error) {
      console.error('Error:', error);
      setMensaje('Error de red al guardar crédito');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Créditos</h1>

      {/* Botón Nuevo Crédito (sin cliente) */}
      <div className="flex justify-end mb-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => abrirFormulario()}
        >
          Nuevo Crédito
        </button>
      </div>

      {/* Tabla de créditos */}
      <table className="w-full table-auto ">
        <thead className="bg-blue-100 text-blue-900" >
          <tr>
            <th className="border px-4 py-2">Cliente</th>
            <th className="border px-4 py-2">Monto</th>
            <th className="border px-4 py-2">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {creditos.map((credito, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="border px-4 py-2">{credito.nombre_cliente || 'N/A'}</td>
              <td className="border px-4 py-2">${credito.monto.toFixed(2)}</td>
              <td className="border px-4 py-2">{credito.fecha_inicio}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal formulario nuevo crédito */}
      {mostrarFormulario && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h2 className="text-xl font-bold mb-4">
              {nuevoCreditoCliente
                ? `Abrir Crédito para ${nuevoCreditoCliente.nombre}`
                : 'Abrir Crédito'}
            </h2>

            {/* Si no hay cliente seleccionado, muestra un campo para escribir nombre */}
            {!nuevoCreditoCliente && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Nombre del cliente (opcional)</label>
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Ej: Cliente sin registrar"
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Monto</label>
              <input
                type="number"
                className="w-full border px-3 py-2 rounded"
                value={montoNuevoCredito}
                onChange={(e) => setMontoNuevoCredito(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Fecha</label>
              <input
                type="date"
                className="w-full border px-3 py-2 rounded"
                value={fechaNuevoCredito}
                onChange={(e) => setFechaNuevoCredito(e.target.value)}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                onClick={() => setMostrarFormulario(false)}
              >
                Cancelar
              </button>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={guardarNuevoCredito}
              >
                Guardar
              </button>
            </div>

            {mensaje && (
              <div className="mt-4 text-sm text-center text-red-600">{mensaje}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Creditos;
