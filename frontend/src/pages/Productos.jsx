import React, { useState, useEffect } from 'react';

function Productos() {
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState({
    id: null,
    nombre: '',
    precio_compra: '',
    precio_venta: '',
    stock: '',
    stock_minimo: '',
    imagen: null
  });

  const API_URL = 'http://localhost:5000/api/productos';
  const IMG_URL = 'http://localhost:5000';

  useEffect(() => {
    getProductos();
  }, []);

  const getProductos = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setProductos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al obtener productos:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({
      ...form,
      [name]: name === 'imagen' ? files[0] : value
    });
  };

  const handleAgregarOActualizar = async (e) => {
    e.preventDefault();
    const { id, nombre, precio_compra, precio_venta, stock, stock_minimo, imagen } = form;

    if (!nombre || isNaN(precio_compra) || isNaN(precio_venta) || isNaN(stock) || isNaN(stock_minimo)) {
      alert('Por favor, completa todos los campos correctamente.');
      return;
    }

    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('precio_compra', precio_compra);
    formData.append('precio_venta', precio_venta);
    formData.append('stock', stock);
    formData.append('stock_minimo', stock_minimo);
    if (imagen && imagen instanceof File) formData.append('imagen', imagen);

    try {
      if (id) {
        await fetch(`${API_URL}/${id}`, {
          method: 'PUT',
          body: formData
        });
      } else {
        await fetch(API_URL, {
          method: 'POST',
          body: formData
        });
      }
      setForm({ id: null, nombre: '', precio_compra: '', precio_venta: '', stock: '', stock_minimo: '', imagen: null });
      getProductos();
    } catch (err) {
      console.error('Error al guardar producto:', err);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este producto?')) return;
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      getProductos();
    } catch (err) {
      console.error('Error al eliminar producto:', err);
    }
  };

  const handleEditar = (producto) => {
    setForm({
      id: producto.id,
      nombre: producto.nombre,
      precio_compra: producto.precio_compra,
      precio_venta: producto.precio_venta,
      stock: producto.stock,
      stock_minimo: producto.stock_minimo,
      imagen: null,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelarEdicion = () => {
    setForm({ id: null, nombre: '', precio_compra: '', precio_venta: '', stock: '', stock_minimo: '', imagen: null });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestión de Inventario</h2>
        <div className="bg-white p-3 rounded shadow border text-right min-w-[220px]">
          <p className="text-gray-600 text-sm">Capital</p>
          <p className="text-2xl font-bold text-blue-500">
            ${productos.reduce((total, p) => total + (p.precio_compra * p.stock), 0).toFixed(2)}
          </p>
        </div>
      </div>
    

    <form
  onSubmit={handleAgregarOActualizar}
  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 bg-white p-6 rounded-2xl shadow-md"
>
  <input
    name="nombre"
    value={form.nombre}
    onChange={handleChange}
    placeholder="Nombre"
    className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
    required
  />
  <input
    name="precio_compra"
    type="number"
    value={form.precio_compra}
    onChange={handleChange}
    placeholder="Precio compra"
    className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
    required
    min="0"
    step="0.01"
  />
  <input
    name="precio_venta"
    type="number"
    value={form.precio_venta}
    onChange={handleChange}
    placeholder="Precio venta"
    className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
    required
    min="0"
    step="0.01"
  />
  <input
    name="stock"
    type="number"
    value={form.stock}
    onChange={handleChange}
    placeholder="Stock"
    className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
    required
    min="0"
    step="1"
  />
  <input
    name="stock_minimo"
    type="number"
    value={form.stock_minimo}
    onChange={handleChange}
    placeholder="Stock mínimo"
    className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
    required
    min="0"
    step="1"
  />
  <input
    type="file"
    name="imagen"
    accept="image/*"
    onChange={handleChange}
    className="border p-2 rounded-lg bg-gray-50"
  />

  {/* Botones en una fila nueva */}
  <div className="col-span-full flex flex-wrap gap-4 mt-4">
    <button
      type="submit"
      className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition"
    >
      {form.id ? 'Actualizar producto' : 'Agregar producto'}
    </button>

    {form.id && (
      <button
        type="button"
        onClick={handleCancelarEdicion}
        className="bg-gray-400 hover:bg-gray-500 text-white py-2 px-6 rounded-lg transition"
      >
        Cancelar
      </button>
    )}
  </div>
</form>

  

      <table className="min-w-full border">
        <thead className="bg-blue-100 text-blue-900" >
          
          <tr className="text-left">
            <th className="p-3 border border-blue-200 text-left">Imagen</th>
            <th className="p-3 border border-blue-200 text-left">Nombre</th>
            <th className="p-3 border border-blue-200 text-left">Compra</th>
            <th className="p-3 border border-blue-200 text-left">Venta</th>
            <th className="p-3 border border-blue-200 text-left">Ganancia</th>
            <th className="p-3 border border-blue-200 text-left">Stock</th>
            <th className="p-3 border border-blue-200 text-left">Mínimo</th>
            <th className="p-3 border border-blue-200 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="p-2 border">
                {p.imagen_url ? (
                  <img src={`${IMG_URL}${p.imagen_url}`} alt="producto" className="w-16 h-16 object-cover rounded" />
                ) : (
                  <span className="text-gray-400 italic">Sin imagen</span>
                )}
              </td>
              <td className="p-2 border">{p.nombre}</td>
              <td className="p-2 border">${p.precio_compra}</td>
              <td className="p-2 border">${p.precio_venta}</td>
              <td className="p-2 border text-green-700 font-semibold">
                ${parseFloat(p.precio_venta - p.precio_compra).toFixed(2)}
              </td>
              <td className="p-2 border">{p.stock}</td>
              <td className="p-2 border">{p.stock_minimo}</td>
              <td className="p-2 border flex gap-2">
                <button
                  onClick={() => handleEditar(p)}
                  className="text-blue-600 hover:underline"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleEliminar(p.id)}
                  className="text-red-600 hover:underline"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
          {productos.length === 0 && (
            <tr>
              <td colSpan="8" className="text-center p-4 text-gray-500">
                No hay productos registrados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Productos;
