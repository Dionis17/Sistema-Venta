// src/AppLayout.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './component/Sidebar';
import Productos from './pages/Productos';

function AppLayout() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/productos" element={<Productos />} />
        </Routes>
      </main>
    </div>
  );
}

export default AppLayout;
