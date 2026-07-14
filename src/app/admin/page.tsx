"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

type Stats = {
  totalVentas: number;
  numeroVentas: number;
  serie: { fecha: string; total: number }[];
  productosMasVendidos: { nombre: string; cantidad: number; total: number }[];
};

export default function DashboardPage() {
  const [rango, setRango] = useState<"semana" | "mes">("semana");
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch(`/api/dashboard/stats?rango=${rango}`)
      .then((r) => r.json())
      .then(setStats);
  }, [rango]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-2xl text-brasa-200">Panel de ventas</h2>
        <div className="flex gap-2">
          {(["semana", "mes"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRango(r)}
              className={`rounded-full px-4 py-1.5 text-sm ${
                rango === r ? "bg-brasa-500 text-carbon-900" : "bg-carbon-800 text-carbon-600"
              }`}
            >
              {r === "semana" ? "Última semana" : "Último mes"}
            </button>
          ))}
        </div>
      </div>

      {!stats ? (
        <p className="text-carbon-600">Cargando...</p>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-carbon-700 bg-carbon-800 p-5">
              <p className="text-sm text-carbon-600">Ventas totales</p>
              <p className="font-display text-3xl text-brasa-200">Q{stats.totalVentas.toFixed(2)}</p>
            </div>
            <div className="rounded-2xl border border-carbon-700 bg-carbon-800 p-5">
              <p className="text-sm text-carbon-600">Número de órdenes cobradas</p>
              <p className="font-display text-3xl text-brasa-200">{stats.numeroVentas}</p>
            </div>
          </div>

          <div className="mb-6 rounded-2xl border border-carbon-700 bg-carbon-800 p-5">
            <p className="mb-4 text-sm text-carbon-600">Ventas por día</p>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={stats.serie}>
                <CartesianGrid stroke="#3c332c" strokeDasharray="3 3" />
                <XAxis dataKey="fecha" stroke="#8a7f74" fontSize={12} />
                <YAxis stroke="#8a7f74" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: "#211c19", border: "1px solid #3c332c", color: "#fff" }}
                />
                <Line type="monotone" dataKey="total" stroke="#d97b2e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl border border-carbon-700 bg-carbon-800 p-5">
            <p className="mb-4 text-sm text-carbon-600">Productos más vendidos</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-carbon-600">
                  <th className="pb-2">Producto</th>
                  <th className="pb-2">Cantidad</th>
                  <th className="pb-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {stats.productosMasVendidos.map((p) => (
                  <tr key={p.nombre} className="border-t border-carbon-700">
                    <td className="py-2 text-white">{p.nombre}</td>
                    <td className="py-2 text-white">{p.cantidad}</td>
                    <td className="py-2 text-white">Q{p.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
