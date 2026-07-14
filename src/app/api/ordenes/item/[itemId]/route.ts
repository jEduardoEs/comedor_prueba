import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/auth";
import { recalcularTotal } from "@/lib/ordenes";

export async function PATCH(req: NextRequest, { params }: { params: { itemId: string } }) {
  const sesion = await obtenerSesion();
  if (!sesion) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { cantidad } = await req.json();
  const item = await prisma.ordenItem.findUnique({ where: { id: params.itemId } });
  if (!item) return NextResponse.json({ error: "Item no encontrado" }, { status: 404 });

  if (cantidad <= 0) {
    await prisma.ordenItem.delete({ where: { id: params.itemId } });
  } else {
    await prisma.ordenItem.update({ where: { id: params.itemId }, data: { cantidad } });
  }

  await recalcularTotal(item.ordenId);

  const orden = await prisma.orden.findUnique({
    where: { id: item.ordenId },
    include: { items: { include: { producto: true } }, mesa: true },
  });
  return NextResponse.json(orden);
}

export async function DELETE(_req: NextRequest, { params }: { params: { itemId: string } }) {
  const sesion = await obtenerSesion();
  if (!sesion) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const item = await prisma.ordenItem.findUnique({ where: { id: params.itemId } });
  if (!item) return NextResponse.json({ error: "Item no encontrado" }, { status: 404 });

  await prisma.ordenItem.delete({ where: { id: params.itemId } });
  await recalcularTotal(item.ordenId);

  const orden = await prisma.orden.findUnique({
    where: { id: item.ordenId },
    include: { items: { include: { producto: true } }, mesa: true },
  });
  return NextResponse.json(orden);
}
