import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  AiFillHome,
  AiOutlineShoppingCart,
  AiOutlineAppstore,
  AiOutlineUser,
  AiOutlineFileDone,
  AiOutlineFolderOpen,
  AiOutlineTeam,
  AiOutlineTruck
} from "react-icons/ai";

const menuItems = [
  { name: 'Inicio', icon: AiFillHome, path: '/' },
  { name: 'Ventas', icon: AiOutlineShoppingCart, path: '/Carrito' },
  { name: 'Productos', icon: AiOutlineAppstore, path: '/productos' },
  { name: 'Clientes', icon: AiOutlineUser, path: '/clientes' },
  { name: 'Usuarios', icon: AiOutlineTeam, path: '/Usuarios' },
  { name: 'Proveedores', icon: AiOutlineTruck, path: '/proveedores' },
  { name: 'Cuadre de caja', icon: AiOutlineFileDone, path: '/cuadre-formulario' },
  { name: 'Cuadres guardados', icon: AiOutlineFolderOpen, path: '/cuadres-guardados' },
];

function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col shadow-sm">
      <div className="p-6 text-2xl font-extrabold text-blue-600 border-b border-gray-200 tracking-tight">
        DW Sistem
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map(({ name, icon: Icon, path }) => (
          <NavLink
            key={name}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium text-sm ${
                isActive
                  ? 'bg-blue-100 text-blue-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
              }`
            }
          >
            <Icon size={20} />
            <span>{name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
