import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/auth";
import { recalcularTotal } from "@/lib/ordenes";

// Obtiene (o crea) la orden ABIERTA de una mesa
export async function GET(req: NextRequest) {
  const sesion = await obtenerSesion();
  if (!sesion) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const mesaId = req.nextUrl.searchParams.get("mesaId");
  if (!mesaId) return NextResponse.json({ error: "mesaId requerido" }, { status: 400 });

  let orden = await prisma.orden.findFirst({
    where: { mesaId, estado: "ABIERTA" },
    include: { items: { include: { producto: true } }, mesa: true },
  });

  if (!orden) {
    orden = await prisma.orden.create({
      data: { mesaId, usuarioId: sesion.userId, estado: "ABIERTA", total: 0 },
      include: { items: { include: { producto: true } }, mesa: true },
    });
    await prisma.mesa.update({ where: { id: mesaId }, data: { estado: "OCUPADA" } });
  }

  return NextResponse.json(orden);
}

// Agrega o actualiza un item en la orden abierta de una mesa
export async function POST(req: NextRequest) {
  const sesion = await obtenerSesion();
  if (!sesion) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { ordenId, productoId, cantidad } = await req.json();
  if (!ordenId || !productoId || !cantidad) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  const producto = await prisma.producto.findUnique({ where: { id: productoId } });
  if (!producto) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });

  const existente = await prisma.ordenItem.findFirst({ where: { ordenId, productoId } });

  if (existente) {
    await prisma.ordenItem.update({
      where: { id: existente.id },
      data: { cantidad: existente.cantidad + cantidad },
    });
  } else {
    await prisma.ordenItem.create({
      data: {
        ordenId,
        productoId,
        cantidad,
        precioUnitario: producto.precio,
      },
    });
  }

  await recalcularTotal(ordenId);

  const orden = await prisma.orden.findUnique({
    where: { id: ordenId },
    include: { items: { include: { producto: true } }, mesa: true },
  });

  return NextResponse.json(orden);
}
