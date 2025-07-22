import React from 'react';
import { useNavigate } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate('/login');
  };

  const fotoPerfil = user?.foto || `https://ui-avatars.com/api/?name=${user?.nombre || 'Usuario'}`;

  return (
    <header className="bg-white shadow px-4 sm:px-6 py-4 w-full">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Título del panel */}
        <h1 className="text-xl font-bold text-gray-800">Panel de Administración</h1>

        {/* Info del usuario y botón */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-700">
              {user?.nombre || 'Usuario'}
            </p>
            <p className="text-xs text-gray-500">
              {user?.rol || 'Rol'}
            </p>
          </div>

          <img
            src={fotoPerfil}
            alt={`Foto de perfil de ${user?.nombre || 'Usuario'}`}
            className="w-10 h-10 rounded-full border border-gray-300 object-cover"
            onError={(e) => e.target.src = 'https://ui-avatars.com/api/?name=Usuario'}
          />

          <button
            onClick={handleLogout}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition text-sm"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
