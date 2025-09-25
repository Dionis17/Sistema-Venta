import React, { useState, useEffect } from "react";
import axios from "axios";

export default function CuadreCajaResumen() {
  const [registros, setRegistros] = useState([]);
  const [resumen, setResumen] = useState({
    vendido: 0,
    beneficio: 0,
    diferencia: 0,
  });
  const [periodo, setPeriodo] = useState("semanal");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRegistros = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = `http://localhost:5000/api/cuadres?periodo=${periodo}`;
        if (periodo === "personalizado" && fechaInicio && fechaFin) {
          url += `&inicio=${fechaInicio}&fin=${fechaFin}`;
        }
        const res = await axios.get(url);
        setRegistros(res.data.registros || []);
        setResumen(res.data.resumen || { vendido: 0, beneficio: 0, diferencia: 0 });
      } catch (err) {
        console.error(err);
        setError("Error al cargar los registros");
        setRegistros([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRegistros();
  }, [periodo, fechaInicio, fechaFin]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 text-gray-800 font-sans p-6 md:p-8">
      <div className="bg-white shadow-xl rounded-lg w-full mx-auto flex flex-col p-6 flex-grow">

        {/* Encabezado */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">
            Resumen de Cuadre de Caja
          </h2>

          <div className="flex flex-col md:flex-row gap-4">
            <label className="flex flex-col text-sm font-medium text-gray-700">
              Seleccione Periodo:
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="border p-2 md:p-3 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-blue-700"
              >
                <option value="semanal">Semanal</option>
                <option value="mensual">Mensual</option>
                <option value="anual">Anual</option>
                <option value="personalizado">Personalizado</option>
              </select>
            </label>

            {periodo === "personalizado" && (
              <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
                <span className="hidden sm:inline">al</span>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
              </div>
            )}
          </div>
        </div>

        {/* Cards resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-5 rounded-lg shadow bg-green-800 text-white">
            <h3 className="font-semibold text-lg">Vendido (Sistema)</h3>
            <p className="text-2xl font-bold">${resumen.vendido.toFixed(2)}</p>
          </div>
          <div className="p-5 rounded-lg shadow bg-blue-800 text-white">
            <h3 className="font-semibold text-lg">Beneficio</h3>
            <p className="text-2xl font-bold">${resumen.beneficio.toFixed(2)}</p>
          </div>
          <div className="p-5 rounded-lg shadow bg-red-800 text-white">
            <h3 className="font-semibold text-lg">Diferencia</h3>
            <p className="text-2xl font-bold">
              {resumen.diferencia >= 0 ? "+" : ""}
              {resumen.diferencia.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Tabla de registros */}
        <div className="flex-grow overflow-y-auto border border-gray-200 rounded-lg">
          {loading ? (
            <div className="flex justify-center items-center h-full p-10">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-700 border-t-transparent"></div>
              <p className="ml-4 text-gray-600 text-lg">Cargando registros...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative m-4">
              <span>{error}</span>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="min-w-full table-auto divide-y divide-gray-300 text-sm md:text-base">
                <thead className="bg-gray-200 text-gray-700 sticky top-0 z-10">
                  <tr>
                    <th className="p-3 text-left font-semibold uppercase">Fecha / Hora</th>
                    <th className="p-3 text-left font-semibold uppercase">Usuario Venta</th>
                    <th className="p-3 text-left font-semibold uppercase">Usuario Cuadre</th>
                    <th className="p-3 text-left font-semibold uppercase">Fijo en Caja</th>
                    <th className="p-3 text-left font-semibold uppercase">Efectivo (Contado)</th>
                    <th className="p-3 text-left font-semibold uppercase">Observaciones</th>
                    <th className="p-3 text-left font-semibold uppercase">Diferencia</th>
                    <th className="p-3 text-left font-semibold uppercase">Estado</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {registros.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-4 text-center text-gray-500 italic">
                        No hay registros.
                      </td>
                    </tr>
                  ) : (
                    registros.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="p-3">{new Date(r.fechaHora).toLocaleString()}</td>
                        <td className="p-3">{r.usuarioVenta}</td>
                        <td className="p-3">{r.usuarioCuadre}</td>
                        <td className="p-3">${(r.fijo ?? 0).toFixed(2)}</td>
                        <td className="p-3">${(r.efectivoFisico ?? 0).toFixed(2)}</td>
                        <td className="p-3">{r.observaciones || "-"}</td>
                        <td className={`p-3 font-bold ${r.diferencia < 0 ? "text-red-600" : "text-green-600"}`}>
                          ${(r.diferencia ?? 0).toFixed(2)}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-white ${r.estado === 'pendiente' ? 'bg-yellow-600' : 'bg-green-600'}`}>
                            {r.estado}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
