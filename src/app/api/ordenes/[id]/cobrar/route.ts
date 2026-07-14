import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const sesion = await obtenerSesion();
  if (!sesion) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { metodoPago } = await req.json();
  if (!["EFECTIVO", "TARJETA", "TRANSFERENCIA"].includes(metodoPago)) {
    return NextResponse.json({ error: "Método de pago inválido" }, { status: 400 });
  }

  const orden = await prisma.orden.findUnique({
    where: { id: params.id },
    include: { items: { include: { producto: { include: { recetaInventario: true } } } } },
  });

  if (!orden || orden.estado !== "ABIERTA") {
    return NextResponse.json({ error: "La orden no está abierta" }, { status: 400 });
  }
  if (orden.items.length === 0) {
    return NextResponse.json({ error: "La orden no tiene productos" }, { status: 400 });
  }

  const resultado = await prisma.$transaction(async (tx) => {
    // Cerrar orden
    const ordenCerrada = await tx.orden.update({
      where: { id: orden.id },
      data: { estado: "PAGADA", cerradoEn: new Date() },
    });

    // Registrar pago
    await tx.pago.create({
      data: { ordenId: orden.id, metodoPago, monto: ordenCerrada.total },
    });

    // Liberar mesa
    await tx.mesa.update({ where: { id: orden.mesaId }, data: { estado: "LIBRE" } });

    // Descontar inventario según receta de cada producto vendido
    for (const item of orden.items) {
      for (const receta of item.producto.recetaInventario) {
        const cantidadDescontar = Number(receta.cantidadUsada) * item.cantidad;
        await tx.inventarioItem.update({
          where: { id: receta.inventarioItemId },
          data: { stockActual: { decrement: cantidadDescontar } },
        });
        await tx.movimientoInventario.create({
          data: {
            inventarioItemId: receta.inventarioItemId,
            tipo: "SALIDA",
            cantidad: cantidadDescontar,
            motivo: `Venta orden ${orden.id}`,
          },
        });
      }
    }

    // Sumar al cuadre de caja del día para este usuario
    const inicioDia = new Date();
    inicioDia.setHours(0, 0, 0, 0);

    let cuadre = await tx.cuadreCaja.findFirst({
      where: { usuarioId: sesion.userId, fecha: { gte: inicioDia }, cerrado: false },
    });

    if (!cuadre) {
      cuadre = await tx.cuadreCaja.create({
        data: { usuarioId: sesion.userId, totalEfectivo: 0, totalTarjeta: 0, totalTransfer: 0, totalGeneral: 0 },
      });
    }

    const campoMonto =
      metodoPago === "EFECTIVO" ? "totalEfectivo" : metodoPago === "TARJETA" ? "totalTarjeta" : "totalTransfer";

    await tx.cuadreCaja.update({
      where: { id: cuadre.id },
      data: {
        [campoMonto]: { increment: ordenCerrada.total },
        totalGeneral: { increment: ordenCerrada.total },
      } as any,
    });

    return ordenCerrada;
  });

  return NextResponse.json({ ok: true, orden: resultado });
}
