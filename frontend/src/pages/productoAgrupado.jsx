import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_PRODUCTOS = "http://localhost:5000/api/productos";
const IMG_BASE_URL = "http://localhost:5000";

export default function InventarioVisual() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(API_PRODUCTOS);
      if (!res.ok) {
        throw new Error("Error al obtener los productos.");
      }
      const data = await res.json();
      const lista = data.productos || data;

      const agrupados = Object.values(
        lista.reduce((acc, prod) => {
          if (!acc[prod.nombre]) {
            acc[prod.nombre] = { ...prod, stock: Number(prod.stock) || 0 };
          } else {
            acc[prod.nombre].stock += Number(prod.stock) || 0;
          }
          return acc;
        }, {})
      );

      setProductos(agrupados);
    } catch (err) {
      console.error("Error cargando productos:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800 font-sans p-6 md:p-8">
      <div className="bg-white shadow-lg rounded-lg w-full mx-auto flex flex-col p-6 flex-grow">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">
            Inventario Visual
          </h2>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
            <button
              onClick={() => navigate("/productos")}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Ir a Inventario
            </button>
            <button
              onClick={() => navigate("/entrada")}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Dar Entrada
            </button>
          </div>
        </div>

        <input
          type="text"
          placeholder="Buscar producto por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border border-gray-300 p-3 rounded-lg w-full mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center flex-grow">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="ml-4 text-lg text-gray-600">Cargando productos...</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg flex-grow">
            <table className="divide-y divide-gray-200 table-fixed w-full">
              <thead className="bg-blue-50 text-blue-800 sticky top-0 z-10">
                <tr>
                  <th className="p-3 border-r border-gray-200 text-left text-xs md:text-sm font-semibold uppercase w-1/6">
                    Imagen
                  </th>
                  <th className="p-3 border-r border-gray-200 text-left text-xs md:text-sm font-semibold uppercase w-2/6">
                    Nombre
                  </th>
                  <th className="p-3 border-r border-gray-200 text-left text-xs md:text-sm font-semibold uppercase w-1/6">
                    Precio Compra
                  </th>
                  <th className="p-3 border-r border-gray-200 text-left text-xs md:text-sm font-semibold uppercase w-1/6">
                    Precio Venta
                  </th>
                  <th className="p-3 border-r border-gray-200 text-left text-xs md:text-sm font-semibold uppercase w-1/6">
                    Stock Total
                  </th>
                  <th className="p-3 text-left text-xs md:text-sm font-semibold uppercase w-1/6">
                    Stock Mínimo
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-4 text-center text-gray-500 italic text-sm md:text-lg">
                      No se encontraron productos.
                    </td>
                  </tr>
                ) : (
                  productosFiltrados.map((p) => (
                    <tr key={p.id} className="hover:bg-blue-50 transition-colors duration-150">
                      <td className="p-2 border-r border-gray-200 w-1/6">
                        {p.imagen_url ? (
                          <img
                            src={`${IMG_BASE_URL}${p.imagen_url}`}
                            alt={p.nombre}
                            className="w-16 h-16 object-cover rounded-md shadow-sm"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded-md text-gray-400 text-xs italic text-center">
                            Sin imagen
                          </div>
                        )}
                      </td>
                      <td className="p-3 border-r border-gray-200 font-medium text-gray-700 w-2/6">{p.nombre}</td>
                      <td className="p-3 border-r border-gray-200 text-gray-600 w-1/6">${p.precio_compra}</td>
                      <td className="p-3 border-r border-gray-200 text-gray-600 w-1/6">${p.precio_venta}</td>
                      <td className="p-3 border-r border-gray-200 text-center font-bold text-lg w-1/6">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-white ${
                            p.stock <= p.stock_minimo ? "bg-red-500" : "bg-blue-500"
                          }`}
                        >
                          {p.stock}
                        </span>
                      </td>
                      <td className="p-3 text-gray-600 w-1/6">{p.stock_minimo}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}