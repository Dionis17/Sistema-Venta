// src/pages/Home.jsx
import React from 'react';
import Sidebar from '../component/Sidebar';
import Navbar from '../component/Navbar';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const productosMasVendidos = [
  { name: 'Cerveza', value: 400 },
  { name: 'Agua', value: 300 },
  { name: 'Ron', value: 300 },
  { name: 'Vino', value: 200 },
];

const ventasPorDia = [
  { dia: 'Lunes', ventas: 2400 },
  { dia: 'Martes', ventas: 1398 },
  { dia: 'Miércoles', ventas: 9800 },
  { dia: 'Jueves', ventas: 3908 },
  { dia: 'Viernes', ventas: 4800 },
  { dia: 'Sábado', ventas: 3800 },
  { dia: 'Domingo', ventas: 4300 },
];

const COLORS = ['#4ade80', '#60a5fa', '#c084fc', '#facc15'];

function Home() {
  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-8">
          <header className="mb-8">
            <p className="text-gray-600 mt-2">Resumen general de la actividad reciente</p>
          </header>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Ventas del día
              </h2>
              <p className="mt-4 text-3xl font-semibold text-green-600">$12,450</p>
              <p className="mt-1 text-sm text-gray-400">Comparado con ayer +12%</p>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Productos en stock
              </h2>
              <p className="mt-4 text-3xl font-semibold text-blue-600">326</p>
              <p className="mt-1 text-sm text-gray-400">Disponible para la venta</p>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Clientes registrados
              </h2>
              <p className="mt-4 text-3xl font-semibold text-purple-600">87</p>
              <p className="mt-1 text-sm text-gray-400">Nuevos en el último mes</p>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Pedidos pendientes
              </h2>
              <p className="mt-4 text-3xl font-semibold text-yellow-500">14</p>
              <p className="mt-1 text-sm text-gray-400">Por procesar</p>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Gráfico de pastel */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Productos más vendidos</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={productosMasVendidos}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label
                  >
                    {productosMasVendidos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico de barras */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Ventas por día</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ventasPorDia}>
                  <XAxis dataKey="dia" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="ventas" fill="#60a5fa" barSize={40} radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Home;
