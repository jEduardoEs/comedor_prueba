import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const sesion = await obtenerSesion();
  if (!sesion || sesion.rol !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const body = await req.json();

  const producto = await prisma.producto.update({
    where: { id: params.id },
    data: {
      nombre: body.nombre,
      descripcion: body.descripcion,
      precio: body.precio,
      categoriaId: body.categoriaId,
      imagenUrl: body.imagenUrl,
      activo: body.activo,
    },
  });
  return NextResponse.json(producto);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const sesion = await obtenerSesion();
  if (!sesion || sesion.rol !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  // No se borra físicamente para no perder historial de ventas; se desactiva.
  const producto = await prisma.producto.update({
    where: { id: params.id },
    data: { activo: false },
  });
  return NextResponse.json(producto);
}
