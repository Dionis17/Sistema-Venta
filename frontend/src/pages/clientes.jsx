import React, { useState, useEffect } from 'react';

function GestionClientes() {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  const clienteInicial = {
    id: null,
    nombre: '',
    telefono: '',
    direccion: '',
    credito: false,
  };

  const [formCliente, setFormCliente] = useState(clienteInicial);
  const [modoEdicion, setModoEdicion] = useState(false);

  const API_URL = 'http://localhost:5000/api/clientes';

  useEffect(() => {
    cargarClientes();
  }, []);

  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => setMensaje(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  const cargarClientes = async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(API_URL, { cache: 'no-store' });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Error al obtener clientes');
      }
      const data = await res.json();
      setClientes(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  };

  const clientesFiltrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormCliente(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const agregarCliente = async () => {
    if (!formCliente.nombre.trim()) {
      setMensaje({ tipo: 'error', texto: 'El nombre del cliente es obligatorio.' });
      return;
    }
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formCliente),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al agregar cliente');
      }
      setMensaje({ tipo: 'exito', texto: 'Cliente agregado exitosamente.' });
      setFormCliente(clienteInicial);
      cargarClientes();
    } catch (e) {
      setMensaje({ tipo: 'error', texto: e.message });
    }
  };

  const editarCliente = (cliente) => {
    setFormCliente(cliente);
    setModoEdicion(true);
    setMensaje(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const guardarEdicion = async () => {
    if (!formCliente.nombre.trim()) {
      setMensaje({ tipo: 'error', texto: 'El nombre del cliente es obligatorio.' });
      return;
    }
    try {
      const res = await fetch(`${API_URL}/${formCliente.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formCliente),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al actualizar cliente');
      }
      setMensaje({ tipo: 'exito', texto: 'Cliente actualizado exitosamente.' });
      setFormCliente(clienteInicial);
      setModoEdicion(false);
      cargarClientes();
    } catch (e) {
      setMensaje({ tipo: 'error', texto: e.message });
    }
  };

  const cancelarEdicion = () => {
    setFormCliente(clienteInicial);
    setModoEdicion(false);
    setMensaje(null);
  };

  const eliminarCliente = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este cliente? Esta acción es irreversible.')) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al eliminar cliente');
      }
      setMensaje({ tipo: 'exito', texto: 'Cliente eliminado exitosamente.' });
      if (modoEdicion && formCliente.id === id) cancelarEdicion();
      cargarClientes();
    } catch (e) {
      setMensaje({ tipo: 'error', texto: e.message });
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Título y búsqueda */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold">Gestión de Clientes</h2>
        <input
          type="text"
          placeholder="Buscar cliente por nombre..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="border rounded p-2 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Formulario */}
      <form
        onSubmit={e => {
          e.preventDefault();
          modoEdicion ? guardarEdicion() : agregarCliente();
        }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-white p-6 rounded shadow"
      >
        <input
          type="text"
          name="nombre"
          value={formCliente.nombre}
          onChange={handleChange}
          placeholder="Nombre *"
          className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="tel"
          name="telefono"
          value={formCliente.telefono}
          onChange={handleChange}
          placeholder="Teléfono"
          className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          name="direccion"
          value={formCliente.direccion}
          onChange={handleChange}
          placeholder="Dirección"
          className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <label className="flex items-center gap-2 select-none">
          <input
            type="checkbox"
            name="credito"
            checked={formCliente.credito}
            onChange={handleChange}
            className="w-5 h-5 rounded border-gray-400 text-blue-600 focus:ring-blue-500"
          />
          Cliente con crédito
        </label>

        <div className="md:col-span-4 flex gap-4 justify-end mt-2">
          {modoEdicion && (
            <button
              type="button"
              onClick={cancelarEdicion}
              className="bg-gray-400 hover:bg-gray-500 text-white py-2 px-6 rounded"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded"
          >
            {modoEdicion ? 'Guardar cambios' : 'Agregar cliente'}
          </button>
        </div>
      </form>

      {/* Tabla */}
      <table className="min-w-full border border-gray-300 rounded overflow-hidden">
        <thead className="bg-blue-100 text-blue-900">
          <tr>
            <th className="p-3 border border-blue-200 text-left">Nombre</th>
            <th className="p-3 border border-blue-200 text-left">Teléfono</th>
            <th className="p-3 border border-blue-200 text-left">Dirección</th>
            <th className="p-3 border border-blue-200 text-center">Crédito</th>
            <th className="p-3 border border-blue-200 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cargando && (
            <tr>
              <td colSpan="5" className="p-6 text-center text-blue-600 italic animate-pulse">
                Cargando clientes...
              </td>
            </tr>
          )}
          {error && (
            <tr>
              <td colSpan="5" className="p-6 text-center text-red-600 font-semibold">
                Error: {error}
              </td>
            </tr>
          )}
          {!cargando && clientesFiltrados.length === 0 && (
            <tr>
              <td colSpan="5" className="p-6 text-center text-gray-500 italic">
                No se encontraron clientes.
              </td>
            </tr>
          )}
          {clientesFiltrados.map(cliente => (
            <tr key={cliente.id} className="hover:bg-blue-50">
              <td className="p-3 border border-blue-200">{cliente.nombre}</td>
              <td className="p-3 border border-blue-200">{cliente.telefono || <em className="text-gray-400">N/A</em>}</td>
              <td className="p-3 border border-blue-200">{cliente.direccion || <em className="text-gray-400">N/A</em>}</td>
              <td className="p-3 border border-blue-200 text-center">
                {cliente.credito ? (
                  <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-200 text-blue-800">
                    Sí
                  </span>
                ) : (
                  <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-700">
                    No
                  </span>
                )}
              </td>
              <td className="p-3 border border-blue-200 text-right space-x-3">
                <button
                  onClick={() => editarCliente(cliente)}
                  className="text-indigo-600 hover:underline"
                >
                  Editar
                </button>
                <button
                  onClick={() => eliminarCliente(cliente.id)}
                  className="text-red-600 hover:underline"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mensaje */}
      {mensaje && (
        <div
          className={`fixed bottom-6 right-6 p-4 rounded shadow-lg max-w-sm text-white flex items-center justify-between
          ${mensaje.tipo === 'exito' ? 'bg-blue-600' : 'bg-red-600'}`}
          role="alert"
          aria-live="polite"
        >
          <span>{mensaje.texto}</span>
          <button
            onClick={() => setMensaje(null)}
            className="ml-4 text-white hover:text-gray-200 focus:outline-none"
            aria-label="Cerrar mensaje"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default GestionClientes;
