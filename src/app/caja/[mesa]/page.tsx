"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Producto = {
  id: string;
  nombre: string;
  precio: string;
  activo: boolean;
  categoriaId: string;
  categoria: { id: string; nombre: string; orden: number };
};

type Categoria = { id: string; nombre: string; orden: number };

type OrdenItem = {
  id: string;
  cantidad: number;
  precioUnitario: string;
  producto: { id: string; nombre: string };
};

type Orden = {
  id: string;
  total: string;
  items: OrdenItem[];
  mesa: { numero: number };
};

const METODOS_PAGO = [
  { valor: "EFECTIVO", label: "Efectivo" },
  { valor: "TARJETA", label: "Tarjeta" },
  { valor: "TRANSFERENCIA", label: "Transferencia" },
] as const;

export default function PosMesaPage() {
  const params = useParams<{ mesa: string }>();
  const router = useRouter();
  const mesaId = params.mesa;

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [orden, setOrden] = useState<Orden | null>(null);
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);
  const [modalCobro, setModalCobro] = useState(false);
  const [metodoPago, setMetodoPago] = useState<string>("EFECTIVO");
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    cargarTodo();
  }, [mesaId]);

  async function cargarTodo() {
    const [catRes, prodRes, ordenRes] = await Promise.all([
      fetch("/api/categorias").then((r) => r.json()),
      fetch("/api/productos").then((r) => r.json()),
      fetch(`/api/ordenes?mesaId=${mesaId}`).then((r) => r.json()),
    ]);
    setCategorias(catRes);
    setCategoriaActiva(catRes[0]?.id ?? null);
    setProductos(prodRes.filter((p: Producto) => p.activo));
    setOrden(ordenRes);
  }

  const productosVisibles = useMemo(
    () => productos.filter((p) => p.categoriaId === categoriaActiva),
    [productos, categoriaActiva]
  );

  async function agregarProducto(productoId: string) {
    if (!orden) return;
    const res = await fetch("/api/ordenes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ordenId: orden.id, productoId, cantidad: 1 }),
    });
    const data = await res.json();
    setOrden(data);
  }

  async function cambiarCantidad(itemId: string, nuevaCantidad: number) {
    const res = await fetch(`/api/ordenes/item/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cantidad: nuevaCantidad }),
    });
    const data = await res.json();
    setOrden(data);
  }

  async function cobrar() {
    if (!orden) return;
    setProcesando(true);
    try {
      const res = await fetch(`/api/ordenes/${orden.id}/cobrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metodoPago }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "No se pudo cobrar la orden");
        return;
      }
      setModalCobro(false);
      router.push("/caja");
    } finally {
      setProcesando(false);
    }
  }

  const total = orden ? Number(orden.total) : 0;

  return (
    <main className="flex min-h-screen flex-col bg-carbon-900 md:flex-row">
      {/* Menú */}
      <section className="flex-1 p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <button onClick={() => router.push("/caja")} className="text-sm text-carbon-600 hover:text-brasa-200">
            ← Mesas
          </button>
          <h1 className="font-display text-2xl text-brasa-200">Mesa {orden?.mesa.numero ?? "..."}</h1>
          <span />
        </div>

        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {categorias.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoriaActiva(c.id)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                categoriaActiva === c.id
                  ? "bg-brasa-500 text-white"
                  : "bg-carbon-800 text-carbon-600 hover:text-brasa-200"
              }`}
            >
              {c.nombre}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {productosVisibles.map((p) => (
            <button
              key={p.id}
              onClick={() => agregarProducto(p.id)}
              className="flex flex-col items-start rounded-xl border border-carbon-700 bg-carbon-800 p-3 text-left transition hover:border-brasa-500"
            >
              <span className="font-medium text-white">{p.nombre}</span>
              <span className="mt-1 text-brasa-200">Q{Number(p.precio).toFixed(2)}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Orden actual */}
      <aside className="flex w-full flex-col border-t border-carbon-700 bg-carbon-800 p-4 md:w-96 md:border-l md:border-t-0">
        <h2 className="mb-3 font-display text-xl text-brasa-200">Orden actual</h2>

        <div className="flex-1 space-y-2 overflow-y-auto">
          {orden?.items.length === 0 && (
            <p className="text-sm text-carbon-600">Selecciona productos del menú para agregarlos aquí.</p>
          )}
          {orden?.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-lg bg-carbon-900 px-3 py-2">
              <div>
                <p className="text-sm font-medium text-white">{item.producto.nombre}</p>
                <p className="text-xs text-carbon-600">Q{Number(item.precioUnitario).toFixed(2)} c/u</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => cambiarCantidad(item.id, item.cantidad - 1)}
                  className="h-7 w-7 rounded-full bg-carbon-700 text-white hover:bg-carbon-600"
                >
                  −
                </button>
                <span className="w-5 text-center text-white">{item.cantidad}</span>
                <button
                  onClick={() => cambiarCantidad(item.id, item.cantidad + 1)}
                  className="h-7 w-7 rounded-full bg-carbon-700 text-white hover:bg-carbon-600"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t border-carbon-700 pt-4">
          <div className="mb-3 flex items-center justify-between text-lg">
            <span className="text-carbon-600">Total</span>
            <span className="font-display text-2xl text-brasa-200">Q{total.toFixed(2)}</span>
          </div>
          <button
            disabled={!orden || orden.items.length === 0}
            onClick={() => setModalCobro(true)}
            className="w-full rounded-lg bg-brasa-500 py-3 font-semibold text-white transition hover:bg-brasa-400 disabled:opacity-40"
          >
            Cobrar
          </button>
        </div>
      </aside>

      {modalCobro && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-carbon-700 bg-carbon-800 p-6">
            <h3 className="mb-4 font-display text-xl text-brasa-200">Método de pago</h3>
            <div className="mb-6 space-y-2">
              {METODOS_PAGO.map((m) => (
                <label
                  key={m.valor}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3 ${
                    metodoPago === m.valor ? "border-brasa-500 bg-brasa-500/10" : "border-carbon-600"
                  }`}
                >
                  <span className="text-white">{m.label}</span>
                  <input
                    type="radio"
                    name="metodoPago"
                    value={m.valor}
                    checked={metodoPago === m.valor}
                    onChange={() => setMetodoPago(m.valor)}
                  />
                </label>
              ))}
            </div>
            <div className="mb-4 flex justify-between text-lg">
              <span className="text-carbon-600">Total a cobrar</span>
              <span className="font-display text-brasa-200">Q{total.toFixed(2)}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setModalCobro(false)}
                className="flex-1 rounded-lg border border-carbon-600 py-2 text-carbon-600"
              >
                Cancelar
              </button>
              <button
                onClick={cobrar}
                disabled={procesando}
                className="flex-1 rounded-lg bg-brasa-500 py-2 font-semibold text-white hover:bg-brasa-400 disabled:opacity-60"
              >
                {procesando ? "Procesando..." : "Confirmar cobro"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
