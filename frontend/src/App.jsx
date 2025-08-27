import React, { createContext, useState, useEffect, useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Productos from "./pages/Productos";
import Clientes from "./pages/clientes"; // ✅ Importar componente Clientes // Nueva página clientes
import Carrito from "./pages/Carrito";
import Usuario from "./pages/Usuarios";
import Credito from "./pages/credito";
import MainLayout from "./component/MainLayout";
import Proveedor from "./pages/Proveedor";
import Cuadre from "./pages/Cuadres";
import Agrupado from "./pages/productoAgrupado";

// --- Contexto de Autenticación ---
const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

function AuthProvider({ children }) {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) setToken(storedToken);
  }, []);

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  const value = { token, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// --- Componente para proteger rutas privadas ---
function PrivateRoute({ children }) {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

function AppRoutes() {
  const { token, logout } = useAuth();

  // Rutas públicas (solo login)
  if (!token) {
    return (
      <Routes>
        <Route
          path="/login"
          element={
            <Login
              onLogin={(token) => {
                localStorage.setItem("token", token);
              }}
            />
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Rutas privadas
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PrivateRoute>
            <MainLayout onLogout={logout}>
              <Home />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/productos"
        element={
          <PrivateRoute>
            <MainLayout onLogout={logout}>
              <Productos />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/clientes"
        element={
          <PrivateRoute>
            <MainLayout onLogout={logout}>
              <Clientes />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/Usuarios"
        element={
          <PrivateRoute>
            <MainLayout onLogout={logout}>
              <Usuario />
            </MainLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/creditos"
        element={
          <PrivateRoute>
            <MainLayout onLogout={logout}>
              <Credito />
            </MainLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/carrito"
        element={
          <PrivateRoute>
            <MainLayout onLogout={logout}>
              <Carrito />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/proveedor"
        element={
          <PrivateRoute>
            <MainLayout onLogout={logout}>
              <Proveedor />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/cuadre"
        element={
          <PrivateRoute>
            <MainLayout onLogout={logout}>
              <Cuadre />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/agrupado"
        element={
          <PrivateRoute>
            <MainLayout onLogout={logout}>
              <Agrupado />{" "}
              {/* Este es tu formulario o componente de productos agrupados */}
            </MainLayout>
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
