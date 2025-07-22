import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api/usuarios';
const IMG_URL = 'http://localhost:5000/uploads/';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({
    id: null,
    nombre_usuario: '',
    contraseña: '',
    rol: '',
    estado: 'activo',
    foto: null,
  });
  const [mensaje, setMensaje] = useState('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      if (data.ok) setUsuarios(data.usuarios);
      else setUsuarios([]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({
      ...form,
      [name]: name === 'foto' ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('nombre_usuario', form.nombre_usuario);
    if (!form.id) formData.append('contraseña', form.contraseña);
    else if(form.contraseña) formData.append('contraseña', form.contraseña);
    formData.append('rol', form.rol);
    formData.append('estado', form.estado);
    if (form.foto) formData.append('foto', form.foto);

    try {
      const url = form.id ? `${API_URL}/${form.id}` : API_URL;
      const method = form.id ? 'PUT' : 'POST';

      const res = await fetch(url, { method, body: formData });
      const data = await res.json();

      if (data.ok) {
        setMensaje(form.id ? 'Usuario actualizado' : 'Usuario creado');
        setForm({ id: null, nombre_usuario: '', contraseña: '', rol: '', estado: 'activo', foto: null });
        cargarUsuarios();
      } else {
        setMensaje('Error: ' + data.error);
      }
    } catch (error) {
      console.error(error);
      setMensaje('Error al guardar usuario');
    }
  };

  const handleEditar = (usuario) => {
    setForm({
      id: usuario.id,
      nombre_usuario: usuario.nombre_usuario,
      contraseña: '',
      rol: usuario.rol,
      estado: usuario.estado,
      foto: null,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar usuario?')) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.ok) {
        setMensaje('Usuario eliminado');
        cargarUsuarios();
      }
    } catch (error) {
      console.error(error);
      setMensaje('Error al eliminar usuario');
    }
  };

  const usuariosFiltrados = usuarios.filter(u =>
    u.nombre_usuario.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Gestión de Usuarios</h2>

      <input
        type="text"
        placeholder="Buscar usuario"
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        className="border p-2 mb-4 rounded w-full"
      />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-white p-6 rounded shadow">
        <input
          name="nombre_usuario"
          placeholder="Nombre de usuario"
          value={form.nombre_usuario}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          name="contraseña"
          type="password"
          placeholder={form.id ? "Nueva contraseña (opcional)" : "Contraseña"}
          value={form.contraseña}
          onChange={handleChange}
          required={!form.id}
          className="border p-2 rounded"
        />
        <select
          name="rol"
          value={form.rol}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        >
          <option value="">Seleccionar rol</option>
          <option value="admin">Administrador</option>
          <option value="vendedor">Vendedor</option>
        </select>
        <select
          name="estado"
          value={form.estado}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
        <input
          name="foto"
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          {form.id ? 'Actualizar' : 'Registrar'}
        </button>
      </form>

      {mensaje && <p className="mb-4 text-green-600">{mensaje}</p>}

      <table className="min-w-full border border-gray-300 rounded overflow-hidden">
        <thead className="bg-blue-100 text-blue-900">
          <tr>
            <th className="p-3 border border-blue-200 text-left">Foto</th>
            <th className="p-3 border border-blue-200 text-left">Usuario</th>
            <th className="p-3 border border-blue-200 text-left">Rol</th>
            <th className="p-3 border border-blue-200 text-left">Estado</th>
            <th className="p-3 border border-blue-200 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuariosFiltrados.length === 0 ? (
            <tr>
              <td colSpan="5" className="p-4 text-center text-gray-500 italic">No hay usuarios</td>
            </tr>
          ) : usuariosFiltrados.map((usuario) => (
            <tr key={usuario.id} className="hover:bg-blue-50">
              <td className="p-2 border">
                {usuario.foto ? (
                  <img
                    src={`${IMG_URL}${usuario.foto}`}
                    alt="Foto usuario"
                    className="w-12 h-12 object-cover rounded-full"
                  />
                ) : (
                  <span className="text-gray-400 italic">Sin foto</span>
                )}
              </td>
              <td className="p-3 border">{usuario.nombre_usuario}</td>
              <td className="p-3 border">{usuario.rol}</td>
              <td className="p-3 border">
                {usuario.estado === 'activo' ? (
                  <span className="text-green-700 font-semibold">Activo</span>
                ) : (
                  <span className="text-red-700 font-semibold">Inactivo</span>
                )}
              </td>
              <td className="p-3 border text-right space-x-2">
                <button
                  onClick={() => handleEditar(usuario)}
                  className="text-indigo-600 hover:underline"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleEliminar(usuario.id)}
                  className="text-red-600 hover:underline"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
