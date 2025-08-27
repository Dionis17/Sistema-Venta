import React, { useEffect, useState } from "react";

const API_PROVEEDORES = "http://localhost:5000/api/proveedores";

export default function Proveedor() {
  const [proveedores, setProveedores] = useState([]);
  const [form, setForm] = useState({
    id: null,
    nombre: "",
    telefono: "",
    email: "",
    estado: "activo",
  });
  const [busqueda, setBusqueda] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarProveedores();
  }, []);

  const cargarProveedores = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(API_PROVEEDORES);
      if (!res.ok) throw new Error("Error al obtener proveedores");
      const data = await res.json();
      setProveedores(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) {
      alert("El nombre es obligatorio");
      return;
    }

    const url = form.id ? `${API_PROVEEDORES}/${form.id}` : API_PROVEEDORES;
    const method = form.id ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Error al guardar proveedor");
      await cargarProveedores();
      cancelarEdicion();
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error al guardar el proveedor");
    }
  };

  const handleEditar = (prov) => {
    setForm(prov);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Deseas eliminar este proveedor?")) return;
    try {
      const res = await fetch(`${API_PROVEEDORES}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar proveedor");
      setProveedores((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error al eliminar el proveedor");
    }
  };

  const cancelarEdicion = () => {
    setForm({
      id: null,
      nombre: "",
      telefono: "",
      email: "",
      estado: "activo",
    });
  };

  const proveedoresFiltrados = proveedores.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800 font-sans p-6 md:p-8">
      <div className="bg-white shadow-lg rounded-lg w-full mx-auto flex flex-col p-6 flex-grow">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">
            Gestión de Proveedores
          </h2>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200"
        >
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Nombre del proveedor *"
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            placeholder="Teléfono"
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Correo electrónico"
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
              {form.id ? "Actualizar proveedor" : "Agregar proveedor"}
            </button>
          </div>
        </form>

        {/* BUSCADOR */}
        <input
          type="text"
          placeholder="Buscar proveedor por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border border-gray-300 p-3 rounded-lg w-full mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* ERROR */}
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* TABLA */}
        {isLoading ? (
          <div className="flex justify-center items-center flex-grow">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="ml-4 text-lg text-gray-600">
              Cargando proveedores...
            </p>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg">
            {/* Contenedor con scroll solo si hay muchos registros */}
            <div className="max-h-[420px] overflow-y-auto">
              <table className="table-auto w-full divide-y divide-gray-200">
                <thead className="bg-blue-50 text-blue-800 sticky top-0 z-10">
                  <tr>
                    <th className="p-3 text-left text-xs md:text-sm font-semibold w-2/6">
                      Nombre
                    </th>
                    <th className="p-3 text-left text-xs md:text-sm font-semibold w-1/6">
                      Teléfono
                    </th>
                    <th className="p-3 text-left text-xs md:text-sm font-semibold w-2/6">
                      Email
                    </th>
                    <th className="p-3 text-left text-xs md:text-sm font-semibold w-1/6">
                      Estado
                    </th>
                    <th className="p-3 text-left text-xs md:text-sm font-semibold w-1/6">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {proveedoresFiltrados.map((prov) => (
                    <tr key={prov.id} className="hover:bg-gray-50">
                      <td className="p-3">{prov.nombre}</td>
                      <td className="p-3">{prov.telefono}</td>
                      <td className="p-3">{prov.email}</td>
                      <td
                        className="p-3 font-semibold text-lg"
                        style={{
                          color: prov.estado === "activo" ? "green" : "red",
                        }}
                      >
                        {prov.estado}
                      </td>

                      <td className="p-3">
                        <div className="flex space-x-2 justify-end">
                          <button
                            onClick={() => handleEditar(prov)}
                            className="flex-1 text-indigo-600 hover:underline text-center py-1 px-2 border rounded"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleEliminar(prov.id)}
                            className="flex-1 text-red-600 hover:underline text-center py-1 px-2 border rounded"
                          >
                            Eliminar
                          </button>
                        </div>
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
