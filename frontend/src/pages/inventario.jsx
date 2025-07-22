import React, { useState, useEffect } from 'react';

function ListadoInventarioAgregar({ onAgregar, onCerrar, carritoActual = [] }) {
  const [productos, setProductos] = useState([]);
  const [cantidades, setCantidades] = useState({});
  const [busqueda, setBusqueda] = useState('');
  const [mensajeError, setMensajeError] = useState(null);

  const API_URL = 'http://localhost:5000/api/productos';
  const IMG_URL = 'http://localhost:5000';

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        const actualizados = Array.isArray(data) ? data.map(prod => {
          // Restar del stock lo que ya está en el carrito actual
          const enCarrito = carritoActual.find(c => c.id === prod.id);
          const stockRestante = enCarrito ? prod.stock - enCarrito.cantidad : prod.stock;
          return { ...prod, stock: stockRestante };
        }) : [];
        setProductos(actualizados);
      })
      .catch(err => {
        console.error('Error al cargar productos:', err);
        setMensajeError('Error cargando productos. Intente más tarde.');
      });
  }, [carritoActual]);

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleCantidadChange = (id, valor) => {
    let cantidad = parseInt(valor);
    if (isNaN(cantidad) || cantidad < 1) cantidad = 1;
    const producto = productos.find(p => p.id === id);
    if (producto && cantidad > producto.stock) cantidad = producto.stock;
    setCantidades(prev => ({ ...prev, [id]: cantidad }));
  };

  const agregarProducto = (producto) => {
    const cantidad = cantidades[producto.id] || 1;

    if (producto.stock === 0) {
      setMensajeError(`No hay stock disponible para "${producto.nombre}".`);
      return;
    }

    if (cantidad > producto.stock) {
      setMensajeError(`Stock insuficiente: solo ${producto.stock} unidades disponibles.`);
      return;
    }

    setMensajeError(null);
    onAgregar({ ...producto, cantidad });

    // Restar la cantidad agregada del stock visual
    setProductos(prev =>
      prev.map(p =>
        p.id === producto.id ? { ...p, stock: p.stock - cantidad } : p
      )
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-productos"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 id="titulo-modal-productos" className="text-2xl font-bold text-gray-800">Seleccionar Productos</h2>
          <button
            onClick={onCerrar}
            className="text-gray-600 hover:text-red-500 font-semibold transition"
            aria-label="Cerrar modal"
            type="button"
          >
            ✕ Cerrar
          </button>
        </div>

        <input
          type="text"
          placeholder="🔍 Buscar producto por nombre..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          aria-label="Buscar productos"
        />

        {mensajeError && (
          <div className="p-2 bg-red-100 text-red-700 rounded text-center font-semibold">
            {mensajeError}
          </div>
        )}

        {productosFiltrados.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">No se encontraron productos.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead className="bg-gray-100 text-gray-700 text-sm">
                <tr>
                  <th className="p-3 border-b">Imagen</th>
                  <th className="p-3 border-b">Nombre</th>
                  <th className="p-3 border-b">Precio</th>
                  <th className="p-3 border-b">Stock</th>
                  <th className="p-3 border-b">Cantidad</th>
                  <th className="p-3 border-b">Subtotal</th>
                  <th className="p-3 border-b">Acción</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {productosFiltrados.map((p) => {
                  const cantidad = cantidades[p.id] || 1;
                  const subtotal = (p.precio_venta * cantidad).toFixed(2);
                  const sinStock = p.stock === 0;

                  return (
                    <tr key={p.id} className="hover:bg-gray-50 text-center">
                      <td className="p-2 border-b">
                        {p.imagen_url ? (
                          <img
                            src={`${IMG_URL}${p.imagen_url}`}
                            alt={p.nombre}
                            className="w-16 h-16 object-cover rounded shadow"
                          />
                        ) : (
                          <span className="text-gray-400 italic">Sin imagen</span>
                        )}
                      </td>
                      <td className="p-3 border-b font-semibold">{p.nombre}</td>
                      <td className="p-3 border-b text-green-700 font-medium">
                        ${parseFloat(p.precio_venta).toFixed(2)}
                      </td>
                      <td className="p-3 border-b">{p.stock}</td>
                      <td className="p-3 border-b">
                        <input
                          type="number"
                          min="1"
                          max={p.stock}
                          value={cantidad}
                          onChange={(e) => handleCantidadChange(p.id, e.target.value)}
                          className="w-20 p-1.5 border rounded text-center"
                          disabled={sinStock}
                          aria-label={`Cantidad para ${p.nombre}`}
                        />
                      </td>
                      <td className="p-3 border-b text-blue-700 font-semibold">${subtotal}</td>
                      <td className="p-3 border-b">
                        <button
                          onClick={() => agregarProducto(p)}
                          className={`px-4 py-1 rounded text-sm transition text-white ${
                            sinStock ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                          }`}
                          disabled={sinStock}
                          type="button"
                          aria-disabled={sinStock}
                          aria-label={`Agregar ${p.nombre}`}
                        >
                          {sinStock ? 'Sin stock' : 'Agregar'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ListadoInventarioAgregar;
