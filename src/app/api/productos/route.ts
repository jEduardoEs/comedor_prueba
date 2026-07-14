import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/auth";

export async function GET() {
  const sesion = await obtenerSesion();
  if (!sesion) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const productos = await prisma.producto.findMany({
    include: { categoria: true },
    orderBy: [{ categoria: { orden: "asc" } }, { nombre: "asc" }],
  });
  return NextResponse.json(productos);
}

export async function POST(req: NextRequest) {
  const sesion = await obtenerSesion();
  if (!sesion || sesion.rol !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const body = await req.json();

  if (!body.nombre || !body.precio || !body.categoriaId) {
    return NextResponse.json({ error: "Nombre, precio y categoría son requeridos" }, { status: 400 });
  }

  const producto = await prisma.producto.create({
    data: {
      nombre: body.nombre,
      descripcion: body.descripcion || null,
      precio: body.precio,
      categoriaId: body.categoriaId,
      imagenUrl: body.imagenUrl || null,
      activo: body.activo ?? true,
    },
  });
  return NextResponse.json(producto);
}
