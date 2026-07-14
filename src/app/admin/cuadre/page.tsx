"use client";

import { useEffect, useState } from "react";

type Cuadre = {
  id: string;
  fecha: string;
  totalEfectivo: string;
  totalTarjeta: string;
  totalTransfer: string;
  totalGeneral: string;
  usuario: { nombre: string };
};

export default function CuadrePage() {
  const [cuadres, setCuadres] = useState<Cuadre[]>([]);

  useEffect(() => {
    fetch("/api/cuadre")
      .then((r) => r.json())
      .then(setCuadres);
  }, []);

  return (
    <div>
      <h2 className="mb-6 font-display text-2xl text-brasa-200">Cuadre de caja</h2>
      <div className="rounded-2xl border border-carbon-700 bg-carbon-800 p-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-carbon-600">
              <th className="pb-2">Fecha</th>
              <th className="pb-2">Cajero</th>
              <th className="pb-2">Efectivo</th>
              <th className="pb-2">Tarjeta</th>
              <th className="pb-2">Transferencia</th>
              <th className="pb-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {cuadres.map((c) => (
              <tr key={c.id} className="border-t border-carbon-700">
                <td className="py-2 text-white">{new Date(c.fecha).toLocaleDateString("es-GT")}</td>
                <td className="py-2 text-carbon-600">{c.usuario.nombre}</td>
                <td className="py-2 text-white">Q{Number(c.totalEfectivo).toFixed(2)}</td>
                <td className="py-2 text-white">Q{Number(c.totalTarjeta).toFixed(2)}</td>
                <td className="py-2 text-white">Q{Number(c.totalTransfer).toFixed(2)}</td>
                <td className="py-2 font-semibold text-brasa-200">Q{Number(c.totalGeneral).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
