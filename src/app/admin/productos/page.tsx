"use client";

import { useEffect, useState } from "react";

type Categoria = { id: string; nombre: string };
type Producto = {
  id: string;
  nombre: string;
  precio: string;
  activo: boolean;
  categoriaId: string;
  categoria: Categoria;
};

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [nuevaCategoria, setNuevaCategoria] = useState("");

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    const [p, c] = await Promise.all([
      fetch("/api/productos").then((r) => r.json()),
      fetch("/api/categorias").then((r) => r.json()),
    ]);
    setProductos(p);
    setCategorias(c);
    if (!categoriaId && c[0]) setCategoriaId(c[0].id);
  }

  async function crearProducto(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre || !precio || !categoriaId) return;
    await fetch("/api/productos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, precio: Number(precio), categoriaId }),
    });
    setNombre("");
    setPrecio("");
    cargar();
  }

  async function crearCategoria(e: React.FormEvent) {
    e.preventDefault();
    if (!nuevaCategoria) return;
    await fetch("/api/categorias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: nuevaCategoria }),
    });
    setNuevaCategoria("");
    cargar();
  }

  async function alternarActivo(p: Producto) {
    if (p.activo) {
      await fetch(`/api/productos/${p.id}`, { method: "DELETE" });
    } else {
      await fetch(`/api/productos/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...p, activo: true }),
      });
    }
    cargar();
  }

  return (
    <div>
      <h2 className="mb-6 font-display text-2xl text-brasa-200">Productos y categorías</h2>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <form onSubmit={crearProducto} className="rounded-2xl border border-carbon-700 bg-carbon-800 p-5">
          <p className="mb-3 text-sm text-carbon-600">Agregar nuevo producto</p>
          <input
            className="mb-2 w-full rounded-lg border border-carbon-600 bg-carbon-900 px-3 py-2 text-sm text-white"
            placeholder="Nombre del producto"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <input
            className="mb-2 w-full rounded-lg border border-carbon-600 bg-carbon-900 px-3 py-2 text-sm text-white"
            placeholder="Precio"
            type="number"
            step="0.01"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
          />
          <select
            className="mb-3 w-full rounded-lg border border-carbon-600 bg-carbon-900 px-3 py-2 text-sm text-white"
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
          >
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
          <button className="w-full rounded-lg bg-brasa-500 py-2 font-semibold text-carbon-900 hover:bg-brasa-400">
            Agregar producto
          </button>
        </form>

        <form onSubmit={crearCategoria} className="rounded-2xl border border-carbon-700 bg-carbon-800 p-5">
          <p className="mb-3 text-sm text-carbon-600">Agregar nueva categoría</p>
          <input
            className="mb-3 w-full rounded-lg border border-carbon-600 bg-carbon-900 px-3 py-2 text-sm text-white"
            placeholder="Nombre de la categoría (ej. Postres)"
            value={nuevaCategoria}
            onChange={(e) => setNuevaCategoria(e.target.value)}
          />
          <button className="w-full rounded-lg border border-brasa-500 py-2 font-semibold text-brasa-200 hover:bg-brasa-500/10">
            Agregar categoría
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-carbon-700 bg-carbon-800 p-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-carbon-600">
              <th className="pb-2">Producto</th>
              <th className="pb-2">Categoría</th>
              <th className="pb-2">Precio</th>
              <th className="pb-2">Estado</th>
              <th className="pb-2"></th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.id} className="border-t border-carbon-700">
                <td className="py-2 text-white">{p.nombre}</td>
                <td className="py-2 text-carbon-600">{p.categoria.nombre}</td>
                <td className="py-2 text-white">Q{Number(p.precio).toFixed(2)}</td>
                <td className="py-2">
                  <span className={p.activo ? "text-green-400" : "text-carbon-600"}>
                    {p.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="py-2 text-right">
                  <button
                    onClick={() => alternarActivo(p)}
                    className="text-xs text-brasa-200 underline underline-offset-2"
                  >
                    {p.activo ? "Quitar de caja" : "Reactivar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
