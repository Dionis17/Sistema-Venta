import React, { useState } from 'react';

function CarritoVentas() {
  const [cliente, setCliente] = useState(null);
  const [tipoPago, setTipoPago] = useState('Efectivo');
  const [montoEfectivo, setMontoEfectivo] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [mostrarProductos, setMostrarProductos] = useState(false);
  const [mostrarClientes, setMostrarClientes] = useState(false);

  const totalCarrito = carrito.reduce(
    (sum, item) => sum + item.precio_venta * (item.cantidad || 1),
    0
  );

  const agregarProducto = (producto) => {
    setCarrito([...carrito, producto]);
    setMostrarProductos(false);
  };

  const seleccionarCliente = (cliente) => {
    setCliente(cliente);
    setMostrarClientes(false);
  };

  const eliminarFila = (index) => {
    setCarrito(carrito.filter((_, i) => i !== index));
  };

  const limpiarCarrito = () => {
    setCarrito([]);
    setCliente(null);
    setMontoEfectivo('');
    setTipoPago('Efectivo');
  };

  const facturar = () => {
    if (tipoPago === 'Efectivo' && parseFloat(montoEfectivo) < totalCarrito) {
      alert('El monto en efectivo es insuficiente para realizar la factura.');
      return;
    }

    alert(
      `Facturando a ${
        cliente ? cliente.nombre : 'Cliente no seleccionado'
      } con ${tipoPago} y monto ${montoEfectivo}`
    );
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 p-6 flex flex-col">
      <h2 className="text-2xl font-semibold mb-6">Carrito de Ventas</h2>

      {/* Contenedor info pago y cliente + botones */}
      <div className="flex flex-wrap items-start justify-between gap-6 mb-6 w-full">
        {/* Info pago y cliente */}
        <div className="flex flex-wrap gap-6 flex-grow min-w-[300px] max-w-[700px]">
          <div className="flex flex-col w-48">
            <label className="mb-1 font-medium">Monto efectivo</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={montoEfectivo}
              onChange={(e) => setMontoEfectivo(e.target.value)}
              className="border p-2 rounded w-full"
              placeholder="0.00"
            />
          </div>

          <div className="flex flex-col w-48">
            <label className="mb-1 font-medium">Tipo de pago</label>
            <select
              value={tipoPago}
              onChange={(e) => setTipoPago(e.target.value)}
              className="border p-2 rounded w-full"
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Tarjeta">Tarjeta</option>
            </select>
          </div>

          <div className="flex flex-col flex-grow min-w-[180px]">
            <label className="mb-1 font-medium">Cliente</label>
            <div className="border p-3 rounded bg-white min-h-[48px]">
              {cliente ? (
                <p>
                  <strong>{cliente.nombre}</strong> ({cliente.credito ? 'Con crédito' : 'Sin crédito'})
                </p>
              ) : (
                <p className="text-gray-400 italic">No se ha seleccionado cliente</p>
              )}
            </div>
          </div>
        </div>

        {/* Botones principales alineados a la derecha */}
        <div className="flex flex-wrap gap-4 justify-end min-w-[180px]">
          <button
            onClick={() => setMostrarProductos(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Agregar Producto
          </button>
          <button
            onClick={() => setMostrarClientes(true)}
            className="bg-blue-400 text-white px-4 py-2 rounded hover:bg-blue-500 transition"
          >
            Seleccionar Cliente
          </button>
          <button
            onClick={limpiarCarrito}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
          >
            Limpiar Carrito
          </button>
        </div>
      </div>

      {/* Tabla carrito */}
      <div className="flex-grow overflow-auto border border-gray-300 rounded bg-white mb-20 w-full">
        <table className="w-full min-w-[600px] border-collapse table-auto">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="border p-2 text-left">Producto</th>
              <th className="border p-2 text-left w-24">Cantidad</th>
              <th className="border p-2 text-left">Precio Unit.</th>
              <th className="border p-2 text-left">Subtotal</th>
              <th className="border p-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {carrito.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-8 text-gray-500">
                  No hay productos en el carrito
                </td>
              </tr>
            ) : (
              carrito.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="border p-2">{item.nombre}</td>
                  <td className="border p-2">
                    <input
                      type="number"
                      min="1"
                      value={item.cantidad || 1}
                      onChange={(e) => {
                        const nuevaCantidad = parseInt(e.target.value) || 1;
                        const copia = carrito.map((prod, i) =>
                          i === idx ? { ...prod, cantidad: nuevaCantidad } : prod
                        );
                        setCarrito(copia);
                      }}
                      className="w-full max-w-[60px] border rounded p-1"
                    />
                  </td>
                  <td className="border p-2">${item.precio_venta.toFixed(2)}</td>
                  <td className="border p-2">
                    ${(item.precio_venta * (item.cantidad || 1)).toFixed(2)}
                  </td>
                  <td className="border p-2">
                    <button
                      onClick={() => eliminarFila(idx)}
                      className="text-red-600 hover:underline"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {carrito.length > 0 && (
          <p className="text-right font-semibold p-4">Total: ${totalCarrito.toFixed(2)}</p>
        )}
      </div>

      {/* Botón facturar fijo abajo */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 py-3 px-6 shadow-sm z-50 w-full flex justify-end">
        <button
          onClick={facturar}
          disabled={carrito.length === 0}
          className="bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded hover:bg-green-700 transition"
        >
          Facturar
        </button>
      </div>

      {/* Modal productos */}
      {mostrarProductos && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded p-6 max-w-md w-full shadow-lg">
            <h3 className="text-xl font-bold mb-4">Seleccionar Producto</h3>
            <button
              onClick={() =>
                agregarProducto({
                  id: 1,
                  nombre: 'Cerveza Corona',
                  precio_venta: 2.5,
                  cantidad: 1,
                })
              }
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Agregar producto ejemplo
            </button>
            <button
              onClick={() => setMostrarProductos(false)}
              className="ml-4 px-4 py-2 rounded border hover:bg-gray-100 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Modal clientes */}
      {mostrarClientes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded p-6 max-w-md w-full shadow-lg">
            <h3 className="text-xl font-bold mb-4">Seleccionar Cliente</h3>
            <button
              onClick={() =>
                seleccionarCliente({ id: 123, nombre: 'Juan Pérez', credito: true })
              }
              className="bg-blue-400 text-white px-4 py-2 rounded hover:bg-blue-500 transition"
            >
              Seleccionar cliente ejemplo
            </button>
            <button
              onClick={() => setMostrarClientes(false)}
              className="ml-4 px-4 py-2 rounded border hover:bg-gray-100 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CarritoVentas;
