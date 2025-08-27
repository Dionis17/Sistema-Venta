import React, { useState, useEffect } from "react";
import axios from "axios";

export default function CuadreCaja({ usuario }) {
  const [form, setForm] = useState({
    fijo: "",
    efectivo: "",
    observaciones: "",
  });
  const [mensaje, setMensaje] = useState(null);
  const [facturas, setFacturas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);

  useEffect(() => {
    const fetchVentas = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await axios.get("http://localhost:5000/api/ventas");
        setFacturas(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
        setError("Error al cargar ventas");
        setFacturas([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVentas();
  }, []);

  const calcularTotalFactura = (factura) => {
    if (!factura.detalles) return 0;
    return factura.detalles.reduce(
      (total, det) => total + det.cantidad * det.precioUnitario,
      0
    );
  };
  const totalVentas = facturas
    .filter((f) => f.estadoVenta !== "Anulada") // solo sumamos las que no están anuladas
    .reduce((acc, factura) => acc + calcularTotalFactura(factura), 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (
      (name === "fijo" || name === "efectivo") &&
      value &&
      !/^\d*\.?\d*$/.test(value)
    ) {
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.fijo || !form.efectivo) {
      setMensaje({ tipo: "error", texto: "Fijo y efectivo son obligatorios." });
      return;
    }
    setMensaje({ tipo: "exito", texto: "Cuadre registrado correctamente." });
  };

  const verFactura = (factura) => {
    setFacturaSeleccionada(factura);
  };

  const anularFactura = async (factura) => {
    const confirmar = window.confirm(
      `¿Desea anular la factura #${factura.id}?`
    );
    if (!confirmar) return;

    try {
      const res = await axios.post(
        `http://localhost:5000/api/ventas/anular/${factura.id}`
      );

      if (res.status === 200) {
        setMensaje({
          tipo: "exito",
          texto: `Factura #${factura.id} anulada correctamente.`,
        });

        // Solo actualizamos estadoVenta a "Anulada"
        setFacturas((prev) =>
          prev.map((f) =>
            f.id === factura.id ? { ...f, estadoVenta: "Anulada" } : f
          )
        );
      } else {
        setMensaje({ tipo: "error", texto: `No se pudo anular la factura.` });
      }
    } catch (error) {
      console.error(error);
      setMensaje({ tipo: "error", texto: "Error al anular la factura." });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800 font-sans p-6 md:p-8">
      <div className="bg-white shadow-lg rounded-lg w-full mx-auto flex flex-col p-6 flex-grow">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">
            Cuadre de Caja
          </h2>
          <span className="text-2xl font-bold text-gray-900">
            <span className="text-gray-600 mr-2">Vendido:</span>
            <span className="text-green-600">${totalVentas.toFixed(2)}</span>
          </span>
        </div>

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200"
        >
          <label className="flex flex-col text-gray-900 font-semibold">
            Fijo en caja *
            <input
              name="fijo"
              value={form.fijo}
              onChange={handleChange}
              placeholder="Monto fijo en caja"
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </label>

          <label className="flex flex-col text-gray-900 font-semibold">
            Efectivo *
            <input
              name="efectivo"
              value={form.efectivo}
              onChange={handleChange}
              placeholder="Monto efectivo actual"
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </label>

          <label className="flex flex-col text-gray-900 font-semibold md:col-span-2">
            Observaciones
            <textarea
              name="observaciones"
              value={form.observaciones}
              onChange={handleChange}
              placeholder="Notas adicionales"
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={1}
            />
          </label>

          <div className="md:col-span-4 flex justify-end gap-4 mt-4">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition"
            >
              Registrar Cuadre
            </button>
          </div>
        </form>

        {/* Mensaje */}
        {mensaje && (
          <div
            className={`mb-4 p-3 rounded text-white ${
              mensaje.tipo === "exito" ? "bg-blue-600" : "bg-red-600"
            }`}
            role="alert"
          >
            {mensaje.texto}
          </div>
        )}

        {/* Tabla de facturas */}
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Facturas Realizadas
        </h3>
        {isLoading ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <span className="ml-4 text-gray-600">Cargando facturas...</span>
          </div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="border border-gray-200 rounded-lg">
            <div className="max-h-[420px] overflow-y-auto">
              <table className="table-auto w-full divide-y divide-gray-200">
                <thead className="bg-blue-50 text-blue-800 sticky top-0 z-10">
                  <tr>
                    <th className="p-3 text-left text-xs md:text-sm font-semibold">
                      N° Factura
                    </th>
                    <th className="p-3 text-left text-xs md:text-sm font-semibold">
                      Fecha
                    </th>
                    <th className="p-3 text-left text-xs md:text-sm font-semibold">
                      Monto Total
                    </th>
                    <th className="p-3 text-left text-xs md:text-sm font-semibold">
                      Estado
                    </th>
                    <th className="p-3 text-left text-xs md:text-sm font-semibold">
                      Método de Pago
                    </th>
                    <th className="p-3 text-right text-xs md:text-sm font-semibold">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {facturas.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="p-4 text-center text-gray-500 italic"
                      >
                        No hay facturas registradas.
                      </td>
                    </tr>
                  ) : (
                    facturas.map((factura) => (
                      <tr key={factura.id} className="hover:bg-blue-50">
                        <td className="p-2 border">{factura.id}</td>
                        <td className="p-2 border">
                          {new Date(factura.fecha).toLocaleDateString()}
                        </td>
                        <td className="p-2 border">
                          ${calcularTotalFactura(factura).toFixed(2)}
                        </td>
                        <td className="p-2 border">
                          {factura.estadoVenta || "Pago"}
                        </td>
                        <td className="p-2 border">
                          {factura.tipoPago || "N/A"}
                        </td>
                        <td className="p-2 border text-right space-x-2">
                          <button
                            onClick={() => verFactura(factura)}
                            className="text-indigo-600 hover:underline"
                          >
                            Ver
                          </button>
                          <button
                            onClick={() => anularFactura(factura)}
                            className={`text-red-600 hover:underline ${
                              factura.estadoVenta === "Anulada"
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                            disabled={factura.estadoVenta === "Anulada"}
                          >
                            Anular
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal de detalles de factura */}
        {facturaSeleccionada && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 md:w-2/3 max-h-[80vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">
                Factura #{facturaSeleccionada.id}
              </h3>
              <p className="mb-2">
                Fecha:{" "}
                {new Date(facturaSeleccionada.fecha).toLocaleDateString()}
              </p>
              <p className="mb-4">
                Cliente: {facturaSeleccionada.cliente?.nombre || "N/A"}
              </p>

              <table className="w-full border-collapse mb-4">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Producto</th>
                    <th className="border p-2 text-left">Cantidad</th>
                    <th className="border p-2 text-left">Precio Unit.</th>
                    <th className="border p-2 text-left">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {facturaSeleccionada.detalles.map((item, idx) => (
                    <tr key={idx}>
                      <td className="border p-2">
                        {item.nombre ||
                          item.producto?.nombre ||
                          "Producto desconocido"}
                      </td>
                      <td className="border p-2">{item.cantidad}</td>
                      <td className="border p-2">
                        ${item.precioUnitario.toFixed(2)}
                      </td>
                      <td className="border p-2">
                        ${(item.cantidad * item.precioUnitario).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="text-right font-bold text-lg">
                Total: ${calcularTotalFactura(facturaSeleccionada).toFixed(2)}
              </div>

              <div className="mt-4 text-right">
                <button
                  onClick={() => setFacturaSeleccionada(null)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
