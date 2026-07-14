"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  async function salir() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }
  return (
    <button onClick={salir} className="text-sm text-carbon-600 hover:text-brasa-200">
      Cerrar sesión
    </button>
  );
}
