"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Mesa = {
  id: string;
  numero: number;
  estado: "LIBRE" | "OCUPADA";
  ordenes: { id: string; total: string }[];
};

export default function CajaPage() {
  const router = useRouter();
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch("/api/mesas")
      .then((r) => r.json())
      .then((data) => {
        setMesas(data);
        setCargando(false);
      });
  }, []);

  async function cerrarSesion() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-carbon-900 p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl text-brasa-200">Selecciona una mesa</h1>
        <button
          onClick={cerrarSesion}
          className="rounded-lg border border-carbon-600 px-4 py-2 text-sm text-carbon-600 hover:text-brasa-200"
        >
          Cerrar sesión
        </button>
      </div>

      {cargando ? (
        <p className="text-carbon-600">Cargando mesas...</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {mesas.map((mesa) => {
            const ocupada = mesa.estado === "OCUPADA";
            return (
              <button
                key={mesa.id}
                onClick={() => router.push(`/caja/${mesa.id}`)}
                className={`flex aspect-square flex-col items-center justify-center rounded-2xl border text-lg font-semibold transition ${
                  ocupada
                    ? "border-brasa-500 bg-brasa-500/10 text-brasa-200"
                    : "border-carbon-700 bg-carbon-800 text-white hover:border-brasa-500"
                }`}
              >
                <span className="text-3xl font-display">{mesa.numero}</span>
                <span className="mt-1 text-xs uppercase tracking-wide opacity-70">
                  {ocupada ? "Ocupada" : "Libre"}
                </span>
                {ocupada && mesa.ordenes[0] && (
                  <span className="mt-1 text-xs text-brasa-200">
                    Q{Number(mesa.ordenes[0].total).toFixed(2)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </main>
  );
}
