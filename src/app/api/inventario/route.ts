import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/auth";

export async function GET() {
  const sesion = await obtenerSesion();
  if (!sesion || sesion.rol !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const items = await prisma.inventarioItem.findMany({ orderBy: { nombre: "asc" } });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const sesion = await obtenerSesion();
  if (!sesion || sesion.rol !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const body = await req.json();
  const item = await prisma.inventarioItem.create({
    data: {
      nombre: body.nombre,
      unidad: body.unidad,
      stockActual: body.stockActual ?? 0,
      stockMinimo: body.stockMinimo ?? 0,
    },
  });
  return NextResponse.json(item);
}
