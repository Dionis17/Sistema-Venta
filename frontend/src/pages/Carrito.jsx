import React, { useState, useEffect } from 'react';
import ListadoInventarioAgregar from './inventario'; // Asegúrate que exista este componente

// Input que formatea con comas
function InputConComas({ valor, setValor }) {
  const formatearConComas = (numStr) => {
    if (!numStr) return '';
    const limpio = numStr.replace(/[^\d.]/g, '');
    const partes = limpio.split('.');
    partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return partes.join('.');
  };

  const manejarCambio = (e) => {
    const input = e.target.value;
    const sinComas = input.replace(/,/g, '');
    if (sinComas === '' || /^[0-9]*\.?[0-9]*$/.test(sinComas)) {
      setValor(sinComas);
    }
  };

  return (
    <input
      type="text"
      value={formatearConComas(valor)}
      onChange={manejarCambio}
      placeholder="0.00"
      className="border p-3 rounded w-full text-2xl font-semibold bg-yellow-200 text-yellow-900 placeholder-yellow-600 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
      aria-label="Monto efectivo"
    />
  );
}

function ModalClientes({ onSeleccionar, onCerrar }) {
  const clienteEjemplo = { id: 123, nombre: 'Juan Pérez', credito: true };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded p-6 max-w-md w-full shadow-lg">
        <h3 className="text-xl font-bold mb-4">Seleccionar Cliente</h3>
        <button
          onClick={() => {
            onSeleccionar(clienteEjemplo);
            onCerrar();
          }}
          className="bg-blue-400 text-white px-3 py-1.5 rounded hover:bg-blue-500 transition text-sm"
        >
          Seleccionar cliente ejemplo
        </button>
        <button
          onClick={onCerrar}
          className="ml-4 px-3 py-1.5 rounded border hover:bg-gray-100 transition text-sm"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

function Carrito() {
  const [cliente, setCliente] = useState(null);
  const [tipoPago, setTipoPago] = useState('Efectivo');
  const [montoEfectivo, setMontoEfectivo] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [mostrarListadoProductos, setMostrarListadoProductos] = useState(false);
  const [mostrarClientes, setMostrarClientes] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  // Total del carrito sumando precio * cantidad
  const totalCarrito = carrito.reduce((total, item) => {
    const precio = parseFloat(item.precio_venta) || 0;
    const cantidad = parseInt(item.cantidad) || 1;
    return total + precio * cantidad;
  }, 0);

  // Agregar producto al carrito
  const agregarProducto = (producto) => {
    const productoExistente = carrito.find(p => p.id === producto.id);
    if (productoExistente) {
      const nuevosProductos = carrito.map(p =>
        p.id === producto.id ? { ...p, cantidad: p.cantidad + producto.cantidad } : p
      );
      setCarrito(nuevosProductos);
    } else {
      setCarrito([...carrito, producto]);
    }
  };

  // Eliminar producto del carrito
  const eliminarFila = (index) => {
    setCarrito((prev) => prev.filter((_, i) => i !== index));
  };

  // Actualizar cantidad de producto en carrito
  const actualizarCantidad = (index, nuevaCantidad) => {
    if (nuevaCantidad < 1) nuevaCantidad = 1;
    setCarrito((prev) =>
      prev.map((prod, i) => (i === index ? { ...prod, cantidad: nuevaCantidad } : prod))
    );
  };

  // Limpiar carrito y resetear estados relacionados
  const limpiarCarrito = () => {
    setCarrito([]);
    setCliente(null);
    setMontoEfectivo('');
    setTipoPago('Efectivo');
    setMensaje(null);
  };

  // Mensajes desaparecen después de 4 segundos
  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => setMensaje(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  // Facturar la venta (simulación de API)
  const facturar = async () => {
    if (carrito.length === 0) {
      setMensaje({ tipo: 'error', texto: 'El carrito está vacío.' });
      return;
    }

    if (tipoPago === 'Efectivo') {
      const efectivo = parseFloat(montoEfectivo);
      if (isNaN(efectivo) || efectivo <= 0) {
        setMensaje({ tipo: 'error', texto: 'Ingrese un monto en efectivo válido.' });
        return;
      }
      if (efectivo < totalCarrito) {
        setMensaje({ tipo: 'error', texto: 'El monto en efectivo es insuficiente.' });
        return;
      }
    }

    // Aquí harías el fetch para enviar la venta a backend
    try {
      const response = await fetch('http://localhost:5000/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteId: cliente?.id || null,
          tipoPago,
          montoEfectivo: tipoPago === 'Efectivo' ? parseFloat(montoEfectivo) : null,
          productos: carrito.map(({ id, cantidad }) => ({ id, cantidad })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Error en la venta');
      }

      const data = await response.json();
      setMensaje({ tipo: 'exito', texto: data.message || 'Venta realizada correctamente.' });
      limpiarCarrito();
    } catch (error) {
      console.error('Error en fetch venta:', error);
      setMensaje({ tipo: 'error', texto: error.message || 'Error inesperado' });
    }
  };

  // Calcular cambio si es pago en efectivo
  const cambio =
    tipoPago === 'Efectivo' && montoEfectivo
      ? Math.max(parseFloat(montoEfectivo) - totalCarrito, 0)
      : 0;

  return (
    <main className="mx-auto max-w-[90vw] min-h-[80vh] p-4 flex flex-col bg-gray-50 text-gray-800 font-sans">
      <header className="mb-6">
        <h2 className="text-3xl font-bold">Carrito de Ventas</h2>
      </header>

      <div className="flex flex-col md:flex-row gap-6 flex-grow overflow-hidden">
        {/* Panel lateral */}
        <section className="flex flex-col flex-shrink-0 w-full md:w-1/3 gap-6 overflow-auto">
          {tipoPago === 'Efectivo' && (
            <div>
              <label className="mb-1 font-semibold text-base">Monto efectivo</label>
              <InputConComas valor={montoEfectivo} setValor={setMontoEfectivo} />
              {cambio > 0 && (
                <p className="mt-1 text-green-700 font-semibold text-base">
                  Cambio: ${cambio.toFixed(2)}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="mb-1 font-semibold text-base">Tipo de pago</label>
            <select
              value={tipoPago}
              onChange={(e) => {
                setTipoPago(e.target.value);
                setMensaje(null);
                if (e.target.value !== 'Efectivo') setMontoEfectivo('');
              }}
              className="border p-2 rounded w-full text-base"
              aria-label="Tipo de pago"
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Tarjeta">Tarjeta</option>
            </select>
          </div>

          <div>
            <label className="mb-1 font-semibold text-base">Cliente</label>
            <div className="border p-3 rounded bg-white min-h-[48px] text-base">
              {cliente ? (
                <p>
                  <strong>{cliente.nombre}</strong> ({cliente.credito ? 'Con crédito' : 'Sin crédito'})
                </p>
              ) : (
                <p className="text-gray-400 italic">No se ha seleccionado cliente</p>
              )}
            </div>
          </div>

          <div className="flex flex-row gap-3 mt-auto">
            <button
              onClick={() => setMostrarListadoProductos(true)}
              className="bg-indigo-400 text-white px-3 py-1.5 rounded hover:bg-indigo-700 transition shadow text-sm font-semibold flex-1"
            >
              Producto
            </button>
            <button
              onClick={() => setMostrarClientes(true)}
              className="bg-teal-400 text-white px-3 py-1.5 rounded hover:bg-teal-600 transition shadow text-sm font-semibold flex-1"
            >
              Credito
            </button>
            <button
              onClick={limpiarCarrito}
              className="bg-rose-500 text-white px-3 py-1.5 rounded hover:bg-rose-600 transition shadow text-sm font-semibold flex-1"
            >
              Limpiar
            </button>
          </div>
        </section>

        {/* Tabla carrito */}
        <section className="flex flex-col flex-grow overflow-auto bg-white rounded border p-4 min-w-0">
          <table className="w-full border-collapse table-auto min-w-[600px] text-base">
            <thead className="bg-blue-100 text-blue-900" >
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
                  <td colSpan="5" className="text-center p-8 text-gray-500">No hay productos en el carrito</td>
                </tr>
              ) : (
                carrito.map((item, idx) => {
                  const precio = parseFloat(item.precio_venta) || 0;
                  const cantidad = parseInt(item.cantidad) || 1;
                  return (
                    <tr key={item.id || idx} className="hover:bg-gray-50">
                      <td className="border p-2 font-semibold">{item.nombre}</td>
                      <td className="border p-2">
                        <input
                          type="number"
                          min="1"
                          value={cantidad}
                          onChange={(e) => {
                            let nuevaCantidad = parseInt(e.target.value);
                            if (isNaN(nuevaCantidad) || nuevaCantidad < 1) nuevaCantidad = 1;
                            actualizarCantidad(idx, nuevaCantidad);
                          }}
                          className="w-full max-w-[60px] border rounded p-1 text-sm"
                          aria-label={`Cantidad para ${item.nombre}`}
                        />
                      </td>
                      <td className="border p-2 text-sm">${precio.toFixed(2)}</td>
                      <td className="border p-2 text-sm">${(precio * cantidad).toFixed(2)}</td>
                      <td className="border p-2 text-sm">
                        <button
                          onClick={() => eliminarFila(idx)}
                          className="text-red-600 hover:underline text-sm font-semibold"
                          aria-label={`Eliminar ${item.nombre}`}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          {carrito.length > 0 && (
            <p className="text-right font-semibold p-4 text-lg">Total: ${totalCarrito.toFixed(2)}</p>
          )}
        </section>
      </div>

      <footer className="sticky bottom-0 bg-white border-t py-3 px-6 shadow-sm w-full flex justify-end gap-4">
        <button
          onClick={facturar}
          disabled={carrito.length === 0}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded"
        >
          Facturar
        </button>
        {cambio > 0 && tipoPago === 'Efectivo' && (
          <div className="text-sm font-bold text-green-700">Cambio: ${cambio.toFixed(2)}</div>
        )}
      </footer>

      {mostrarListadoProductos && (
        <ListadoInventarioAgregar
          onAgregar={agregarProducto}
          onCerrar={() => setMostrarListadoProductos(false)}
          carritoActual={carrito}
        />
      )}

      {mostrarClientes && (
        <ModalClientes
          onSeleccionar={(cliente) => {
            setCliente(cliente);
            setMostrarClientes(false);
          }}
          onCerrar={() => setMostrarClientes(false)}
        />
      )}

      {mensaje && (
        <div
          className={`fixed bottom-4 right-4 p-4 rounded shadow-lg text-white max-w-xs ${
            mensaje.tipo === 'exito' ? 'bg-green-500' : 'bg-red-500'
          }`}
          role="alert"
        >
          {mensaje.texto}
        </div>
      )}
    </main>
  );
}

export default Carrito;
