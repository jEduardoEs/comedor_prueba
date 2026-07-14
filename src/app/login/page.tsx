"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo iniciar sesión");
        return;
      }
      router.push(data.rol === "ADMIN" ? "/admin" : "/caja");
      router.refresh();
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-carbon-900 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-4xl text-brasa-200">Comanda</h1>
          <p className="mt-1 text-sm text-carbon-600 text-opacity-80">Sistema de ventas del restaurante</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-carbon-700 bg-carbon-800 p-6 shadow-xl"
        >
          <label className="mb-1 block text-xs uppercase tracking-wide text-brasa-200/70">
            Usuario
          </label>
          <input
            className="mb-4 w-full rounded-lg border border-carbon-600 bg-carbon-900 px-3 py-2 text-sm text-white outline-none focus:border-brasa-500"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            placeholder="admin o caja1"
            autoFocus
          />

          <label className="mb-1 block text-xs uppercase tracking-wide text-brasa-200/70">
            Contraseña
          </label>
          <input
            type="password"
            className="mb-4 w-full rounded-lg border border-carbon-600 bg-carbon-900 px-3 py-2 text-sm text-white outline-none focus:border-brasa-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          {error && <p className="mb-3 text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={cargando}
            className="w-full rounded-lg bg-brasa-500 py-2 font-semibold text-white transition hover:bg-brasa-400 disabled:opacity-60"
          >
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </main>
  );
}
