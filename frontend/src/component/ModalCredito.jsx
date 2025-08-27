import React, { useEffect, useState } from "react";

export default function ModalCreditos({
  visible,
  onClose,
  onSeleccionarCredito,
  productosSeleccionados = [], // Array de productos { id, nombre, precio, cantidad }
}) {
  const [creditos, setCreditos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [vista, setVista] = useState("creditos");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      obtenerCreditos();
      obtenerClientes();
      setVista("creditos");
    }
  }, [visible]);

  const obtenerCreditos = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/creditos");
      if (!res.ok) throw new Error("Error al obtener créditos");
      const data = await res.json();
      setCreditos(data);
    } catch (error) {
      console.error("Error al cargar créditos:", error);
    } finally {
      setLoading(false);
    }
  };

  const obtenerClientes = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/clientes");
      if (!res.ok) throw new Error("Error al obtener clientes");
      const data = await res.json();
      setClientes(data);
    } catch (error) {
      console.error("Error al cargar clientes:", error);
    }
  };

  const manejarCrearCredito = async (clienteId) => {
    try {
      // Verificamos si ya existe un crédito pendiente para el cliente
      const creditoExistente = creditos.find(
        (c) => c.cliente_id === clienteId && c.estado === "pendiente"
      );
      if (creditoExistente) {
        alert("Este cliente ya tiene un crédito abierto.");
        return;
      }

      // Crear crédito con monto inicial 0 o el que quieras
      const response = await fetch("http://localhost:5000/api/creditos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente_id: clienteId,
          monto_inicial: 0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear crédito");
      }

      // Actualizamos la lista de créditos
      await obtenerCreditos();

      alert("Crédito creado correctamente para el cliente.");
    } catch (error) {
      alert("No se pudo crear el crédito. " + error.message);
    }
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-titulo"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-auto bg-white rounded-xl shadow-lg p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-red-500 transition"
          aria-label="Cerrar modal"
          disabled={loading}
          type="button"
        >
          <span className="text-2xl font-bold">&times;</span>
        </button>

        <h2
          id="modal-titulo"
          className="text-2xl font-semibold mb-6 text-gray-800 text-center"
        >
          {vista === "creditos" ? "Créditos" : "Clientes"}
        </h2>

        {vista === "creditos" && (
          <div className="overflow-x-auto">
            {loading ? (
              <p className="text-center text-gray-500 py-4">
                Cargando créditos...
              </p>
            ) : (
              <table className="w-full border text-sm rounded-md shadow-sm">
                <thead className="bg-blue-100 text-blue-900 rounded-t-md">
                  <tr>
                    <th className="border-b border-gray-300 px-5 py-3 text-left">
                      Cliente
                    </th>
                    <th className="border-b border-gray-300 px-5 py-3 text-left">
                      Inicial
                    </th>
                    <th className="border-b border-gray-300 px-5 py-3 text-left">
                      Pagado
                    </th>
                    <th className="border-b border-gray-300 px-5 py-3 text-left">
                      Restante
                    </th>
                    <th className="border-b border-gray-300 px-5 py-3 text-left">
                      Fecha
                    </th>
                    <th className="border-b border-gray-300 px-5 py-3 text-left">
                      Estado
                    </th>
                    <th className="border-b border-gray-300 px-5 py-3 text-right">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {creditos.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="text-center py-4 text-gray-500"
                      >
                        No hay cuentas abiertas.
                      </td>
                    </tr>
                  ) : (
                    creditos.map((credito) => (
                      <tr
                        key={credito.id}
                        className="hover:bg-gray-100 transition-colors"
                      >
                        <td className="border-b border-gray-200 px-5 py-3">
                          {credito.cliente?.nombre || "N/A"}
                        </td>
                        <td className="border-b border-gray-200 px-5 py-3">
                          ${parseFloat(credito.monto_inicial).toFixed(2)}
                        </td>
                        <td className="border-b border-gray-200 px-5 py-3">
                          ${parseFloat(credito.monto_pagado).toFixed(2)}
                        </td>
                        <td className="border-b border-gray-200 px-5 py-3">
                          ${parseFloat(credito.monto_restante).toFixed(2)}
                        </td>
                        <td className="border-b border-gray-200 px-5 py-3">
                          {new Date(credito.fecha).toLocaleDateString()}
                        </td>
                        <td className="border-b border-gray-200 px-5 py-3 capitalize">
                          {credito.estado || "pendiente"}
                        </td>
                        <td className="border-b border-gray-200 px-5 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              if (!loading && onSeleccionarCredito) {
                                onSeleccionarCredito(credito);
                                onClose();
                              }
                            }}
                            className={`${
                              credito.estado !== "pendiente"
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700"
                            } text-white px-3 py-1 rounded transition`}
                            disabled={loading || credito.estado !== "pendiente"}
                          >
                            Agregar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}

        {vista === "clientes" && (
          <div className="overflow-x-auto">
            {loading ? (
              <p className="text-center text-gray-500 py-4">
                Cargando clientes...
              </p>
            ) : (
              <table className="w-full border text-sm rounded-md shadow-sm">
                <thead className="bg-blue-100 text-blue-900 rounded-t-md">
                  <tr>
                    <th className="border-b border-gray-300 px-5 py-3">ID</th>
                    <th className="border-b border-gray-300 px-5 py-3">Nombre</th>
                    <th className="border-b border-gray-300 px-5 py-3">Tel</th>
                    <th className="border-b border-gray-300 px-5 py-3">Email</th>
                    <th className="border-b border-gray-300 px-5 py-3">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center py-4 text-gray-500"
                      >
                        No hay clientes registrados.
                      </td>
                    </tr>
                  ) : (
                    clientes.map((cliente) => (
                      <tr key={cliente.id} className="hover:bg-gray-50 transition-colors">
                        <td className="border-b border-gray-200 px-5 py-3">{cliente.id}</td>
                        <td className="border-b border-gray-200 px-5 py-3">{cliente.nombre}</td>
                        <td className="border-b border-gray-200 px-5 py-3">
                          {cliente.telefono || "-"}
                        </td>
                        <td className="border-b border-gray-200 px-5 py-3">
                          {cliente.email || "-"}
                        </td>
                        <td className="border-b border-gray-200 px-5 py-3">
                          <button
                            type="button"
                            onClick={() => manejarCrearCredito(cliente.id)}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition"
                          >
                            Crear
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={() =>
              setVista(vista === "creditos" ? "clientes" : "creditos")
            }
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md transition"
          >
            {vista === "creditos" ? "Clientes" : "Créditos"}
          </button>
        </div>
      </div>
    </div>
  );
}
