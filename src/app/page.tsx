import { redirect } from "next/navigation";
import { obtenerSesion } from "@/lib/auth";

export default async function Home() {
  const sesion = await obtenerSesion();
  if (!sesion) redirect("/login");
  redirect(sesion.rol === "ADMIN" ? "/admin" : "/caja");
}
