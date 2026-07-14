import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/auth";

// Registrar un movimiento manual de inventario (entrada/salida/ajuste) y actualizar stock
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const sesion = await obtenerSesion();
  if (!sesion || sesion.rol !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const { tipo, cantidad, motivo } = await req.json();
  if (!["ENTRADA", "SALIDA", "AJUSTE"].includes(tipo)) {
    return NextResponse.json({ error: "Tipo de movimiento inválido" }, { status: 400 });
  }

  const item = await prisma.inventarioItem.findUnique({ where: { id: params.id } });
  if (!item) return NextResponse.json({ error: "Insumo no encontrado" }, { status: 404 });

  const delta = tipo === "SALIDA" ? -Math.abs(cantidad) : Math.abs(cantidad);

  const actualizado = await prisma.inventarioItem.update({
    where: { id: params.id },
    data: { stockActual: { increment: delta } },
  });

  await prisma.movimientoInventario.create({
    data: { inventarioItemId: params.id, tipo, cantidad: Math.abs(cantidad), motivo },
  });

  return NextResponse.json(actualizado);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const sesion = await obtenerSesion();
  if (!sesion || sesion.rol !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  await prisma.inventarioItem.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
