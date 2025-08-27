import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api/usuarios";
const IMG_URL = "http://localhost:5000/uploads/";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({
    id: null,
    nombre_usuario: "",
    contraseña: "",
    rol: "",
    estado: "activo",
    foto: null,
  });
  const [mensaje, setMensaje] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      if (data.ok) setUsuarios(data.usuarios);
      else setUsuarios([]);
    } catch (error) {
      console.error(error);
      setError("Error al cargar usuarios");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({
      ...form,
      [name]: name === "foto" ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("nombre_usuario", form.nombre_usuario);
    if (!form.id || form.contraseña) formData.append("contraseña", form.contraseña);
    formData.append("rol", form.rol);
    formData.append("estado", form.estado);
    if (form.foto) formData.append("foto", form.foto);

    try {
      const url = form.id ? `${API_URL}/${form.id}` : API_URL;
      const method = form.id ? "PUT" : "POST";

      const res = await fetch(url, { method, body: formData });
      const data = await res.json();

      if (data.ok) {
        setMensaje(form.id ? "Usuario actualizado" : "Usuario creado");
        setForm({ id: null, nombre_usuario: "", contraseña: "", rol: "", estado: "activo", foto: null });
        cargarUsuarios();
      } else {
        setMensaje("Error: " + data.error);
      }
    } catch (error) {
      console.error(error);
      setMensaje("Error al guardar usuario");
    }
  };

  const handleEditar = (usuario) => {
    setForm({
      id: usuario.id,
      nombre_usuario: usuario.nombre_usuario,
      contraseña: "",
      rol: usuario.rol,
      estado: usuario.estado,
      foto: null,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Eliminar usuario?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.ok) cargarUsuarios();
    } catch (error) {
      console.error(error);
      setMensaje("Error al eliminar usuario");
    }
  };

  const cancelarEdicion = () => {
    setForm({ id: null, nombre_usuario: "", contraseña: "", rol: "", estado: "activo", foto: null });
  };

  const usuariosFiltrados = usuarios.filter((u) =>
    u.nombre_usuario.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800 font-sans p-6 md:p-8">
      <div className="bg-white shadow-lg rounded-lg w-full mx-auto flex flex-col p-6 flex-grow">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Gestión de Usuarios</h2>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200"
        >
          <input
            name="nombre_usuario"
            value={form.nombre_usuario}
            onChange={handleChange}
            placeholder="Nombre de usuario *"
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            name="contraseña"
            type="password"
            value={form.contraseña}
            onChange={handleChange}
            placeholder={form.id ? "Nueva contraseña (opcional)" : "Contraseña *"}
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={!form.id}
          />
          <select
            name="rol"
            value={form.rol}
            onChange={handleChange}
            className="border p-3 rounded-lg"
            required
          >
            <option value="">Seleccionar rol</option>
            <option value="admin">Administrador</option>
            <option value="vendedor">Vendedor</option>
          </select>
          <select
            name="estado"
            value={form.estado}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          >
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>

          <div className="md:col-span-4 flex justify-between mt-4">
            {form.id && (
              <button
                type="button"
                onClick={cancelarEdicion}
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-6 rounded-lg transition"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition"
            >
              {form.id ? "Actualizar usuario" : "Agregar usuario"}
            </button>
          </div>
        </form>

        {/* BUSCADOR */}
        <input
          type="text"
          placeholder="Buscar usuario por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border border-gray-300 p-3 rounded-lg w-full mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* MENSAJE */}
        {mensaje && <p className="mb-4 text-green-600">{mensaje}</p>}
        {error && <p className="mb-4 text-red-600">{error}</p>}

        {/* TABLA */}
        {isLoading ? (
          <div className="flex justify-center items-center flex-grow">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="ml-4 text-lg text-gray-600">Cargando usuarios...</p>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg">
            <div className="max-h-[420px] overflow-y-auto">
              <table className="table-auto w-full divide-y divide-gray-200">
                <thead className="bg-blue-50 text-blue-800 sticky top-0 z-10">
                  <tr>
                    <th className="p-3 text-left font-semibold">Foto</th>
                    <th className="p-3 text-left font-semibold">Usuario</th>
                    <th className="p-3 text-left font-semibold">Rol</th>
                    <th className="p-3 text-left font-semibold">Estado</th>
                    <th className="p-3 text-left font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {usuariosFiltrados.map((usuario) => (
                    <tr key={usuario.id} className="hover:bg-gray-50">
                      <td className="p-2">
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
                      <td className="p-3">{usuario.nombre_usuario}</td>
                      <td className="p-3">{usuario.rol}</td>
                      <td className="p-3 font-semibold text-lg" style={{ color: usuario.estado === "activo" ? "green" : "red" }}>
                        {usuario.estado}
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2 justify-end">
                          <button
                            onClick={() => handleEditar(usuario)}
                            className="flex-1 text-indigo-600 hover:underline text-center py-1 px-2 border rounded"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleEliminar(usuario.id)}
                            className="flex-1 text-red-600 hover:underline text-center py-1 px-2 border rounded"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {usuariosFiltrados.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-4 text-center text-gray-500 italic">
                        No hay usuarios
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
