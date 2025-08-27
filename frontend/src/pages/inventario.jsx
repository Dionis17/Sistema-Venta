import React, { useState, useEffect } from "react";

function ListadoInventarioAgregar({
  cuentaId,
  onAgregar,
  onCerrar,
  carritoActual = [],
}) {
  const [productos, setProductos] = useState([]); // productos agrupados
  const [cantidades, setCantidades] = useState({});
  const [busqueda, setBusqueda] = useState("");
  const [mensajeError, setMensajeError] = useState(null);
  const [tipoPrecio, setTipoPrecio] = useState("precio_venta");
  const [modalVariantes, setModalVariantes] = useState(null);

  const API_PRODUCTOS = "http://localhost:5000/api/productos";
  const API_AGREGAR = "http://localhost:5000/api/cuentas/agregar-producto";
  const IMG_URL = "http://localhost:5000";

  useEffect(() => {
    cargarProductos();
  }, [carritoActual]);

  useEffect(() => {
    if (mensajeError) {
      const timer = setTimeout(() => setMensajeError(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [mensajeError]);

  async function cargarProductos() {
    try {
      const res = await fetch(API_PRODUCTOS);
      if (!res.ok) throw new Error("Error cargando productos");
      const data = await res.json();

      // Agrupar productos por nombre
      const agrupados = {};
      data.forEach((prod) => {
        if (!agrupados[prod.nombre]) {
          agrupados[prod.nombre] = {
            nombre: prod.nombre,
            variantes: [],
            stockTotal: 0,
          };
        }
        agrupados[prod.nombre].variantes.push(prod);
        agrupados[prod.nombre].stockTotal += prod.stock;
      });

      // Ajustar stock según carrito actual
      carritoActual.forEach((item) => {
        if (agrupados[item.nombre]) {
          agrupados[item.nombre].stockTotal -= item.cantidad;
          agrupados[item.nombre].variantes.forEach((v) => {
            if (v.id === item.id) v.stock -= item.cantidad;
          });
        }
      });

      const productosAgrupados = Object.values(agrupados);
      setProductos(productosAgrupados);
    } catch (error) {
      console.error(error);
      setMensajeError("Error al cargar productos. Intente más tarde.");
    }
  }

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const manejarCantidadChange = (nombre, valor) => {
    let cant = parseInt(valor);
    if (isNaN(cant) || cant < 1) cant = 1;
    const producto = productos.find((p) => p.nombre === nombre);
    if (producto && cant > producto.stockTotal) cant = producto.stockTotal;
    setCantidades((prev) => ({ ...prev, [nombre]: cant }));
  };

  const agregarProductoConVariantes = async (
    productoAgrupado,
    cantidadSolicitada
  ) => {
    if (cantidadSolicitada <= 0) {
      setMensajeError("La cantidad debe ser mayor a 0.");
      return;
    }

    let cantidadRestante = cantidadSolicitada;
    let productosAgregados = [];

    for (const variante of productoAgrupado.variantes) {
      if (cantidadRestante <= 0) break;
      if (variante.stock <= 0) continue;

      const cantidadAAgregar = Math.min(variante.stock, cantidadRestante);

      // Guardar en cuenta si corresponde
      if (cuentaId) {
        try {
          const res = await fetch(API_AGREGAR, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              cuentaId,
              productoId: variante.id,
              cantidad: cantidadAAgregar,
              precio: variante[tipoPrecio] || variante.precio_venta,
            }),
          });
          const data = await res.json();

          if (!res.ok) {
            setMensajeError(data.error || "Error al agregar el producto.");
            return;
          }
        } catch (error) {
          console.error(error);
          setMensajeError("Error de conexión con el servidor.");
          return;
        }
      }

      // Normalizar objeto para el carrito
      productosAgregados.push({
        id: variante.id,
        nombre: productoAgrupado.nombre || "Producto sin nombre",
        variante:
        variante.nombre !== productoAgrupado.nombre ? variante.nombre : "",
        cantidad: cantidadAAgregar,
        precio: parseFloat(variante[tipoPrecio] || variante.precio_venta || 0),
      });

      cantidadRestante -= cantidadAAgregar;
    }

    if (cantidadRestante > 0) {
      setMensajeError("No hay suficiente stock en las variantes disponibles.");
      return;
    }

    // ⚡ Pasar cada producto individualmente al carrito
    productosAgregados.forEach((prod) => onAgregar(prod));

    cargarProductos();
    setMensajeError(null);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-productos"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
        <header className="flex justify-between items-center">
          <h2
            id="titulo-modal-productos"
            className="text-2xl font-bold text-gray-800"
          >
            Seleccionar Productos
          </h2>
          <button
            onClick={onCerrar}
            aria-label="Cerrar modal"
            className="text-gray-600 hover:text-red-500 font-semibold transition"
            type="button"
          >
            ✕ Cerrar
          </button>
        </header>

        <div className="flex items-center gap-4">
          <input
            type="search"
            placeholder="🔍 Buscar producto por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar productos"
            autoFocus
            className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            aria-label="Seleccionar tipo de precio"
            value={tipoPrecio}
            onChange={(e) => setTipoPrecio(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="precio_venta">Precio Venta</option>
            <option value="precio_especial">Precio Especial</option>
          </select>
        </div>

        {mensajeError && (
          <div className="p-2 bg-red-100 text-red-700 rounded text-center font-semibold">
            {mensajeError}
          </div>
        )}

        {productosFiltrados.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">
            No se encontraron productos.
          </p>
        ) : (
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full table-auto border-collapse text-center">
              <thead className="bg-gray-100 text-gray-700 text-sm sticky top-0 z-10">
                <tr>
                  <th className="p-3 border-b">Imagen</th>
                  <th className="p-3 border-b">Nombre</th>
                  <th className="p-3 border-b">Precio</th>
                  <th className="p-3 border-b">Stock Total</th>
                  <th className="p-3 border-b">Cantidad</th>
                  <th className="p-3 border-b">Subtotal</th>
                  <th className="p-3 border-b">Acción</th>
                  <th className="p-3 border-b">Detalles</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.map((prodAgrupado) => {
                  const { nombre, variantes, stockTotal } = prodAgrupado;
                  const cantidad = cantidades[nombre] || 1;

                  const varianteDisponible =
                    variantes.find((v) => v.stock > 0) || variantes[0];

                  const precioMostrar =
                    varianteDisponible[tipoPrecio] !== null &&
                    varianteDisponible[tipoPrecio] !== undefined
                      ? varianteDisponible[tipoPrecio]
                      : varianteDisponible.precio_venta;

                  const subtotal = (precioMostrar * cantidad).toFixed(2);
                  const sinStock = stockTotal <= 0;

                  return (
                    <tr key={nombre} className="hover:bg-gray-50">
                      <td className="p-2 border-b">
                        {varianteDisponible.imagen_url ? (
                          <img
                            src={`${IMG_URL}${varianteDisponible.imagen_url}`}
                            alt={nombre}
                            className="w-16 h-16 object-cover rounded shadow"
                          />
                        ) : (
                          <span className="text-gray-400 italic">
                            Sin imagen
                          </span>
                        )}
                      </td>
                      <td className="p-3 border-b font-semibold">{nombre}</td>
                      <td className="p-3 border-b text-green-700 font-medium">
                        ${parseFloat(precioMostrar).toFixed(2)}
                      </td>
                      <td className="p-3 border-b">{stockTotal}</td>
                      <td className="p-3 border-b">
                        <input
                          type="number"
                          min="1"
                          max={stockTotal}
                          value={cantidad}
                          disabled={sinStock}
                          onChange={(e) =>
                            manejarCantidadChange(nombre, e.target.value)
                          }
                          aria-label={`Cantidad para ${nombre}`}
                          className="w-20 p-1.5 border rounded text-center"
                        />
                      </td>
                      <td className="p-3 border-b text-blue-700 font-semibold">
                        ${subtotal}
                      </td>
                      <td className="p-3 border-b">
                        <button
                          type="button"
                          disabled={sinStock}
                          aria-disabled={sinStock}
                          aria-label={`Agregar ${nombre}`}
                          onClick={() =>
                            agregarProductoConVariantes(prodAgrupado, cantidad)
                          }
                          className={`px-4 py-1 rounded text-sm text-white transition ${
                            sinStock
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-green-600 hover:bg-green-700"
                          }`}
                        >
                          {sinStock ? "Sin stock" : "Agregar"}
                        </button>
                      </td>
                      <td className="p-3 border-b">
                        <button
                          onClick={() => setModalVariantes(prodAgrupado)}
                          aria-label={`Ver detalles de variantes para ${nombre}`}
                          className="text-blue-600 underline hover:text-blue-800"
                          type="button"
                        >
                          Ver variantes
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal de variantes */}
        {modalVariantes && (
          <div
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-60 p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-variantes"
          >
            <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6 relative border border-gray-300">
              <h3
                id="titulo-modal-variantes"
                className="text-2xl font-semibold mb-6 text-gray-900"
              >
                Variantes de:{" "}
                <span className="text-blue-600">{modalVariantes.nombre}</span>
              </h3>
              <button
                onClick={() => setModalVariantes(null)}
                aria-label="Cerrar detalles variantes"
                className="absolute top-4 right-4 text-gray-600 hover:text-red-600 transition duration-200 text-2xl font-bold focus:outline-none"
                type="button"
              >
                ×
              </button>

              <table className="w-full table-auto border-collapse text-left">
                <thead className="bg-blue-50 text-blue-700 text-sm sticky top-0 z-10 border-b border-blue-200">
                  <tr>
                    <th className="p-3 border-r border-blue-200">Proveedor</th>
                    <th className="p-3 border-r border-blue-200">
                      Precio Venta
                    </th>
                    <th className="p-3 border-r border-blue-200">
                      Precio Especial
                    </th>
                    <th className="p-3 border-r border-blue-200">Stock</th>
                    <th className="p-3">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {modalVariantes.variantes.map((v) => (
                    <tr
                      key={v.id}
                      className={`${
                        v.stock === 0
                          ? "text-gray-400 italic bg-gray-50"
                          : "hover:bg-blue-50 transition-colors duration-200"
                      }`}
                    >
                      <td className="p-3 border-r border-blue-200 font-medium">
                        {v.proveedor?.nombre || "Sin proveedor"}
                      </td>
                      <td className="p-3 border-r border-blue-200">
                        ${parseFloat(v.precio_venta).toFixed(2)}
                      </td>
                      <td className="p-3 border-r border-blue-200">
                        {v.precio_especial !== null &&
                        v.precio_especial !== undefined
                          ? `$${parseFloat(v.precio_especial).toFixed(2)}`
                          : "-"}
                      </td>
                      <td className="p-3 border-r border-blue-200 font-semibold">
                        {v.stock}
                      </td>
                      <td className="p-3 font-semibold">
                        {v.stock > 0 ? (
                          <span className="text-green-600">Disponible</span>
                        ) : (
                          <span className="text-red-600">Sin stock</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ListadoInventarioAgregar;
