import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { motion } from 'framer-motion';
import {
  FaCashRegister,
  FaBoxes,
  FaUsers,
  FaClipboardList
} from 'react-icons/fa';

// Datos de ejemplo
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

const resumenData = [
  {
    label: 'Ventas del día',
    value: '$12,450',
    color: 'text-green-600',
    subtitle: 'Comparado con ayer +12%',
    icon: <FaCashRegister className="text-3xl text-green-500" />,
  },
  {
    label: 'Productos en stock',
    value: '326',
    color: 'text-blue-600',
    subtitle: 'Disponible para la venta',
    icon: <FaBoxes className="text-3xl text-blue-500" />,
  },
  {
    label: 'Clientes registrados',
    value: '87',
    color: 'text-purple-600',
    subtitle: 'Nuevos en el último mes',
    icon: <FaUsers className="text-3xl text-purple-500" />,
  },
  {
    label: 'Pedidos pendientes',
    value: '14',
    color: 'text-yellow-500',
    subtitle: 'Por procesar',
    icon: <FaClipboardList className="text-3xl text-yellow-500" />,
  },
];

function Home() {
  return (
    <main className="min-h-screen w-full bg-gray-50 p-8 font-sans text-gray-800">
      <header className="mb-8">
        <h2 className="text-2xl font-bold">Panel de Resumen</h2>
        <p className="text-gray-600 mt-2">Resumen general de la actividad reciente</p>
      </header>

      {/* Tarjetas de resumen */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {resumenData.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2, duration: 0.6 }}
            className="bg-white shadow-md rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                {card.label}
              </h2>
              {card.icon}
            </div>
            <p className={`mt-4 text-3xl font-semibold ${card.color}`}>{card.value}</p>
            <p className="mt-1 text-sm text-gray-400">{card.subtitle}</p>
          </motion.div>
        ))}
      </section>

      {/* Gráficos */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de pastel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
        >
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
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {productosMasVendidos.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Gráfico de barras */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
        >
          <h3 className="text-lg font-semibold mb-4">Ventas por día</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ventasPorDia}>
              <XAxis dataKey="dia" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="ventas"
                fill="#60a5fa"
                barSize={40}
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </section>
    </main>
  );
}

export default Home;
