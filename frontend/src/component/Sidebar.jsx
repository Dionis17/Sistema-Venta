// src/components/Sidebar.jsx
import React from 'react';
import {
  AiFillHome,
  AiOutlineShoppingCart,
  AiOutlineAppstore,
  AiOutlineUser
} from "react-icons/ai";

const menuItems = [
  { name: 'Inicio', icon: <AiFillHome size={22} /> },
  { name: 'Ventas', icon: <AiOutlineShoppingCart size={22} /> },
  { name: 'Productos', icon: <AiOutlineAppstore size={22} /> },
  { name: 'Clientes', icon: <AiOutlineUser size={22} /> },
];

function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="p-6 text-xl font-bold text-gray-900 border-b border-gray-200">
        DW sistem
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map(({ name, icon }) => (
          <a
            key={name}
            href="#"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-colors"
          >
            {icon}
            <span className="font-medium">{name}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
