// Archivo: src/components/MainLayout.jsx

import React from 'react';
import Navbar from './Navbar'; // Asegúrate de que esta ruta sea correcta
import Sidebar from './Sidebar'; // Asegúrate de que esta ruta sea correcta

/**
 * Componente de layout principal que envuelve las páginas privadas.
 * Proporciona la estructura de Navbar, Sidebar y un área de contenido principal con scroll.
 * @param {object} props - Las props del componente.
 * @param {React.ReactNode} props.children - El contenido (página) a renderizar dentro del layout.
 * @param {function} props.onLogout - Función para manejar el cierre de sesión.
 */
function MainLayout({ children, onLogout }) {
  return (
    <div className="flex h-screen flex-col">
      <Navbar onLogout={onLogout} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onLogout={onLogout} />
        {/* El área principal de contenido:
            - flex-1: Ocupa todo el espacio horizontal restante.
            - overflow-auto: Permite scroll interno si el contenido excede la altura.
            - p-6: Añade padding alrededor del contenido de la página. */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;