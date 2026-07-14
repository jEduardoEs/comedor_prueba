"use client";

import { useEffect, useState } from "react";

type Item = {
  id: string;
  nombre: string;
  unidad: string;
  stockActual: string;
  stockMinimo: string;
};

export default function InventarioPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [nombre, setNombre] = useState("");
  const [unidad, setUnidad] = useState("unidad");
  const [stockActual, setStockActual] = useState("");
  const [stockMinimo, setStockMinimo] = useState("");
  const [movCantidad, setMovCantidad] = useState<Record<string, string>>({});

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    const data = await fetch("/api/inventario").then((r) => r.json());
    setItems(data);
  }

  async function crearItem(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre) return;
    await fetch("/api/inventario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre,
        unidad,
        stockActual: Number(stockActual) || 0,
        stockMinimo: Number(stockMinimo) || 0,
      }),
    });
    setNombre("");
    setStockActual("");
    setStockMinimo("");
    cargar();
  }

  async function registrarMovimiento(id: string, tipo: "ENTRADA" | "SALIDA") {
    const cantidad = Number(movCantidad[id]);
    if (!cantidad) return;
    await fetch(`/api/inventario/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo, cantidad, motivo: "Ajuste manual" }),
    });
    setMovCantidad((prev) => ({ ...prev, [id]: "" }));
    cargar();
  }

  return (
    <div>
      <h2 className="mb-6 font-display text-2xl text-brasa-200">Inventario</h2>

      <form
        onSubmit={crearItem}
        className="mb-6 grid grid-cols-1 gap-2 rounded-2xl border border-carbon-700 bg-carbon-800 p-5 sm:grid-cols-5"
      >
        <input
          className="rounded-lg border border-carbon-600 bg-carbon-900 px-3 py-2 text-sm text-white sm:col-span-2"
          placeholder="Nombre del insumo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <input
          className="rounded-lg border border-carbon-600 bg-carbon-900 px-3 py-2 text-sm text-white"
          placeholder="Unidad (kg, lb, unidad)"
          value={unidad}
          onChange={(e) => setUnidad(e.target.value)}
        />
        <input
          className="rounded-lg border border-carbon-600 bg-carbon-900 px-3 py-2 text-sm text-white"
          placeholder="Stock inicial"
          type="number"
          value={stockActual}
          onChange={(e) => setStockActual(e.target.value)}
        />
        <input
          className="rounded-lg border border-carbon-600 bg-carbon-900 px-3 py-2 text-sm text-white"
          placeholder="Stock mínimo"
          type="number"
          value={stockMinimo}
          onChange={(e) => setStockMinimo(e.target.value)}
        />
        <button className="rounded-lg bg-brasa-500 py-2 text-sm font-semibold text-white hover:bg-brasa-400 sm:col-span-5">
          Agregar insumo
        </button>
      </form>

      <div className="rounded-2xl border border-carbon-700 bg-carbon-800 p-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-carbon-600">
              <th className="pb-2">Insumo</th>
              <th className="pb-2">Stock actual</th>
              <th className="pb-2">Mínimo</th>
              <th className="pb-2">Movimiento</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => {
              const bajo = Number(it.stockActual) <= Number(it.stockMinimo);
              return (
                <tr key={it.id} className="border-t border-carbon-700">
                  <td className="py-2 text-white">{it.nombre}</td>
                  <td className={`py-2 ${bajo ? "text-red-700" : "text-white"}`}>
                    {Number(it.stockActual).toFixed(2)} {it.unidad}
                    {bajo && <span className="ml-2 text-xs">(bajo stock)</span>}
                  </td>
                  <td className="py-2 text-carbon-600">
                    {Number(it.stockMinimo).toFixed(2)} {it.unidad}
                  </td>
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        className="w-20 rounded-lg border border-carbon-600 bg-carbon-900 px-2 py-1 text-xs text-white"
                        value={movCantidad[it.id] || ""}
                        onChange={(e) =>
                          setMovCantidad((prev) => ({ ...prev, [it.id]: e.target.value }))
                        }
                        placeholder="Cant."
                      />
                      <button
                        onClick={() => registrarMovimiento(it.id, "ENTRADA")}
                        className="rounded-lg bg-green-600/15 px-2 py-1 text-xs text-green-700 hover:bg-green-600/25"
                      >
                        + Entrada
                      </button>
                      <button
                        onClick={() => registrarMovimiento(it.id, "SALIDA")}
                        className="rounded-lg bg-red-600/15 px-2 py-1 text-xs text-red-700 hover:bg-red-600/25"
                      >
                        − Salida
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
