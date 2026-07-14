import Link from "next/link";
import { obtenerSesion } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const sesion = await obtenerSesion();

  return (
    <div className="min-h-screen bg-carbon-900 md:flex">
      <nav className="flex items-center justify-between border-b border-carbon-700 bg-carbon-800 p-4 md:block md:w-56 md:border-b-0 md:border-r md:p-6">
        <div>
          <h1 className="font-display text-2xl text-brasa-200">Admin</h1>
          <p className="mb-6 text-xs text-carbon-600">{sesion?.nombre}</p>
        </div>
        <div className="flex gap-4 md:block md:space-y-2">
          <Link href="/admin" className="block text-sm text-carbon-600 hover:text-brasa-200">
            Dashboard
          </Link>
          <Link href="/admin/productos" className="block text-sm text-carbon-600 hover:text-brasa-200">
            Productos
          </Link>
          <Link href="/admin/inventario" className="block text-sm text-carbon-600 hover:text-brasa-200">
            Inventario
          </Link>
          <Link href="/admin/cuadre" className="block text-sm text-carbon-600 hover:text-brasa-200">
            Cuadre de caja
          </Link>
        </div>
        <div className="hidden md:mt-10 md:block">
          <LogoutButton />
        </div>
      </nav>
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
