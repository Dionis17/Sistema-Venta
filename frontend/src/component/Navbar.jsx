// src/components/Navbar.jsx
import React from 'react';

function Navbar() {
  return (
    <header className="bg-white shadow px-6 py-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Panel de Administración</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600">
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}

export default Navbar;
