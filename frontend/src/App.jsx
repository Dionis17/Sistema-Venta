import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Home from './pages/Home';
import Productos from './pages/Productos';
import Carrito from './pages/Carrito';
import Sidebar from './component/Sidebar';
import Navbar from './component/Navbar';

function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) setToken(storedToken);
  }, []);

  const handleLogin = (receivedToken) => {
    localStorage.setItem('token', receivedToken);
    setToken(receivedToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        {!token ? (
          <>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        ) : (
          <>
            {/* Layout para rutas privadas */}
            <Route
              path="/"
              element={
                <div className="flex h-screen flex-col">
                  <Navbar onLogout={handleLogout} />
                  <div className="flex flex-1 overflow-hidden">
                    <Sidebar onLogout={handleLogout} />
                    <main className="flex-1 overflow-auto p-6">
                      <Home />
                    </main>
                  </div>
                </div>
              }
            />
            <Route
              path="/productos"
              element={
                <div className="flex h-screen flex-col">
                  <Navbar onLogout={handleLogout} />
                  <div className="flex flex-1 overflow-hidden">
                    <Sidebar onLogout={handleLogout} />
                    <main className="flex-1 overflow-auto p-6">
                      <Productos />
                    </main>
                  </div>
                </div>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />

            <Route
              path="/Carrito"
              element={
                <div className="flex h-screen flex-col">
                  <Navbar onLogout={handleLogout} />
                  <div className="flex flex-1 overflow-hidden">
                    <Sidebar onLogout={handleLogout} />
                    <main className="flex-1 overflow-auto p-6">
                      <Carrito />
                    </main>
                  </div>
                </div>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </>
          
        )}
      </Routes>
    </Router>
  );
}

export default App;