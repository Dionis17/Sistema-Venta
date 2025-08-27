import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  AiFillHome,
  AiOutlineShoppingCart,
  AiOutlineAppstore,
  AiOutlineUser,
  AiOutlineFileDone,
  AiOutlineFolderOpen,
  AiOutlineTeam,
  AiOutlineTruck,
  AiOutlineMenu
} from "react-icons/ai";

const menuItems = [
  { name: "Inicio", icon: AiFillHome, path: "/" },
  { name: "Ventas", icon: AiOutlineShoppingCart, path: "/Carrito" },
  { name: "Productos", icon: AiOutlineAppstore, path: "/agrupado" },
  { name: "Clientes", icon: AiOutlineUser, path: "/clientes" },
  { name: "Usuarios", icon: AiOutlineTeam, path: "/Usuarios" },
  { name: "Proveedores", icon: AiOutlineTruck, path: "/proveedor" },
  { name: "Cuadre de caja", icon: AiOutlineFileDone, path: "/cuadre" },
  { name: "Cuadres guardados", icon: AiOutlineFolderOpen, path: "/cuadres-guardados" },
];

function Sidebar({ children }) {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Cerrar sidebar en móvil al hacer clic en un enlace
  const handleLinkClick = () => {
    if (isMobile) setSidebarOpen(false);
  };

  return (
    <div className="flex">
      {/* Botón hamburguesa solo en móvil */}
      {isMobile && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-3 fixed top-4 left-4 z-50 bg-blue-600 text-white rounded-lg shadow-md"
        >
          <AiOutlineMenu size={24} />
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm z-40
          ${isMobile 
            ? `transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`
            : "translate-x-0"
          }
        `}
      >
        <div className="p-6 text-2xl font-extrabold text-blue-600 border-b border-gray-200 tracking-tight">
          DW Sistem
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map(({ name, icon: Icon, path }) => (
            <NavLink
              key={name}
              to={path}
              onClick={handleLinkClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium text-sm ${
                  isActive
                    ? "bg-blue-100 text-blue-700 font-semibold"
                    : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                }`
              }
            >
              <Icon size={20} />
              <span>{name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Fondo semitransparente cuando el sidebar está abierto en móvil */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Contenido principal */}
      <main className={`flex-1 min-h-screen bg-gray-50 p-4 ${!isMobile ? "ml-64" : ""}`}>
        {children}
      </main>
    </div>
  );
}

export default Sidebar;
