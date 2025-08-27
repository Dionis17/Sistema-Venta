// Carrito.js
import React, { useState, useEffect } from "react";
import ListadoInventarioAgregar from "./inventario";
import ModalCreditos from "../component/ModalCredito";

function InputConComas({ valor, setValor }) {
  const formatearConComas = (numStr) => {
    if (!numStr) return "";
    const limpio = numStr.replace(/[^\d.]/g, "");
    const partes = limpio.split(".");
    partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return partes.join(".");
  };

  const manejarCambio = (e) => {
    const input = e.target.value;
    const sinComas = input.replace(/,/g, "");
    if (sinComas === "" || /^[0-9]*\.?[0-9]*$/.test(sinComas)) {
      setValor(sinComas);
    }
  };

  return (
    <input
      type="text"
      value={formatearConComas(valor)}
      onChange={manejarCambio}
      placeholder="0.00"
      className="border p-3 rounded w-full text-3xl font-semibold bg-blue-200 text-blue-900 placeholder-blue-600 focus:ring-2 focus:ring-blue-400 focus:outline-none"
      aria-label="Monto efectivo"
    />
  );
}

function Carrito() {
  const API_IP = "http://192.168.1.100:5000"; // Cambiar a tu IP real si es necesario

  const [cliente, setCliente] = useState(null);
  const [cuentaAbiertaSeleccionada, setCuentaAbiertaSeleccionada] =
    useState(null);
  const [tipoPago, setTipoPago] = useState("Efectivo");
  const [montoEfectivo, setMontoEfectivo] = useState("");
  const [carrito, setCarrito] = useState([]);
  const [mostrarListadoProductos, setMostrarListadoProductos] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [cuentaId, setCuentaId] = useState(null);

  const totalCarrito = carrito.reduce((total, item) => {
    const precio = parseFloat(item.precio) || 0;
    const cantidad = parseInt(item.cantidad) || 1;
    return total + precio * cantidad;
  }, 0);

  const agregarProductoACuenta = async (producto) => {
    if (!cuentaAbiertaSeleccionada) return;

    try {
      await fetch(`${API_IP}/api/cuentas/agregar-producto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cuentaId: cuentaAbiertaSeleccionada.id,
          productoId: producto.id,
          cantidad: producto.cantidad,
          precio: producto.precio,
        }),
      });
    } catch (error) {
      console.error("Error al agregar producto a la cuenta:", error);
      setMensaje({
        tipo: "error",
        texto: "No se pudo agregar el producto a la cuenta",
      });
    }
  };

  const agregarProducto = (productos) => {
    const productosAgregados = Array.isArray(productos)
      ? productos
      : [productos];
    const carritoActualizado = [...carrito];

    productosAgregados.forEach((prod) => {
      const productoNormalizado = {
        id: prod.id,
        nombre: prod.nombre,
        variante: prod.variante || "",
        cantidad: prod.cantidad || 1,
        precio: parseFloat(prod.precio_venta || prod.precio || 0),
        imagen: prod.imagen || prod.imagen_url || null,
      };

      const existente = carritoActualizado.find(
        (p) => p.id === productoNormalizado.id
      );
      if (existente) {
        existente.cantidad += productoNormalizado.cantidad;
      } else {
        carritoActualizado.push(productoNormalizado);
      }

      if (cuentaAbiertaSeleccionada) {
        agregarProductoACuenta(productoNormalizado);
      }
    });

    setCarrito(carritoActualizado);
  };

  const eliminarFila = (index) => {
    setCarrito((prev) => prev.filter((_, i) => i !== index));
  };

  const actualizarCantidad = (index, nuevaCantidad) => {
    if (nuevaCantidad < 1) nuevaCantidad = 1;
    setCarrito((prev) =>
      prev.map((prod, i) =>
        i === index ? { ...prod, cantidad: nuevaCantidad } : prod
      )
    );
  };

  const limpiarCarrito = () => {
    setCarrito([]);
    setCliente(null);
    setCuentaAbiertaSeleccionada(null);
    setMontoEfectivo("");
    setTipoPago("Efectivo");
    setMensaje(null);
  };

  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => setMensaje(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  const facturar = async () => {
    if (carrito.length === 0) {
      setMensaje({ tipo: "error", texto: "El carrito está vacío." });
      return;
    }

    if (!cliente && tipoPago !== "Efectivo") {
      setMensaje({
        tipo: "error",
        texto:
          "Debe seleccionar un cliente para pagos que no sean en efectivo.",
      });
      return;
    }

    if (tipoPago === "Efectivo") {
      const efectivo = parseFloat(montoEfectivo);
      if (isNaN(efectivo) || efectivo <= 0) {
        setMensaje({
          tipo: "error",
          texto: "Ingrese un monto en efectivo válido.",
        });
        return;
      }

      if (!cuentaAbiertaSeleccionada && efectivo < totalCarrito) {
        setMensaje({
          tipo: "error",
          texto: "El monto en efectivo es insuficiente.",
        });
        return;
      }
    }

    try {
      const body = {
        clienteId: cliente?.id || null,
        tipoPago,
        montoEfectivo:
          tipoPago === "Efectivo" ? parseFloat(montoEfectivo) : null,
        productos: carrito.map(({ id, cantidad }) => ({ id, cantidad })),
        cuentaAbiertaId: cuentaAbiertaSeleccionada?.id || null,
        montoPagado: cuentaAbiertaSeleccionada
          ? parseFloat(montoEfectivo)
          : null,
      };

      const response = await fetch(`${API_IP}/api/ventas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Error en la venta");
      }

      const data = await response.json();
      setMensaje({
        tipo: "exito",
        texto: data.message || "Venta realizada correctamente.",
      });
      limpiarCarrito();
    } catch (error) {
      console.error("Error en fetch venta:", error);
      setMensaje({ tipo: "error", texto: error.message || "Error inesperado" });
    }
  };

  const cambio =
    tipoPago === "Efectivo" && montoEfectivo
      ? Math.max(parseFloat(montoEfectivo) - totalCarrito, 0)
      : 0;

  const manejarSeleccionCuentaAbierta = async (credito) => {
    setCuentaAbiertaSeleccionada(credito);
    setCuentaId(credito.id);

    setCliente({
      id: credito.cliente_id,
      nombre: credito.cliente?.nombre || "Cliente desconocido",
    });

    setMostrarModal(false);

    try {
      const response = await fetch(
        `${API_IP}/api/cuentas/productos/${credito.id}`
      );
      if (!response.ok)
        throw new Error("Error al obtener productos de la cuenta");
      const productos = await response.json();
      const productosUnicos = combinarProductosDuplicados(productos);
      setCarrito(productosUnicos);
    } catch (error) {
      console.error(error);
      setMensaje({
        tipo: "error",
        texto: "No se pudieron cargar los productos de la cuenta",
      });
    }
  };

  const cobrarCuenta = async (cuentaId) => {
    try {
      const response = await fetch(
        `${API_IP}/api/cuentas/cobrar/${cuentaId}`,
        { method: "POST" }
      );

      if (!response.ok) throw new Error("Error cobrando la cuenta");

      const data = await response.json();
      console.log("Cuenta cobrada:", data.message);

      limpiarCarrito();
    } catch (error) {
      console.error("Error cobrando la cuenta:", error);
      setMensaje({ tipo: "error", texto: error.message });
    }
  };

  const combinarProductosDuplicados = (productos) => {
    const mapa = {};
    productos.forEach((p) => {
      const id = p.id;
      const precio = parseFloat(p.precio_venta || p.precio || 0);
      const cantidad = parseInt(p.cantidad) || 1;

      if (mapa[id]) {
        mapa[id].cantidad += cantidad;
      } else {
        mapa[id] = {
          id: p.id,
          nombre: p.nombre,
          variante: p.variante || "",
          cantidad: cantidad,
          precio: precio,
          imagen: p.imagen || p.imagen_url || null,
        };
      }
    });
    return Object.values(mapa);
  };

  return (
    <main className="mx-auto max-w-[95vw] min-h-[80vh] p-4 flex flex-col bg-gray-50 text-gray-800 font-sans">
      <div className="flex flex-col md:flex-row gap-6 flex-grow overflow-hidden">
        {/* Panel izquierdo */}
        <section className="flex flex-col flex-shrink-0 w-full md:w-1/3 gap-6 overflow-auto">
          {tipoPago === "Efectivo" && (
            <div>
              <label className="mb-0 font-semibold text-base">
                Monto efectivo
              </label>
              <InputConComas
                valor={montoEfectivo}
                setValor={setMontoEfectivo}
                placeholder={
                  cuentaAbiertaSeleccionada
                    ? "Monto a abonar a la cuenta"
                    : "Monto a pagar (contado)"
                }
              />
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
                if (e.target.value !== "Efectivo") setMontoEfectivo("");
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
                  <strong>{cliente.nombre}</strong>{" "}
                  {cuentaAbiertaSeleccionada && (
                    <span className="text-green-700 font-semibold ml-2">
                      (Cuenta abierta)
                    </span>
                  )}
                </p>
              ) : (
                <p className="text-gray-500 italic">Venta al contado</p>
              )}
            </div>
          </div>

          <div className="flex flex-row gap-3 mt-auto">
            <button
              onClick={() => setMostrarListadoProductos(true)}
              className="bg-green-500 text-white px-3 py-1.5 rounded hover:bg-indigo-700 transition shadow text-sm font-semibold flex-1"
              type="button"
            >
              Producto
            </button>
            <button
              onClick={() => setMostrarModal(true)}
              className="bg-blue-800 text-white px-3 py-1.5 rounded hover:bg-indigo-700 transition shadow text-sm font-semibold flex-1"
              type="button"
            >
              Cuenta abierta
            </button>
            <button
              onClick={limpiarCarrito}
              className="bg-gray-500 text-white px-3 py-1.5 rounded hover:bg-rose-600 transition shadow text-sm font-semibold flex-1"
              type="button"
            >
              Limpiar
            </button>
          </div>
        </section>

        {/* Panel derecho - Carrito */}
        <section className="flex flex-col flex-grow bg-white rounded border p-2 md:p-4 min-w-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse table-auto min-w-[500px] md:min-w-[600px] text-sm md:text-base">
              <thead className="bg-blue-100 text-blue-900 sticky top-0 z-10">
                <tr>
                  <th className="border p-1 md:p-2 text-left">Imagen</th>
                  <th className="border p-1 md:p-2 text-left">Producto</th>
                  <th className="border p-1 md:p-2 text-left w-20">Cantidad</th>
                  <th className="border p-1 md:p-2 text-left">Precio Unit.</th>
                  <th className="border p-1 md:p-2 text-left">Subtotal</th>
                  <th className="border p-1 md:p-2 text-left">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {carrito.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center p-4 md:p-8 text-gray-500"
                    >
                      No hay productos en el carrito
                    </td>
                  </tr>
                ) : (
                  carrito.map((item, idx) => {
                    const precio = parseFloat(item.precio) || 0;
                    const cantidad = parseInt(item.cantidad) || 1;
                    return (
                      <tr
                        key={`${item.id}-${idx}`}
                        className="hover:bg-gray-50 flex-wrap md:table-row"
                      >
                        <td className="border p-1 md:p-2 w-16">
                          {item.imagen ? (
                            <img
                              src={`${API_IP}${item.imagen}`}
                              alt={item.nombre}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <span className="text-gray-400 italic">Sin imagen</span>
                          )}
                        </td>
                        <td className="border p-1 md:p-2 font-semibold">
                          {item.nombre} {item.variante && `(${item.variante})`}
                        </td>
                        <td className="border p-1 md:p-2">
                          <input
                            type="number"
                            min="1"
                            value={cantidad}
                            onChange={(e) => {
                              let nuevaCantidad = parseInt(e.target.value);
                              if (isNaN(nuevaCantidad) || nuevaCantidad < 1)
                                nuevaCantidad = 1;
                              actualizarCantidad(idx, nuevaCantidad);
                            }}
                            className="w-full max-w-[50px] md:max-w-[60px] border rounded p-1 md:p-2 text-xs md:text-sm"
                          />
                        </td>
                        <td className="border p-1 md:p-2 text-xs md:text-sm">
                          ${precio.toFixed(2)}
                        </td>
                        <td className="border p-1 md:p-2 text-xs md:text-sm">
                          ${(precio * cantidad).toFixed(2)}
                        </td>
                        <td className="border p-1 md:p-2 text-xs md:text-sm">
                          <button
                            onClick={() => eliminarFila(idx)}
                            className="text-red-600 hover:underline font-semibold"
                            type="button"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

              {carrito.length > 0 && (
                <tfoot className="sticky bottom-0 z-10 bg-gray-50">
                  <tr>
                    <td colSpan="6" className="border-t p-1 md:p-3 text-right">
                      <div className="inline-block px-2 md:px-4 py-1 md:py-2 bg-gray-100 rounded shadow-md">
                        <span className="font-bold text-black text-sm md:text-xl mr-1 md:mr-2">
                          Total:
                        </span>
                        <span className="font-bold text-blue-700 text-sm md:text-xl">
                          ${totalCarrito.toFixed(2)}
                        </span>
                      </div>
                      {tipoPago === "Efectivo" && cambio > 0 && (
                        <div className="inline-block px-2 md:px-4 py-1 md:py-2 bg-gray-100 rounded shadow-md mt-2 md:mt-3">
                          <span className="font-bold text-black text-sm md:text-xl mr-1 md:mr-2">
                            Cambio:
                          </span>
                          <span className="font-bold text-green-600 text-sm md:text-xl">
                            ${cambio.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </section>
      </div>

      <footer className="sticky bottom-0 bg-white border-t py-3 px-6 shadow-sm w-full flex justify-end gap-4">
        <button
          onClick={facturar}
          disabled={carrito.length === 0}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded"
          type="button"
        >
          Facturar
        </button>
      </footer>

      {mostrarListadoProductos && (
        <ListadoInventarioAgregar
          onAgregar={agregarProducto}
          onCerrar={() => setMostrarListadoProductos(false)}
          carritoActual={carrito}
        />
      )}

      <ModalCreditos
        visible={mostrarModal}
        onClose={() => setMostrarModal(false)}
        onSeleccionarCredito={manejarSeleccionCuentaAbierta}
      />

      {mensaje && (
        <div
          className={`fixed bottom-4 right-4 p-4 rounded shadow-lg text-white max-w-xs z-50 ${
            mensaje.tipo === "exito" ? "bg-green-500" : "bg-red-500"
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
