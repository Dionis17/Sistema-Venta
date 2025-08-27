import React, { useEffect, useState } from "react";

const API_PRODUCTOS = "http://localhost:5000/api/productos";
const API_PROVEEDORES = "http://localhost:5000/api/proveedores";
const IMG_URL = "http://localhost:5000/uploads/";

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [form, setForm] = useState({
    id: null,
    nombre: "",
    precio_compra: "",
    precio_venta: "",
    precio_especial: "",
    stock: "",
    stock_minimo: "",
    proveedor_id: "",
    imagen: null,
  });
  const [productoSeleccionadoId, setProductoSeleccionadoId] = useState(null);

  useEffect(() => {
    cargarProductos();
    cargarProveedores();
  }, []);

  async function cargarProductos() {
    try {
      const res = await fetch(API_PRODUCTOS);
      const data = await res.json();
      setProductos(data.productos || data);
    } catch (error) {
      console.error("Error cargando productos:", error);
    }
  }

  async function cargarProveedores() {
    try {
      const res = await fetch(API_PROVEEDORES);
      const data = await res.json();
      setProveedores(data.proveedores || data);
    } catch (error) {
      console.error("Error cargando proveedores:", error);
    }
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "imagen" ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("nombre", form.nombre);
    formData.append("precio_compra", form.precio_compra);
    formData.append("precio_venta", form.precio_venta);
    formData.append("precio_especial", form.precio_especial || "");
    formData.append("stock", form.stock);
    formData.append("stock_minimo", form.stock_minimo);
    formData.append("proveedor_id", form.proveedor_id);
    if (form.imagen) formData.append("imagen", form.imagen);

    const url = form.id ? `${API_PRODUCTOS}/${form.id}` : API_PRODUCTOS;
    const method = form.id ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        body: formData,
      });
      const data = await res.json();

      if (data.error) {
        setMensaje("Error: " + data.error);
      } else {
        setMensaje(form.id ? "Producto actualizado" : "Producto creado");
        setForm({
          id: null,
          nombre: "",
          precio_compra: "",
          precio_venta: "",
          precio_especial: "",
          stock: "",
          stock_minimo: "",
          proveedor_id: "",
          imagen: null,
        });
        setProductoSeleccionadoId(null);
        cargarProductos();
      }
    } catch (error) {
      setMensaje("Error al guardar producto");
      console.error(error);
    }
  };

  const handleEditar = (producto) => {
    setForm({
      id: producto.id,
      nombre: producto.nombre || "",
      precio_compra: producto.precio_compra || "",
      precio_venta: producto.precio_venta || "",
      precio_especial: producto.precio_especial || "",
      stock: producto.stock || "",
      stock_minimo: producto.stock_minimo || "",
      proveedor_id: producto.proveedor_id || "",
      imagen: null,
    });
    setProductoSeleccionadoId(producto.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Gestión de Productos</h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3 bg-white p-6 rounded shadow"
      >
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={form.nombre}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          type="number"
          name="precio_compra"
          placeholder="Precio compra"
          value={form.precio_compra}
          onChange={handleChange}
          min="0"
          step="0.01"
          className="border p-2 rounded"
          required
        />
        <input
          type="number"
          name="precio_venta"
          placeholder="Precio venta"
          value={form.precio_venta}
          onChange={handleChange}
          min="0"
          step="0.01"
          className="border p-2 rounded"
          required
        />
        <input
          type="number"
          name="precio_especial"
          placeholder="Precio especial"
          value={form.precio_especial}
          onChange={handleChange}
          min="0"
          step="0.01"
          className="border p-2 rounded"
        />
        <input
          type="number"
          name="stock"
          placeholder="Stock"
          value={form.stock}
          onChange={handleChange}
          min="0"
          className="border p-2 rounded"
          required
        />
        <input
          type="number"
          name="stock_minimo"
          placeholder="Stock mínimo"
          value={form.stock_minimo}
          onChange={handleChange}
          min="0"
          className="border p-2 rounded"
          required
        />
        <select
          name="proveedor_id"
          value={form.proveedor_id}
          onChange={handleChange}
          className="border p-2 rounded md:col-span-2"
          required
        >
          <option value="">Seleccionar proveedor</option>
          {proveedores.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>

        <input
          type="file"
          name="imagen"
          accept="image/*"
          onChange={handleChange}
          className="border p-2 rounded md:col-span-2"
        />

        <div className="md:col-span-4 flex justify-end gap-4 mt-4">
          {form.id && (
            <button
              type="button"
              onClick={() => {
                setForm({
                  id: null,
                  nombre: "",
                  precio_compra: "",
                  precio_venta: "",
                  precio_especial: "",
                  stock: "",
                  stock_minimo: "",
                  proveedor_id: "",
                  imagen: null,
                });
                setProductoSeleccionadoId(null);
              }}
              className="bg-gray-400 hover:bg-gray-500 text-white py-2 px-6 rounded transition"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded transition"
          >
            {form.id ? "Actualizar" : "Agregar"}
          </button>
        </div>
      </form>

      {mensaje && (
        <p
          className={`mb-4 ${
            mensaje.toLowerCase().includes("error")
              ? "text-red-600"
              : "text-green-600"
          }`}
        >
          {mensaje}
        </p>
      )}

      <div className="max-h-[350px] overflow-y-auto border border-gray-300 rounded">
        <table className="min-w-full border border-gray-300 rounded overflow-hidden">
          <thead className="bg-blue-100 text-blue-900">
            <tr>
              <th className="p-3 border text-left">Imagen</th>
              <th className="p-3 border text-left">Nombre</th>
              <th className="p-3 border text-left">Precio compra</th>
              <th className="p-3 border text-left">Precio venta</th>
              <th className="p-3 border text-left">Precio especial</th>
              <th className="p-3 border text-left">Stock</th>
              <th className="p-3 border text-left">Stock mínimo</th>
              <th className="p-3 border text-left">Proveedor</th>
              <th className="p-3 border text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.length === 0 ? (
              <tr>
                <td colSpan="9" className="p-4 text-center text-gray-500 italic">
                  No hay productos
                </td>
              </tr>
            ) : (
              productos.map((p) => {
                const isSelected = productoSeleccionadoId === p.id;
                return (
                  <tr
                    key={p.id}
                    onClick={() => handleEditar(p)}
                    className={`cursor-pointer ${
                      isSelected ? "bg-blue-200" : "hover:bg-blue-50"
                    }`}
                  >
                    <td className="p-2 border">
                      {p.imagen_url ? (
                        <img
                          src={`${IMG_URL}${p.imagen_url.replace("/uploads/", "")}`}
                          alt={p.nombre}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <span className="text-gray-400 italic">Sin imagen</span>
                      )}
                    </td>
                    <td className="p-3 border">{p.nombre}</td>
                    <td className="p-3 border">{p.precio_compra}</td>
                    <td className="p-3 border">{p.precio_venta}</td>
                    <td className="p-3 border">{p.precio_especial || "-"}</td>
                    <td className="p-3 border">{p.stock}</td>
                    <td className="p-3 border">{p.stock_minimo}</td>
                    <td className="p-3 border">{p.proveedor?.nombre || "Sin proveedor"}</td>
                    <td className="p-3 border text-right space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Aquí puedes agregar funcionalidad de borrar si quieres
                        }}
                        className="text-indigo-600 hover:underline"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
