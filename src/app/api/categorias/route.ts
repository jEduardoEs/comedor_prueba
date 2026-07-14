import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/auth";

export async function GET() {
  const sesion = await obtenerSesion();
  if (!sesion) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const categorias = await prisma.categoria.findMany({ orderBy: { orden: "asc" } });
  return NextResponse.json(categorias);
}

export async function POST(req: NextRequest) {
  const sesion = await obtenerSesion();
  if (!sesion || sesion.rol !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const body = await req.json();
  const categoria = await prisma.categoria.create({
    data: { nombre: body.nombre, orden: body.orden ?? 0 },
  });
  return NextResponse.json(categoria);
}
