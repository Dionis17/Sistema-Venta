import React from 'react';
import { useNavigate } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Se asegura de que la función onLogout exista antes de llamarla
    if (onLogout) {
      onLogout();
    }
    navigate('/login');
  };

  // Usa destructuring para un código más limpio y legible
  const { nombre = 'Usuario', rol = 'Rol', foto } = user || {};

  // Construye la URL de la foto de perfil de forma más segura
  const fotoPerfil = foto || `https://ui-avatars.com/api/?name=${nombre}&background=e2e8f0&color=1a202c`;

  return (
    <header className="bg-white shadow px-4 sm:px-6 py-4 w-full">
      <div className="max-w-full mx-auto flex justify-between items-center">
        {/* Título del panel */}
        <h1 className="text-xl font-bold text-gray-800">Panel de Administración</h1>

        {/* Info del usuario y botón de cerrar sesión */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-700">
              {nombre}
            </p>
            <p className="text-xs text-gray-500">
              {rol}
            </p>
          </div>

          <img
            src={fotoPerfil}
            alt={`Foto de perfil de ${nombre}`}
            className="w-10 h-10 rounded-full border border-gray-300 object-cover"
            onError={(e) => {
              e.target.src = 'https://ui-avatars.com/api/?name=Usuario&background=e2e8f0&color=1a202c';
            }}
          />

          <button
            onClick={handleLogout}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;